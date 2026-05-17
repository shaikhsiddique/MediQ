const express = require("express");
const reportController = require("../controllers/report.controller");
const validate = require("../middleware/validate.middleware");
const { authenticate } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");
const parseReportBody = require("../middleware/parseReportBody.middleware");
const {
  createReportSchema,
  updateReportSchema,
  kidsBuddyReportSchema,
} = require("../validators/report.validator");

const router = express.Router();

router.use(authenticate("patient", "doctor"));

router.post(
  "/upload",
  upload.single("file"),
  reportController.uploadAndAnalyze
);
router.post(
  "/kids-buddy",
  authenticate("patient"),
  validate(kidsBuddyReportSchema),
  reportController.createKidsBuddyReport
);
router.post(
  "/",
  upload.single("file"),
  parseReportBody,
  validate(createReportSchema),
  reportController.createReport
);
router.get("/", reportController.getReports);
router.get("/patient/:patientId", reportController.getPatientReports);
router.get("/:id", reportController.getReportById);
router.put("/:id", validate(updateReportSchema), reportController.updateReport);
router.delete("/:id", reportController.deleteReport);

module.exports = router;
