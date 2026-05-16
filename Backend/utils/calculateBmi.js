const calculateBmi = (weightKg, heightCm) => {
  if (!weightKg || !heightCm || heightCm <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
};

module.exports = calculateBmi;
