const path = require("path");

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const SUMMARIES = {
  low: "Vitals within normal range. Continue healthy habits and routine checkups.",
  medium:
    "Some lifestyle markers need attention. Monitor glucose and sleep patterns closely.",
  high:
    "Elevated diabetes risk indicators detected. Immediate medical consultation recommended.",
};

function buildReportPayload(riskProfile, daysAgo) {
  const isHigh = riskProfile === "high";
  const isMedium = riskProfile === "medium";

  const glucose = isHigh ? rand(155, 220) : isMedium ? rand(115, 155) : rand(85, 110);
  const sleepHours = isHigh ? rand(3, 5) : isMedium ? rand(5, 6) : rand(7, 9);
  const physicalActivity = isHigh ? rand(1, 3) : isMedium ? rand(3, 5) : rand(6, 9);
  const stressLevel = isHigh ? rand(7, 10) : isMedium ? rand(5, 7) : rand(2, 4);

  let diabeticRiskScore = isHigh ? rand(62, 92) : isMedium ? rand(38, 58) : rand(12, 32);
  let riskLevel = isHigh ? "high" : isMedium ? "medium" : "low";

  const reportDate = new Date();
  reportDate.setDate(reportDate.getDate() - daysAgo);

  return {
    glucoseLevel: glucose,
    sleepHours,
    physicalActivity,
    healthyEating: rand(3, 9),
    waterIntakeLitres: Number((rand(15, 35) / 10).toFixed(1)),
    stressLevel,
    energyLevel: isHigh ? rand(2, 5) : rand(5, 9),
    excessiveThirst: isHigh ? rand(6, 10) : rand(1, 5),
    frequentUrination: isHigh ? rand(6, 9) : rand(1, 4),
    weightKg: rand(45, 85),
    heightCm: rand(150, 185),
    diabeticRiskScore,
    riskLevel,
    recommendation: SUMMARIES[riskLevel],
    healthSummary: SUMMARIES[riskLevel],
    sourceType: "form",
    analyzedByGemini: false,
    reportDate,
  };
}

function buildHealthPayload(riskProfile, daysAgo) {
  const isHigh = riskProfile === "high";
  const recordedAt = new Date();
  recordedAt.setDate(recordedAt.getDate() - daysAgo);

  return {
    heartRate: isHigh ? rand(105, 125) : rand(68, 95),
    glucoseLevel: isHigh ? rand(160, 210) : rand(90, 130),
    bloodPressure: {
      systolic: isHigh ? rand(135, 155) : rand(110, 125),
      diastolic: isHigh ? rand(88, 98) : rand(70, 82),
    },
    oxygenSaturation: rand(95, 99),
    bodyTemperature: Number((36 + Math.random()).toFixed(1)),
    respiratoryRate: rand(14, 20),
    hba1c: isHigh ? Number((6.5 + Math.random()).toFixed(1)) : Number((4.8 + Math.random() * 0.8).toFixed(1)),
    weight: rand(45, 85),
    height: rand(150, 185),
    notes: `[DUMMY DATA] Generated for testing — ${riskProfile} risk profile`,
    recordedAt,
  };
}

async function generateDummyData({
  Patient,
  Report,
  Health,
  patientId,
  count = 5,
  riskProfile = "mixed",
}) {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new Error("Patient not found");
  }

  const profiles =
    riskProfile === "mixed"
      ? ["low", "medium", "high", "medium", "high"]
      : Array(count).fill(riskProfile);

  const created = { reports: [], healthRecords: [] };

  for (let i = 0; i < count; i++) {
    const profile = profiles[i % profiles.length];
    const daysAgo = rand(0, 28);

    const report = await Report.create({
      ...buildReportPayload(profile, daysAgo),
      patient: patientId,
      doctor: patient.doctor,
    });

    const health = await Health.create({
      ...buildHealthPayload(profile, daysAgo),
      patient: patientId,
    });

    patient.reports.push(report._id);
    patient.healthRecords = patient.healthRecords || [];
    patient.healthRecords.push(health._id);
    created.reports.push(report);
    created.healthRecords.push(health);
  }

  const latest = created.reports.sort(
    (a, b) => new Date(b.reportDate) - new Date(a.reportDate)
  )[0];

  if (latest) {
    patient.diabeticScore = latest.diabeticRiskScore;
    patient.isDiabetic = latest.riskLevel === "high";
    patient.latestHealthSummary = latest.healthSummary;
  }

  await patient.save();

  return {
    patientId: patient._id.toString(),
    patientName: patient.name,
    reportsCreated: created.reports.length,
    healthRecordsCreated: created.healthRecords.length,
    latestRisk: latest?.riskLevel,
    latestScore: latest?.diabeticRiskScore,
  };
}

module.exports = { generateDummyData, buildReportPayload, buildHealthPayload };
