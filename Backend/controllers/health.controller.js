const asyncHandler = require("../utils/asyncHandler");
const healthService = require("../services/health.service");

const createHealth = asyncHandler(async (req, res) => {
  const patientId =
    req.userRole === "patient" ? req.userId : req.body.patientId || req.params.patientId;

  if (req.userRole === "doctor") {
    await healthService.assertPatientAccess(req.userId, req.userRole, patientId);
  }

  const health = await healthService.createHealthRecord(patientId, req.body);
  res.status(201).json({ success: true, health });
});

const getHealthRecords = asyncHandler(async (req, res) => {
  const patientId =
    req.userRole === "patient" ? req.userId : req.params.patientId;

  if (req.userRole === "doctor") {
    await healthService.assertPatientAccess(req.userId, req.userRole, patientId);
  }

  const records = await healthService.getHealthRecords(patientId);
  res.json({ success: true, records });
});

const getHealthById = asyncHandler(async (req, res) => {
  const health = await healthService.getHealthById(
    req.params.id,
    req.userId,
    req.userRole
  );
  res.json({ success: true, health });
});

const updateHealth = asyncHandler(async (req, res) => {
  const health = await healthService.updateHealthRecord(
    req.params.id,
    req.body,
    req.userId,
    req.userRole
  );
  res.json({ success: true, health });
});

const deleteHealth = asyncHandler(async (req, res) => {
  const result = await healthService.deleteHealthRecord(
    req.params.id,
    req.userId,
    req.userRole
  );
  res.json({ success: true, ...result });
});

module.exports = {
  createHealth,
  getHealthRecords,
  getHealthById,
  updateHealth,
  deleteHealth,
};
