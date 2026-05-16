const express = require("express");
const healthController = require("../controllers/health.controller");
const validate = require("../middleware/validate.middleware");
const { authenticate } = require("../middleware/auth.middleware");
const {
  createHealthSchema,
  updateHealthSchema,
} = require("../validators/health.validator");

const router = express.Router();

router.use(authenticate("patient", "doctor"));

router.post("/", validate(createHealthSchema), healthController.createHealth);
router.get("/", healthController.getHealthRecords);
router.get("/patient/:patientId", healthController.getHealthRecords);
router.get("/:id", healthController.getHealthById);
router.put("/:id", validate(updateHealthSchema), healthController.updateHealth);
router.delete("/:id", healthController.deleteHealth);

module.exports = router;
