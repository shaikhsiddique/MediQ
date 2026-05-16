/**
 * Returns diabetic risk score 0–100 and whether patient is flagged diabetic (score >= 60).
 */
const calculateDiabeticScore = ({
  glucoseLevel,
  sleepHours,
  physicalActivity,
  healthyEating,
  stressLevel,
  energyLevel,
  excessiveThirst,
  frequentUrination,
  bmi,
  heredityHistory = {},
}) => {
  let score = 0;

  if (glucoseLevel > 140) score += 25;
  else if (glucoseLevel > 110) score += 15;
  else if (glucoseLevel > 99) score += 8;

  if (sleepHours != null) {
    score += Math.max(0, (7 - sleepHours) * 3);
  }

  if (physicalActivity != null) {
    score += Math.max(0, (8 - physicalActivity) * 2);
  }

  if (healthyEating != null) {
    score += Math.max(0, (8 - healthyEating) * 1.5);
  }

  if (stressLevel != null) {
    score += stressLevel * 2;
  }

  if (energyLevel != null) {
    score += Math.max(0, (7 - energyLevel) * 1.5);
  }

  if (excessiveThirst != null) {
    score += excessiveThirst * 3;
  }

  if (frequentUrination != null) {
    score += frequentUrination * 3;
  }

  if (bmi > 30) score += 15;
  else if (bmi > 25) score += 8;

  if (heredityHistory?.diabetes) score += 12;
  if (heredityHistory?.heartDisease) score += 5;
  if (heredityHistory?.hypertension) score += 4;
  if (heredityHistory?.obesity) score += 4;

  const diabeticScore = Math.min(100, Math.round(score));
  const isDiabetic = diabeticScore >= 60;

  let riskLevel = "low";
  if (diabeticScore >= 60) riskLevel = "high";
  else if (diabeticScore >= 35) riskLevel = "medium";

  return { diabeticScore, isDiabetic, riskLevel };
};

module.exports = calculateDiabeticScore;
