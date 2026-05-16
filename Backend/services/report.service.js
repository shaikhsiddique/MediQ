const ApiError = require("../utils/ApiError");
const Report = require("../models/report.model");
const Patient = require("../models/patient.model");
const Doctor = require("../models/doctor.model");
const {
  analyzeHealthData,
  analyzeUploadedFile,
} = require("./gemini.service");

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

const createReport = async (patientId, data, doctorId = null) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  let geminiResult = {};
  try {
    geminiResult = await analyzeHealthData(data, buildPatientContext(patient));
  } catch (err) {
    console.error("Gemini analysis failed, using fallback:", err.message);
  }

  const report = await Report.create({
    ...data,
    ...geminiResult,
    sourceType: "form",
    patient: patientId,
    doctor: doctorId || patient.doctor,
  });

  if (geminiResult.healthSummary) {
    patient.healthSummary = geminiResult.healthSummary;
  }
  patient.reports.push(report._id);
  await patient.save();

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

  const geminiResult = await analyzeUploadedFile(
    file.path,
    file.mimetype,
    notes,
    buildPatientContext(patient)
  );

  const extracted = geminiResult.extractedData || {};

  const report = await Report.create({
    glucoseLevel: extracted.glucoseLevel ?? undefined,
    additionalOverallRemarks: notes || extracted.notes || "",
    diabeticRiskScore: geminiResult.diabeticRiskScore,
    riskLevel: geminiResult.riskLevel,
    recommendation: geminiResult.recommendation,
    healthSummary: geminiResult.healthSummary,
    aiConfidence: geminiResult.confidence,
    analyzedByGemini: true,
    sourceType: "upload",
    attachedFile: file.filename,
    attachedFileName: file.originalname,
    attachedFileMime: file.mimetype,
    patient: patientId,
    doctor: doctorId || patient.doctor,
  });

  if (geminiResult.healthSummary) {
    patient.healthSummary = geminiResult.healthSummary;
  }
  patient.diabeticScore = geminiResult.diabeticRiskScore;
  patient.isDiabetic = geminiResult.riskLevel === "high";
  patient.reports.push(report._id);
  await patient.save();

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

  await report.deleteOne();
  return { message: "Report deleted" };
};

module.exports = {
  createReport,
  uploadAndAnalyzeReport,
  getReports,
  getAllReportsForDoctor,
  getReportById,
  updateReport,
  deleteReport,
  assertReportAccess,
};
