const ApiError = require("../utils/ApiError");
const Report = require("../models/report.model");
const Patient = require("../models/patient.model");
const Doctor = require("../models/doctor.model");
const {
  analyzeHealthData,
  analyzeUploadedFile,
} = require("./ai.service");
const { mapKidsBuddyToReport } = require("../utils/mapKidsBuddyReport");
const { refreshPatientSummaries } = require("./patientSummary.service");
const { extractTextFromDocument } = require("./ocr.service");
const { buildDocumentUrl } = require("../utils/documentUrl");
const { parseLabValuesFromText } = require("../utils/parseLabValues");

const assertReportAccess = async (requesterId, role, patientId) => {
  if (role === "patient" && requesterId.toString() !== patientId.toString()) {
    throw new ApiError(403, "Access denied");
  }

  if (role === "doctor") {
    const doctor = await Doctor.findById(requesterId);
    const isAssigned = doctor?.patients.some(
      (id) => id.toString() === patientId.toString()
    );
    if (!isAssigned) {
      throw new ApiError(403, "Patient is not assigned to this doctor");
    }
  }
};

const buildPatientContext = (patient) => ({
  name: patient.name,
  age: patient.age,
  gender: patient.gender,
  bmi: patient.bmi,
  heredityHistory: patient.heredityHistory,
  healthSummary: patient.healthSummary,
});

const attachDocumentToPatient = async (
  patient,
  { documentUrl, fileName, mimeType, reportId }
) => {
  if (!documentUrl) return;

  patient.documents = patient.documents || [];
  patient.documents.push({
    url: documentUrl,
    fileName: fileName || "",
    mimeType: mimeType || "",
    reportId,
    uploadedAt: new Date(),
  });
};

const processFileUpload = async (file) => {
  const documentUrl = buildDocumentUrl(file.filename);
  const extractedText = await extractTextFromDocument(file.path, file.mimetype);
  return { documentUrl, extractedText };
};

const createReport = async (
  patientId,
  data,
  doctorId = null,
  file = null
) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  let documentUrl = "";
  let extractedText = "";
  let fileMeta = {};

  if (file) {
    const processed = await processFileUpload(file);
    documentUrl = processed.documentUrl;
    extractedText = processed.extractedText;
    fileMeta = {
      attachedFile: file.filename,
      attachedFileName: file.originalname,
      attachedFileMime: file.mimetype,
    };
  }

  const parsedLabs = extractedText ? parseLabValuesFromText(extractedText) : {};
  const mergedData = {
    ...data,
    ...(parsedLabs.glucoseLevel != null && data.glucoseLevel == null
      ? { glucoseLevel: parsedLabs.glucoseLevel }
      : {}),
  };

  const analysisPayload = {
    ...mergedData,
    ...(extractedText
      ? {
          uploadedReportText: extractedText,
          parsedLabs,
          additionalOverallRemarks: [mergedData.additionalOverallRemarks, extractedText]
            .filter(Boolean)
            .join("\n\n--- Extracted from uploaded report ---\n")
            .trim(),
        }
      : {}),
  };

  let aiResult = {};
  try {
    if (file) {
      aiResult = await analyzeUploadedFile(
        file.path,
        file.mimetype,
        mergedData.additionalOverallRemarks || "",
        buildPatientContext(patient),
        extractedText,
        analysisPayload
      );
    } else {
      aiResult = await analyzeHealthData(
        analysisPayload,
        buildPatientContext(patient)
      );
    }
  } catch (err) {
    console.error("AI analysis failed, using fallback:", err.message);
  }

  const report = await Report.create({
    ...mergedData,
    ...aiResult,
    aiConfidence: aiResult.confidence ?? aiResult.aiConfidence,
    ...fileMeta,
    documentUrl,
    extractedText,
    sourceType: "form",
    patient: patientId,
    doctor: doctorId || patient.doctor,
  });

  if (documentUrl) {
    await attachDocumentToPatient(patient, {
      documentUrl,
      fileName: file?.originalname,
      mimeType: file?.mimetype,
      reportId: report._id,
    });
  }

  if (aiResult.healthSummary) {
    patient.latestHealthSummary = aiResult.healthSummary;
  }
  if (aiResult.diabeticRiskScore != null) {
    patient.diabeticScore = aiResult.diabeticRiskScore;
    patient.isDiabetic = aiResult.riskLevel === "high";
  }
  patient.reports.push(report._id);
  await patient.save();
  await refreshPatientSummaries(patientId);

  return report;
};

const uploadAndAnalyzeReport = async (
  patientId,
  file,
  notes = "",
  doctorId = null
) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  const { documentUrl, extractedText } = await processFileUpload(file);
  const parsedLabs = parseLabValuesFromText(extractedText);

  const aiResult = await analyzeUploadedFile(
    file.path,
    file.mimetype,
    notes,
    buildPatientContext(patient),
    extractedText
  );

  const extracted = aiResult.extractedData || {};

  const report = await Report.create({
    glucoseLevel:
      extracted.glucoseLevel ?? parsedLabs.glucoseLevel ?? undefined,
    additionalOverallRemarks:
      notes ||
      extracted.notes ||
      (extractedText ? extractedText.slice(0, 500) : ""),
    diabeticRiskScore: aiResult.diabeticRiskScore,
    riskLevel: aiResult.riskLevel,
    recommendation: aiResult.recommendation,
    healthSummary: aiResult.healthSummary,
    aiConfidence: aiResult.confidence,
    analyzedByGemini: true,
    sourceType: "upload",
    attachedFile: file.filename,
    attachedFileName: file.originalname,
    attachedFileMime: file.mimetype,
    documentUrl,
    extractedText,
    patient: patientId,
    doctor: doctorId || patient.doctor,
  });

  await attachDocumentToPatient(patient, {
    documentUrl,
    fileName: file.originalname,
    mimeType: file.mimetype,
    reportId: report._id,
  });

  if (aiResult.healthSummary) {
    patient.latestHealthSummary = aiResult.healthSummary;
  }
  patient.diabeticScore = aiResult.diabeticRiskScore;
  patient.isDiabetic = aiResult.riskLevel === "high";
  patient.reports.push(report._id);
  await patient.save();
  await refreshPatientSummaries(patientId);

  return report;
};

const createKidsBuddyReport = async (patientId, payload) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  const { answers, totalScore, maxScore, language } = payload;
  const mapped = mapKidsBuddyToReport(
    answers,
    totalScore,
    maxScore,
    language
  );

  const report = await Report.create({
    ...mapped,
    sourceType: "kids_buddy",
    analyzedByGemini: false,
    patient: patientId,
    doctor: patient.doctor,
    kidsBuddyData: { answers, totalScore, maxScore, language },
    reportDate: new Date(),
  });

  patient.latestHealthSummary = mapped.healthSummary;
  patient.reports.push(report._id);
  await patient.save();
  await refreshPatientSummaries(patientId);

  return report;
};

const getReports = async (patientId) => {
  return Report.find({ patient: patientId }).sort({ reportDate: -1 });
};

const getAllReportsForDoctor = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  return Report.find({ patient: { $in: doctor.patients } })
    .populate("patient", "name email phone")
    .sort({ reportDate: -1 });
};

const getReportById = async (reportId, requesterId, role) => {
  const report = await Report.findById(reportId).populate(
    "patient",
    "name email"
  );

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  await assertReportAccess(requesterId, role, report.patient._id || report.patient);
  return report;
};

const updateReport = async (reportId, updates, requesterId, role) => {
  const report = await Report.findById(reportId);
  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  await assertReportAccess(requesterId, role, report.patient);

  Object.assign(report, updates);
  await report.save();
  return report;
};

const deleteReport = async (reportId, requesterId, role) => {
  const report = await Report.findById(reportId);
  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  await assertReportAccess(requesterId, role, report.patient);

  await Patient.findByIdAndUpdate(report.patient, {
    $pull: { reports: report._id },
  });

  const patientId = report.patient;
  await report.deleteOne();
  await refreshPatientSummaries(patientId);
  return { message: "Report deleted" };
};

module.exports = {
  createReport,
  createKidsBuddyReport,
  uploadAndAnalyzeReport,
  getReports,
  getAllReportsForDoctor,
  getReportById,
  updateReport,
  deleteReport,
  assertReportAccess,
};
