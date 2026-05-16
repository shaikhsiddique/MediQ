const ApiError = require("../utils/ApiError");
const Patient = require("../models/patient.model");
const Doctor = require("../models/doctor.model");
const Health = require("../models/health.model");
const calculateBaselineScore = require("../utils/calculateBaselineScore");

const getProfile = async (patientId) => {
  const patient = await Patient.findById(patientId)
    .populate("doctor", "name email specialization phone")
    .populate({
      path: "healthRecords",
      options: { sort: { recordedAt: -1 }, limit: 10 },
    })
    .populate({
      path: "reports",
      options: { sort: { reportDate: -1 }, limit: 10 },
    });

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  return patient;
};

const updateProfile = async (patientId, updates) => {
  const { quickAssessment, ...profileUpdates } = updates;

  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  Object.assign(patient, profileUpdates);

  if (quickAssessment) {
    const latest = await Health.findOne({ patient: patientId }).sort({
      recordedAt: -1,
    });

    const vitalPayload = {
      ...quickAssessment,
      height: patient.height,
      weight: patient.weight,
    };

    if (latest) {
      Object.assign(latest, vitalPayload);
      await latest.save();
    } else {
      const health = await Health.create({
        ...vitalPayload,
        patient: patientId,
      });
      patient.healthRecords.push(health._id);
    }
  }

  const latestHealth = await Health.findOne({ patient: patientId }).sort({
    recordedAt: -1,
  });

  const baseline = calculateBaselineScore({
    bmi: patient.bmi,
    heredityHistory: patient.heredityHistory,
    glucoseLevel: latestHealth?.glucoseLevel,
    heartRate: latestHealth?.heartRate,
    bloodPressure: latestHealth?.bloodPressure,
    hba1c: latestHealth?.hba1c,
  });
  patient.diabeticScore = baseline.diabeticScore;
  patient.isDiabetic = baseline.isDiabetic;

  await patient.save();
  return patient;
};

const getPatientByIdForDoctor = async (doctorId, patientId) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  const isAssigned = doctor.patients.some(
    (id) => id.toString() === patientId.toString()
  );

  if (!isAssigned) {
    throw new ApiError(403, "Patient is not assigned to this doctor");
  }

  const patient = await Patient.findById(patientId)
    .populate({ path: "healthRecords", options: { sort: { recordedAt: -1 } } })
    .populate({ path: "reports", options: { sort: { reportDate: -1 } } });

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  return patient;
};

module.exports = {
  getProfile,
  updateProfile,
  getPatientByIdForDoctor,
};
