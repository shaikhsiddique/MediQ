const asyncHandler = require("../utils/asyncHandler");
const monitorService = require("../services/monitor.service");

const getStatus = asyncHandler(async (req, res) => {
  const status = await monitorService.getStatus(req.userId);
  res.json({ success: true, data: status });
});

const start = asyncHandler(async (req, res) => {
  const status = await monitorService.startMonitoring(req.userId);
  res.json({
    success: true,
    message: "DiabetesGuard monitoring started. Parent SMS alerts active every 5 minutes.",
    data: status,
  });
});

const stop = asyncHandler(async (req, res) => {
  const result = monitorService.stopMonitoring(req.userId);
  res.json({ success: true, data: result });
});

const checkNow = asyncHandler(async (req, res) => {
  const result = await monitorService.runCheck(req.userId);
  res.json({ success: true, data: result });
});

module.exports = { getStatus, start, stop, checkNow };
