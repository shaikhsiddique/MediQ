const express = require("express");
const patientController = require("../controllers/patient.controller");
const validate = require("../middleware/validate.middleware");
const { authenticate } = require("../middleware/auth.middleware");
const { updatePatientSchema } = require("../validators/patient.validator");
const {
  linkDoctorSchema,
  lookupEmailSchema,
} = require("../validators/link.validator");

const router = express.Router();

router.use(authenticate("patient"));

router.get("/profile", patientController.getProfile);
router.put("/profile", validate(updatePatientSchema), patientController.updateProfile);
router.get("/risk-progression", patientController.getRiskProgression);
router.post("/refresh-summary", patientController.refreshSummary);

router.get(
  "/doctors/lookup",
  validate(lookupEmailSchema, "query"),
  patientController.lookupDoctor
);
router.post(
  "/link-doctor",
  validate(linkDoctorSchema),
  patientController.linkDoctor
);
router.delete("/link-doctor", patientController.unlinkDoctor);

module.exports = router;
