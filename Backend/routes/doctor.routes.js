const express = require("express");
const doctorController = require("../controllers/doctor.controller");
const patientController = require("../controllers/patient.controller");
const validate = require("../middleware/validate.middleware");
const { authenticate } = require("../middleware/auth.middleware");
const {
  linkPatientSchema,
  lookupEmailSchema,
} = require("../validators/link.validator");

const router = express.Router();

router.use(authenticate("doctor"));

router.get("/profile", doctorController.getProfile);
router.get("/patients", doctorController.getPatients);
router.get(
  "/patients/lookup",
  validate(lookupEmailSchema, "query"),
  doctorController.lookupPatient
);
router.post(
  "/patients/link",
  validate(linkPatientSchema),
  doctorController.assignPatientByEmail
);
router.post("/patients/:patientId", doctorController.assignPatient);
router.delete("/patients/:patientId", doctorController.removePatient);
router.get("/patients/:patientId", patientController.getPatientById);
router.get(
  "/patients/:patientId/risk-progression",
  patientController.getPatientRiskProgression
);

module.exports = router;
