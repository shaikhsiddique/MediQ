const ApiError = require("../utils/ApiError");
const Doctor = require("../models/doctor.model");
const Patient = require("../models/patient.model");

const getProfile = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId).populate(
    "patients",
    "name email phone age gender diabeticScore isDiabetic bmi createdAt"
  );

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  return doctor;
};

const getPatients = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId).populate({
    path: "patients",
    select:
      "name email phone age gender height weight bmi diabeticScore isDiabetic healthSummary createdAt",
    options: { sort: { createdAt: -1 } },
  });

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  return doctor.patients;
};

const linkService = require("./link.service");

const assignPatient = async (doctorId, patientId) => {
  const result = await linkService.doctorLinksPatient(doctorId, { patientId });
  return result.patient;
};

const assignPatientByEmail = async (doctorId, patientEmail) => {
  const result = await linkService.doctorLinksPatient(doctorId, { patientEmail });
  return result;
};

const removePatient = async (doctorId, patientId) => {
  return linkService.doctorUnlinksPatient(doctorId, patientId);
};

module.exports = {
  getProfile,
  getPatients,
  assignPatient,
  assignPatientByEmail,
  removePatient,
};
