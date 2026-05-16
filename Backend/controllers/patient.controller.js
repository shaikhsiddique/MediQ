const asyncHandler = require("../utils/asyncHandler");
const patientService = require("../services/patient.service");

const getProfile = asyncHandler(async (req, res) => {
  const patient = await patientService.getProfile(req.userId);
  res.json({ success: true, patient });
});

const updateProfile = asyncHandler(async (req, res) => {
  const patient = await patientService.updateProfile(req.userId, req.body);
  res.json({ success: true, patient });
});

const getPatientById = asyncHandler(async (req, res) => {
  const patient = await patientService.getPatientByIdForDoctor(
    req.userId,
    req.params.patientId
  );
  res.json({ success: true, patient });
});

module.exports = { getProfile, updateProfile, getPatientById };
