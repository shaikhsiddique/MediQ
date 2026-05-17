const ApiError = require("../utils/ApiError");
const Doctor = require("../models/doctor.model");
const Patient = require("../models/patient.model");
const { sendLinkNotifications } = require("./twilioService");

const doctorPublicFields = "name email phone specialization licenseNumber";
const patientPublicFields = "name email phone age gender";

const linkPatientAndDoctor = async (patientId, doctorId, initiatedBy = "system") => {
  const [patient, doctor] = await Promise.all([
    Patient.findById(patientId),
    Doctor.findById(doctorId),
  ]);

  if (!patient) throw new ApiError(404, "Patient not found");
  if (!doctor) throw new ApiError(404, "Doctor not found");

  const alreadyLinked =
    patient.doctor?.toString() === doctorId.toString() &&
    doctor.patients.some((id) => id.toString() === patientId.toString());

  if (!doctor.patients.some((id) => id.toString() === patientId.toString())) {
    doctor.patients.push(patient._id);
    await doctor.save();
  }

  patient.doctor = doctor._id;
  await patient.save();

  let notifications = { sent: false, skipped: true };
  if (!alreadyLinked) {
    try {
      notifications = await sendLinkNotifications({
        patient,
        doctor,
        initiatedBy,
      });
    } catch (err) {
      console.error("[DiabetesGuard] Link notifications failed:", err.message);
      notifications = { sent: false, error: err.message };
    }
  }

  const populated = await Patient.findById(patientId).populate(
    "doctor",
    doctorPublicFields
  );

  return {
    patient: populated,
    alreadyLinked,
    notifications,
  };
};

const unlinkPatientAndDoctor = async (patientId, doctorId) => {
  const [patient, doctor] = await Promise.all([
    Patient.findById(patientId),
    Doctor.findById(doctorId),
  ]);

  if (!patient) throw new ApiError(404, "Patient not found");
  if (!doctor) throw new ApiError(404, "Doctor not found");

  doctor.patients = doctor.patients.filter(
    (id) => id.toString() !== patientId.toString()
  );
  await doctor.save();

  if (patient.doctor?.toString() === doctorId.toString()) {
    patient.doctor = undefined;
    await patient.save();
  }

  return { message: "Doctor and patient unlinked" };
};

const lookupDoctorByEmail = async (email) => {
  const doctor = await Doctor.findOne({ email: email.toLowerCase().trim() }).select(
    doctorPublicFields
  );
  if (!doctor) {
    throw new ApiError(404, "No doctor found with this email");
  }
  return doctor;
};

const lookupPatientByEmail = async (email) => {
  const patient = await Patient.findOne({
    email: email.toLowerCase().trim(),
  }).select(patientPublicFields);
  if (!patient) {
    throw new ApiError(404, "No patient found with this email");
  }
  return patient;
};

const patientLinksDoctor = async (patientId, { doctorId, doctorEmail }) => {
  let doctor;
  if (doctorId) {
    doctor = await Doctor.findById(doctorId);
    if (!doctor) throw new ApiError(404, "Doctor not found");
  } else if (doctorEmail) {
    doctor = await lookupDoctorByEmail(doctorEmail);
  } else {
    throw new ApiError(400, "doctorId or doctorEmail is required");
  }

  return linkPatientAndDoctor(patientId, doctor._id, "patient");
};

const doctorLinksPatient = async (doctorId, { patientId, patientEmail }) => {
  let patient;
  if (patientId) {
    patient = await Patient.findById(patientId);
    if (!patient) throw new ApiError(404, "Patient not found");
  } else if (patientEmail) {
    patient = await lookupPatientByEmail(patientEmail);
  } else {
    throw new ApiError(400, "patientId or patientEmail is required");
  }

  return linkPatientAndDoctor(patient._id, doctorId, "doctor");
};

const patientUnlinksDoctor = async (patientId) => {
  const patient = await Patient.findById(patientId);
  if (!patient?.doctor) {
    throw new ApiError(400, "No doctor is linked to your account");
  }
  return unlinkPatientAndDoctor(patientId, patient.doctor.toString());
};

const doctorUnlinksPatient = async (doctorId, patientId) => {
  return unlinkPatientAndDoctor(patientId, doctorId);
};

module.exports = {
  linkPatientAndDoctor,
  unlinkPatientAndDoctor,
  lookupDoctorByEmail,
  lookupPatientByEmail,
  patientLinksDoctor,
  doctorLinksPatient,
  patientUnlinksDoctor,
  doctorUnlinksPatient,
};
