const twilio = require("twilio");
const normalizePhone = require("../utils/normalizePhone");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let client = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

const isTwilioConfigured = () => Boolean(client && fromNumber);

/* ── removed isParentAlertConfigured() — parent number now comes per-user ── */

async function verifyTwilioConnection() {
  if (!isTwilioConfigured()) {
    return { connected: false, error: "Twilio credentials are not configured" };
  }
  try {
    await client.api.accounts(accountSid).fetch();
    return { connected: true };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

async function sendSMS(to, body) {
  if (!isTwilioConfigured()) {
    throw new Error("Twilio is not configured. Check your .env file.");
  }
  const normalized = normalizePhone(to);
  if (!normalized) {
    throw new Error(`Invalid phone number: ${to}`);
  }
  return client.messages.create({ body, from: fromNumber, to: normalized });
}

/**
 * Send guardian alert to the patient's own guardianPhone (stored on their profile).
 * @param {string} childName
 * @param {string} riskLevel
 * @param {string[]} reasons
 * @param {string} guardianPhone  — patient.guardianPhone from DB, NOT from .env
 */
async function sendSMSAlert(childName, riskLevel, reasons = [], guardianPhone) {
  if (!isTwilioConfigured()) {
    throw new Error("Twilio is not configured. Check your .env file.");
  }

  if (!guardianPhone) {
    throw new Error(
      "No guardian phone number on this account. Please add one in your profile."
    );
  }

  const name       = childName || "Patient";
  const level      = String(riskLevel || "HIGH").toUpperCase();
  const reasonText =
    Array.isArray(reasons) && reasons.length > 0
      ? reasons.join(", ")
      : "Multiple health indicators out of range";

  const body = `ALERT: ${name} is at ${level} risk.
Reasons: ${reasonText}
Please consult a doctor immediately.
- DiabetesGuard`;

  return sendSMS(guardianPhone, body);
}

/**
 * Notify patient and doctor on their profile phone numbers when linked.
 */
async function sendLinkNotifications({ patient, doctor, initiatedBy }) {
  const results = { patient: null, doctor: null };

  if (!isTwilioConfigured()) {
    return { sent: false, error: "Twilio not configured", results };
  }

  const patientName = patient?.name || "Patient";
  const doctorName  = doctor?.name ? `Dr. ${doctor.name}` : "Your doctor";
  const initiator   =
    initiatedBy === "doctor"  ? doctorName  :
    initiatedBy === "patient" ? patientName : "mediQ";

  const patientMsg = `DiabetesGuard: You are now linked with ${doctorName} (${doctor?.specialization || "physician"}). Your health updates will be shared with your care team. Phone on file: ${patient?.phone || "—"}`;
  const doctorMsg  = `DiabetesGuard: ${patientName} is now linked to your patient list. Contact: ${patient?.phone || "—"} · ${patient?.email || ""}. Linked by ${initiator}.`;

  if (patient?.phone) {
    try {
      await sendSMS(patient.phone, patientMsg);
      results.patient = { sent: true, to: normalizePhone(patient.phone) };
    } catch (err) {
      results.patient = { sent: false, error: err.message };
    }
  } else {
    results.patient = { sent: false, error: "Patient has no phone on profile" };
  }

  if (doctor?.phone) {
    try {
      await sendSMS(doctor.phone, doctorMsg);
      results.doctor = { sent: true, to: normalizePhone(doctor.phone) };
    } catch (err) {
      results.doctor = { sent: false, error: err.message };
    }
  } else {
    results.doctor = { sent: false, error: "Doctor has no phone on profile" };
  }

  return { sent: Boolean(results.patient?.sent || results.doctor?.sent), results };
}

async function sendRiskAlertToDoctor(doctor, patient, riskLevel, reasons = []) {
  if (!doctor?.phone || !isTwilioConfigured()) return { sent: false };

  const reasonText = reasons.length > 0 ? reasons.join(", ") : "Elevated risk indicators";
  const body = `DiabetesGuard — Patient alert
${patient?.name || "Patient"} is at ${String(riskLevel).toUpperCase()} risk.
Reasons: ${reasonText}
Please review their chart in your dashboard.`;

  try {
    await sendSMS(doctor.phone, body);
    return { sent: true };
  } catch (err) {
    console.error("[DiabetesGuard] Doctor risk SMS failed:", err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = {
  sendSMS,
  sendSMSAlert,
  sendLinkNotifications,
  sendRiskAlertToDoctor,
  isTwilioConfigured,
  verifyTwilioConnection,
};