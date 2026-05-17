const cron = require("node-cron");

const { evaluatePatientRisk } = require("./riskEngine");
const {
  isTwilioConfigured,
  verifyTwilioConnection,
} = require("./twilioService");

const Patient = require("../models/patient.model");
const Report = require("../models/report.model");
const Health = require("../models/health.model");

const monitors = new Map();
const CRON_EXPR = "*/5 * * * *";

async function loadPatientSnapshot(patientId) {
  const patient = await Patient.findById(patientId).select(
    "name email phone diabeticScore isDiabetic doctor"
  );
  if (!patient) {
    throw new Error("Patient not found");
  }

  const [report, healthRecord] = await Promise.all([
    Report.findOne({ patient: patientId }).sort({ reportDate: -1 }),
    Health.findOne({ patient: patientId }).sort({ recordedAt: -1 }),
  ]);

  return { patient, report, healthRecord };
}

async function runCheck(patientId) {
  const snapshot = await loadPatientSnapshot(patientId);
  const result = await evaluatePatientRisk(snapshot);

  const entry = monitors.get(patientId.toString());
  if (entry) {
    entry.lastResult = result;
    entry.lastCheckAt = new Date().toISOString();
    entry.checkCount = (entry.checkCount || 0) + 1;
    if (result.isCritical) {
      entry.criticalCount = (entry.criticalCount || 0) + 1;
    }
  }

  return result;
}

async function startMonitoring(patientId) {
  const id = patientId.toString();

  if (monitors.has(id)) {
    return getStatus(patientId);
  }

  const twilio = await verifyTwilioConnection();
  if (!twilio.connected) {
    throw new Error(twilio.error || "Twilio connection failed");
  }

  const initial = await runCheck(id);

  const task = cron.schedule(CRON_EXPR, () => {
    runCheck(id).catch((err) => {
      console.error("[DiabetesGuard] Scheduled check failed:", err.message);
    });
  });

  monitors.set(id, {
    patientId: id,
    task,
    startedAt: new Date().toISOString(),
    lastCheckAt: initial.checkedAt,
    lastResult: initial,
    checkCount: 1,
    criticalCount: initial.isCritical ? 1 : 0,
    twilioConnected: true,
  });

  return getStatus(patientId);
}

function stopMonitoring(patientId) {
  const id = patientId.toString();
  const entry = monitors.get(id);

  if (!entry) {
    return { active: false, message: "Monitoring was not running" };
  }

  if (entry.task) {
    entry.task.stop();
  }
  monitors.delete(id);

  return {
    active: false,
    stoppedAt: new Date().toISOString(),
    message: "Guardian monitoring stopped",
  };
}

async function getStatus(patientId) {
  const id = patientId?.toString();
  const entry = id ? monitors.get(id) : null;
  const twilio = await verifyTwilioConnection();

  return {
    active: Boolean(entry),
    twilioConfigured: isTwilioConfigured(),
    twilioConnected: twilio.connected,
    twilioError: twilio.error || null,
    intervalMinutes: 5,
    startedAt: entry?.startedAt || null,
    lastCheckAt: entry?.lastCheckAt || null,
    checkCount: entry?.checkCount || 0,
    criticalCount: entry?.criticalCount || 0,
    lastResult: entry?.lastResult || null,
  };
}

module.exports = {
  startMonitoring,
  stopMonitoring,
  getStatus,
  runCheck,
};
