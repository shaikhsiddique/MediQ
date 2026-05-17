const Doctor = require("../models/doctor.model");
const { sendSMSAlert, sendRiskAlertToDoctor } = require("./twilioService");

const buildReasons = ({ report, healthRecord }) => {
  const reasons = [];

  const heartRate = healthRecord?.heartRate;
  if (heartRate != null && heartRate > 100) {
    reasons.push("High heart rate");
  }

  const sleepHours = report?.sleepHours;
  if (sleepHours != null && sleepHours < 6) {
    reasons.push("Poor sleep");
  }

  const activity = report?.physicalActivity;
  if (activity != null && activity < 4) {
    reasons.push("Low activity");
  }

  const glucose = report?.glucoseLevel ?? healthRecord?.glucoseLevel;
  if (glucose != null && glucose > 140) {
    reasons.push("High glucose");
  }

  const stress = report?.stressLevel;
  if (stress != null && stress >= 7) {
    reasons.push("High stress");
  }

  const hba1c = healthRecord?.hba1c;
  if (hba1c != null && hba1c >= 6.5) {
    reasons.push("Elevated HbA1c");
  }

  if (report?.riskLevel === "high" && reasons.length === 0) {
    reasons.push("High diabetes risk score");
  }

  return reasons;
};

const computeRiskLevel = ({ patient, report, healthRecord }) => {
  if (report?.riskLevel === "high" || patient?.isDiabetic) {
    return "HIGH";
  }

  const score = report?.diabeticRiskScore ?? patient?.diabeticScore ?? 0;

  if (score >= 60 || report?.riskLevel === "high") {
    return "HIGH";
  }
  if (score >= 35 || report?.riskLevel === "medium") {
    return "MEDIUM";
  }
  return "LOW";
};

async function evaluatePatientRisk({ patient, report, healthRecord }) {
  const childName = patient?.name || "Patient";
  const riskLevel = computeRiskLevel({ patient, report, healthRecord });
  const reasons = buildReasons({ report, healthRecord });
  const score = report?.diabeticRiskScore ?? patient?.diabeticScore ?? null;

  let smsSent = false;
  let smsError = null;
  let doctorSmsSent = false;

  if (riskLevel === "HIGH") {
    try {
      await sendSMSAlert(childName, riskLevel, reasons);
      smsSent = true;
    } catch (err) {
      smsError = err.message;
      console.error("[DiabetesGuard] Parent SMS alert failed:", err.message);
    }

    if (patient?.doctor) {
      try {
        const doctor = await Doctor.findById(patient.doctor).select(
          "name phone email"
        );
        if (doctor) {
          const docResult = await sendRiskAlertToDoctor(
            doctor,
            patient,
            riskLevel,
            reasons
          );
          doctorSmsSent = docResult.sent;
        }
      } catch (err) {
        console.error("[DiabetesGuard] Doctor SMS alert failed:", err.message);
      }
    }
  }

  return {
    childName,
    riskLevel,
    reasons,
    score,
    smsSent,
    smsError,
    doctorSmsSent,
    checkedAt: new Date().toISOString(),
    isCritical: riskLevel === "HIGH",
  };
}

module.exports = {
  evaluatePatientRisk,
  computeRiskLevel,
  buildReasons,
};
