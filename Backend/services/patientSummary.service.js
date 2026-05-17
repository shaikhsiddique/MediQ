const Report = require("../models/report.model");
const Patient = require("../models/patient.model");
const { summarizeMonthlyReports } = require("./ai.service");

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

const buildFallbackMonthlySummary = (reports) => {
  if (!reports.length) {
    return "No health reports in the last 30 days.";
  }

  const lines = reports.map((r, i) => {
    const date = new Date(r.reportDate).toLocaleDateString("en-GB");
    const score = r.diabeticRiskScore ?? "—";
    const level = r.riskLevel || "unknown";
    const snippet = (r.healthSummary || r.recommendation || "").slice(0, 120);
    return `${i + 1}. ${date} — Risk ${score}% (${level})${snippet ? `: ${snippet}` : ""}`;
  });

  const avg =
    reports.reduce((s, r) => s + (r.diabeticRiskScore || 0), 0) / reports.length;

  return [
    `Summary of ${reports.length} report(s) from the last 30 days.`,
    `Average risk score: ${Math.round(avg)}%.`,
    "",
    ...lines,
  ].join("\n");
};

/**
 * Recomputes latestHealthSummary (most recent report) and
 * monthlyHealthSummary (AI aggregate of last 30 days).
 */
const refreshPatientSummaries = async (patientId) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    return null;
  }

  const allReports = await Report.find({ patient: patientId }).sort({
    reportDate: -1,
  });

  const latest = allReports[0];
  patient.latestHealthSummary = latest?.healthSummary || "";

  const cutoff = new Date(Date.now() - MONTH_MS);
  const monthlyReports = allReports.filter(
    (r) => new Date(r.reportDate) >= cutoff
  );

  if (monthlyReports.length === 0) {
    patient.monthlyHealthSummary =
      "No health reports in the last 30 days. Complete a health test to generate your monthly summary.";
    patient.monthlySummaryUpdatedAt = new Date();
    await patient.save();
    return patient;
  }

  const reportPayload = monthlyReports.map((r) => ({
    reportDate: r.reportDate,
    diabeticRiskScore: r.diabeticRiskScore,
    riskLevel: r.riskLevel,
    healthSummary: r.healthSummary,
    recommendation: r.recommendation,
    glucoseLevel: r.glucoseLevel,
    sourceType: r.sourceType,
  }));

  const patientContext = {
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    bmi: patient.bmi,
    diabeticScore: patient.diabeticScore,
  };

  try {
    const monthly = await summarizeMonthlyReports(reportPayload, patientContext);
    patient.monthlyHealthSummary = monthly.summary || buildFallbackMonthlySummary(monthlyReports);
  } catch (err) {
    console.error("Monthly summary failed, using fallback:", err.message);
    patient.monthlyHealthSummary = buildFallbackMonthlySummary(monthlyReports);
  }

  patient.monthlySummaryUpdatedAt = new Date();
  await patient.save();
  return patient;
};

module.exports = { refreshPatientSummaries, MONTH_MS };
