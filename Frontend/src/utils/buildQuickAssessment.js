export function buildQuickAssessment(vitals) {
  const qa = {};
  const numericFields = [
    "heartRate",
    "glucoseLevel",
    "oxygenSaturation",
    "bodyTemperature",
    "respiratoryRate",
    "hba1c",
  ];

  numericFields.forEach((key) => {
    const val = vitals[key];
    if (val !== "" && val != null) qa[key] = Number(val);
  });

  const sys = vitals.bloodPressure?.systolic;
  const dia = vitals.bloodPressure?.diastolic;
  if (sys || dia) {
    qa.bloodPressure = {};
    if (sys) qa.bloodPressure.systolic = Number(sys);
    if (dia) qa.bloodPressure.diastolic = Number(dia);
  }

  return Object.keys(qa).length ? qa : undefined;
}
