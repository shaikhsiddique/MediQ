const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/auth.service");

const registerPatient = asyncHandler(async (req, res) => {
  const result = await authService.registerPatient(req.body);
  res.status(201).json({ success: true, ...result });
});

const registerDoctor = asyncHandler(async (req, res) => {
  const result = await authService.registerDoctor(req.body);
  res.status(201).json({ success: true, ...result });
});

const loginPatient = asyncHandler(async (req, res) => {
  const result = await authService.loginPatient(req.body);
  res.json({ success: true, ...result });
});

const loginDoctor = asyncHandler(async (req, res) => {
  const result = await authService.loginDoctor(req.body);
  res.json({ success: true, ...result });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.userId, req.userRole);
  res.json({ success: true, user });
});

module.exports = {
  registerPatient,
  registerDoctor,
  loginPatient,
  loginDoctor,
  getMe,
};
