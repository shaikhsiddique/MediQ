const express = require("express");
const doctorController = require("../controllers/doctor.controller");
const patientController = require("../controllers/patient.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate("doctor"));

router.get("/profile", doctorController.getProfile);
router.get("/patients", doctorController.getPatients);
router.post("/patients/:patientId", doctorController.assignPatient);
router.delete("/patients/:patientId", doctorController.removePatient);
router.get("/patients/:patientId", patientController.getPatientById);

module.exports = router;
