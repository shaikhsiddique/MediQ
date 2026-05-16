const asyncHandler = require("../utils/asyncHandler");
const doctorService = require("../services/doctor.service");

const getProfile = asyncHandler(async (req, res) => {
  const doctor = await doctorService.getProfile(req.userId);
  res.json({ success: true, doctor });
});

const getPatients = asyncHandler(async (req, res) => {
  const patients = await doctorService.getPatients(req.userId);
  res.json({ success: true, patients });
});

const assignPatient = asyncHandler(async (req, res) => {
  const patient = await doctorService.assignPatient(
    req.userId,
    req.params.patientId
  );
  res.json({ success: true, patient });
});

const removePatient = asyncHandler(async (req, res) => {
  const result = await doctorService.removePatient(
    req.userId,
    req.params.patientId
  );
  res.json({ success: true, ...result });
});

module.exports = { getProfile, getPatients, assignPatient, removePatient };
