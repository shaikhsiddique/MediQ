const asyncHandler = require("../utils/asyncHandler");
const reportService = require("../services/report.service");

const createReport = asyncHandler(async (req, res) => {
  const patientId =
    req.userRole === "patient"
      ? req.userId
      : req.body.patientId || req.params.patientId;

  if (!patientId) {
    return res.status(400).json({
      success: false,
      message: "patientId is required for doctor-created reports",
    });
  }

  if (req.userRole === "doctor") {
    await reportService.assertReportAccess(
      req.userId,
      req.userRole,
      patientId
    );
  }

  const { patientId: _omit, ...reportData } = req.body;
  const doctorId = req.userRole === "doctor" ? req.userId : null;
  const report = await reportService.createReport(
    patientId,
    reportData,
    doctorId
  );
  res.status(201).json({ success: true, report });
});

const getReports = asyncHandler(async (req, res) => {
  if (req.userRole === "doctor") {
    const reports = await reportService.getAllReportsForDoctor(req.userId);
    return res.json({ success: true, reports });
  }

  const reports = await reportService.getReports(req.userId);
  res.json({ success: true, reports });
});

const getPatientReports = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const reports = await reportService.getReports(patientId);
  res.json({ success: true, reports });
});

const getReportById = asyncHandler(async (req, res) => {
  const report = await reportService.getReportById(
    req.params.id,
    req.userId,
    req.userRole
  );
  res.json({ success: true, report });
});

const updateReport = asyncHandler(async (req, res) => {
  const report = await reportService.updateReport(
    req.params.id,
    req.body,
    req.userId,
    req.userRole
  );
  res.json({ success: true, report });
});

const deleteReport = asyncHandler(async (req, res) => {
  const result = await reportService.deleteReport(
    req.params.id,
    req.userId,
    req.userRole
  );
  res.json({ success: true, ...result });
});

const uploadAndAnalyze = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "A file is required (PDF, image, or text)",
    });
  }

  const patientId =
    req.userRole === "patient"
      ? req.userId
      : req.body.patientId || req.params.patientId;

  if (!patientId) {
    return res.status(400).json({
      success: false,
      message: "patientId is required for doctor uploads",
    });
  }

  if (req.userRole === "doctor") {
    await reportService.assertReportAccess(
      req.userId,
      req.userRole,
      patientId
    );
  }

  const doctorId = req.userRole === "doctor" ? req.userId : null;
  const report = await reportService.uploadAndAnalyzeReport(
    patientId,
    req.file,
    req.body.notes || "",
    doctorId
  );

  res.status(201).json({ success: true, report });
});

module.exports = {
  createReport,
  uploadAndAnalyze,
  getReports,
  getPatientReports,
  getReportById,
  updateReport,
  deleteReport,
};
