const express = require("express");
const monitorController = require("../controllers/monitor.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate("patient"));

router.get("/status", monitorController.getStatus);
router.post("/start", monitorController.start);
router.post("/stop", monitorController.stop);
router.post("/check", monitorController.checkNow);

module.exports = router;
