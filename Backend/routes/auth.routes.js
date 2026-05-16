const express = require("express");
const authController = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { authenticate } = require("../middleware/auth.middleware");
const {
  registerPatientSchema,
  registerDoctorSchema,
  loginSchema,
} = require("../validators/auth.validator");

const router = express.Router();

router.post(
  "/register/patient",
  validate(registerPatientSchema),
  authController.registerPatient
);

router.post(
  "/register/doctor",
  validate(registerDoctorSchema),
  authController.registerDoctor
);

router.post(
  "/login/patient",
  validate(loginSchema),
  authController.loginPatient
);

router.post(
  "/login/doctor",
  validate(loginSchema),
  authController.loginDoctor
);

router.get("/me", authenticate("patient", "doctor"), authController.getMe);

module.exports = router;
