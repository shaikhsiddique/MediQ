/**
 * Baseline diabetic risk from demographics, family history, and optional vitals
 * (signup quick assessment or profile without a full lifestyle report).
 */
const calculateBaselineScore = ({
  bmi,
  heredityHistory = {},
  glucoseLevel,
  heartRate,
  bloodPressure,
  hba1c,
} = {}) => {
  let score = 0;

  if (bmi > 30) score += 15;
  else if (bmi > 25) score += 8;

  if (heredityHistory.diabetes) score += 12;
  if (heredityHistory.heartDisease) score += 5;
  if (heredityHistory.hypertension) score += 4;
  if (heredityHistory.obesity) score += 4;

  if (glucoseLevel != null) {
    if (glucoseLevel > 140) score += 25;
    else if (glucoseLevel > 110) score += 15;
    else if (glucoseLevel > 99) score += 8;
  }

  if (hba1c != null) {
    if (hba1c >= 6.5) score += 20;
    else if (hba1c >= 5.7) score += 10;
  }

  if (heartRate != null) {
    if (heartRate > 100) score += 6;
    else if (heartRate < 50) score += 4;
  }

  const systolic = bloodPressure?.systolic;
  const diastolic = bloodPressure?.diastolic;
  if (systolic > 140 || diastolic > 90) score += 8;
  else if (systolic > 130 || diastolic > 85) score += 4;

  const diabeticScore = Math.min(100, Math.round(score));
  const isDiabetic = diabeticScore >= 60;

  let riskLevel = "low";
  if (diabeticScore >= 60) riskLevel = "high";
  else if (diabeticScore >= 35) riskLevel = "medium";

  return { diabeticScore, isDiabetic, riskLevel };
};

module.exports = calculateBaselineScore;
