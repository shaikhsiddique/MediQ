const ApiError = require("../utils/ApiError");
const Health = require("../models/health.model");
const Patient = require("../models/patient.model");
const Doctor = require("../models/doctor.model");

const assertPatientAccess = async (requesterId, role, patientId) => {
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

const createHealthRecord = async (patientId, data) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  const health = await Health.create({ ...data, patient: patientId });
  patient.healthRecords.push(health._id);
  await patient.save();

  return health;
};

const getHealthRecords = async (patientId) => {
  return Health.find({ patient: patientId }).sort({ recordedAt: -1 });
};

const getHealthById = async (healthId, requesterId, role) => {
  const health = await Health.findById(healthId);
  if (!health) {
    throw new ApiError(404, "Health record not found");
  }

  await assertPatientAccess(requesterId, role, health.patient);
  return health;
};

const updateHealthRecord = async (healthId, updates, requesterId, role) => {
  const health = await Health.findById(healthId);
  if (!health) {
    throw new ApiError(404, "Health record not found");
  }

  await assertPatientAccess(requesterId, role, health.patient);

  Object.assign(health, updates);
  await health.save();
  return health;
};

const deleteHealthRecord = async (healthId, requesterId, role) => {
  const health = await Health.findById(healthId);
  if (!health) {
    throw new ApiError(404, "Health record not found");
  }

  await assertPatientAccess(requesterId, role, health.patient);

  await Patient.findByIdAndUpdate(health.patient, {
    $pull: { healthRecords: health._id },
  });

  await health.deleteOne();
  return { message: "Health record deleted" };
};

module.exports = {
  createHealthRecord,
  getHealthRecords,
  getHealthById,
  updateHealthRecord,
  deleteHealthRecord,
  assertPatientAccess,
};
