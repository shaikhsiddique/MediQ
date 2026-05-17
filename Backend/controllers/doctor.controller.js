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
  const result = await require("../services/link.service").doctorLinksPatient(
    req.userId,
    { patientId: req.params.patientId }
  );
  res.json({
    success: true,
    message: "Patient linked. SMS notifications sent to both phone numbers on file.",
    patient: result.patient,
    notifications: result.notifications,
  });
});

const assignPatientByEmail = asyncHandler(async (req, res) => {
  const result = await doctorService.assignPatientByEmail(
    req.userId,
    req.body.patientEmail
  );
  res.json({
    success: true,
    message: "Patient linked. SMS notifications sent to both phone numbers on file.",
    patient: result.patient,
    notifications: result.notifications,
  });
});

const lookupPatient = asyncHandler(async (req, res) => {
  const patient = await require("../services/link.service").lookupPatientByEmail(
    req.query.email
  );
  res.json({ success: true, data: patient });
});

const removePatient = asyncHandler(async (req, res) => {
  const result = await doctorService.removePatient(
    req.userId,
    req.params.patientId
  );
  res.json({ success: true, ...result });
});

module.exports = {
  getProfile,
  getPatients,
  assignPatient,
  assignPatientByEmail,
  lookupPatient,
  removePatient,
};
