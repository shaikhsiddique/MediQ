const express = require("express");
const authRoutes = require("./auth.routes");
const patientRoutes = require("./patient.routes");
const doctorRoutes = require("./doctor.routes");
const healthRoutes = require("./health.routes");
const reportRoutes = require("./report.routes");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, message: "mediQ API is running" });
});

router.use("/auth", authRoutes);
router.use("/patients", patientRoutes);
router.use("/doctors", doctorRoutes);
router.use("/health-records", healthRoutes);
router.use("/reports", reportRoutes);

module.exports = router;
