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

const assignPatient = async (doctorId, patientId) => {
  const [doctor, patient] = await Promise.all([
    Doctor.findById(doctorId),
    Patient.findById(patientId),
  ]);

  if (!doctor) throw new ApiError(404, "Doctor not found");
  if (!patient) throw new ApiError(404, "Patient not found");

  if (!doctor.patients.some((id) => id.toString() === patientId)) {
    doctor.patients.push(patient._id);
    await doctor.save();
  }

  patient.doctor = doctor._id;
  await patient.save();

  return patient;
};

const removePatient = async (doctorId, patientId) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, "Doctor not found");

  doctor.patients = doctor.patients.filter(
    (id) => id.toString() !== patientId
  );
  await doctor.save();

  const patient = await Patient.findById(patientId);
  if (patient?.doctor?.toString() === doctorId) {
    patient.doctor = undefined;
    await patient.save();
  }

  return { message: "Patient removed from doctor's list" };
};

module.exports = {
  getProfile,
  getPatients,
  assignPatient,
  removePatient,
};
