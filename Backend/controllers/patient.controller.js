const asyncHandler = require("../utils/asyncHandler");
const patientService = require("../services/patient.service");
const linkService = require("../services/link.service");
const { refreshPatientSummaries } = require("../services/patientSummary.service");

const getProfile = asyncHandler(async (req, res) => {
  const patient = await patientService.getProfile(req.userId);
  res.json({ success: true, data: patient });
});

const updateProfile = asyncHandler(async (req, res) => {
  const patient = await patientService.updateProfile(req.userId, req.body);
  res.json({ success: true, data: patient });
});

const getRiskProgression = asyncHandler(async (req, res) => {
  const progression = await patientService.getRiskProgression(req.userId);
  res.json({ success: true, data: progression });
});

const getPatientById = asyncHandler(async (req, res) => {
  const patient = await patientService.getPatientByIdForDoctor(
    req.userId,
    req.params.patientId
  );
  res.json({ success: true, patient });
});

const getPatientRiskProgression = asyncHandler(async (req, res) => {
  await patientService.getPatientByIdForDoctor(
    req.userId,
    req.params.patientId
  );
  const progression = await patientService.getRiskProgression(
    req.params.patientId
  );
  res.json({ success: true, data: progression });
});

const refreshSummary = asyncHandler(async (req, res) => {
  const patient = await refreshPatientSummaries(req.userId);
  res.json({ success: true, data: patient });
});

const lookupDoctor = asyncHandler(async (req, res) => {
  const doctor = await linkService.lookupDoctorByEmail(req.query.email);
  res.json({ success: true, data: doctor });
});

const linkDoctor = asyncHandler(async (req, res) => {
  const result = await linkService.patientLinksDoctor(req.userId, req.body);
  res.json({
    success: true,
    message: "Linked with your doctor. SMS notifications sent to both phone numbers on file.",
    data: result.patient,
    notifications: result.notifications,
  });
});

const unlinkDoctor = asyncHandler(async (req, res) => {
  await linkService.patientUnlinksDoctor(req.userId);
  const patient = await patientService.getProfile(req.userId);
  res.json({
    success: true,
    message: "Doctor unlinked from your account",
    data: patient,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  getRiskProgression,
  refreshSummary,
  lookupDoctor,
  linkDoctor,
  unlinkDoctor,
  getPatientById,
  getPatientRiskProgression,
};
