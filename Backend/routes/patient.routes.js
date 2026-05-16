const express = require("express");
const patientController = require("../controllers/patient.controller");
const validate = require("../middleware/validate.middleware");
const { authenticate } = require("../middleware/auth.middleware");
const { updatePatientSchema } = require("../validators/patient.validator");

const router = express.Router();

router.use(authenticate("patient"));

router.get("/profile", patientController.getProfile);
router.put("/profile", validate(updatePatientSchema), patientController.updateProfile);

module.exports = router;
