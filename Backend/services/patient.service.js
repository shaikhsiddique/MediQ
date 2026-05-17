const ApiError = require("../utils/ApiError");
const Patient = require("../models/patient.model");
const Doctor = require("../models/doctor.model");
const Health = require("../models/health.model");
const Report = require("../models/report.model");
const calculateBaselineScore = require("../utils/calculateBaselineScore");

const getProfile = async (patientId) => {
  const patient = await Patient.findById(patientId)
    .populate("doctor", "name email specialization phone")
    .populate({
      path: "healthRecords",
      options: { sort: { recordedAt: -1 }, limit: 10 },
    })
    .populate({
      path: "reports",
      options: { sort: { reportDate: -1 }, limit: 10 },
    });

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  return patient;
};

// NEW: Get historical risk progression analysis
const getRiskProgression = async (patientId) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  const reports = await Report.find({ patient: patientId }).sort({
    reportDate: 1,
  });

  if (reports.length === 0) {
    return {
      hasData: false,
      message: "No reports found. Complete a health assessment to see trends.",
      currentRisk: patient.diabeticScore,
      currentRiskLevel: patient.isDiabetic ? "high" : "low",
    };
  }

  const progression = calculateProgression(reports, patient);

  return {
    hasData: true,
    patientId: patient._id,
    patientName: patient.name,
    analysisStartDate: reports[0].reportDate,
    analysisEndDate: reports[reports.length - 1].reportDate,
    totalReports: reports.length,
    ...progression,
    recommendations: generateProgressionRecommendations(progression),
  };
};

// Helper function to calculate progression metrics
const calculateProgression = (reports, patient) => {
  const scores = reports.map((r) => r.diabeticRiskScore || 0);
  const glucoseLevels = reports
    .map((r) => r.glucoseLevel)
    .filter((g) => g != null);
  const bmiScores = reports.map((r) => r.bmiScore).filter((b) => b != null);

  // Calculate averages
  const avgRiskScore =
    scores.reduce((sum, s) => sum + s, 0) / scores.length || 0;
  const avgGlucose =
    glucoseLevels.length > 0
      ? glucoseLevels.reduce((sum, g) => sum + g, 0) / glucoseLevels.length
      : null;
  const avgBmi =
    bmiScores.length > 0
      ? bmiScores.reduce((sum, b) => sum + b, 0) / bmiScores.length
      : null;

  // Calculate trend (linear regression simplified)
  const firstScore = scores[0] || 0;
  const lastScore = scores[scores.length - 1] || 0;
  const scoreChange = lastScore - firstScore;
  const percentageChange =
    firstScore > 0 ? ((scoreChange / firstScore) * 100).toFixed(2) : 0;

  // Determine trend direction
  let trendDirection = "stable";
  if (Math.abs(scoreChange) <= 5) {
    trendDirection = "stable";
  } else if (scoreChange > 0) {
    trendDirection = "increasing";
  } else {
    trendDirection = "decreasing";
  }

  // Calculate risk level distribution
  const riskDistribution = {
    low: reports.filter((r) => r.riskLevel === "low").length,
    medium: reports.filter((r) => r.riskLevel === "medium").length,
    high: reports.filter((r) => r.riskLevel === "high").length,
  };

  // Lifestyle metrics analysis
  const lifestyleMetrics = analyzeLifestyleMetrics(reports);

  return {
    currentRiskScore: lastScore,
    currentRiskLevel: reports[reports.length - 1]?.riskLevel || "unknown",
    averageRiskScore: avgRiskScore.toFixed(2),
    initialRiskScore: firstScore,
    scoreChange: scoreChange.toFixed(2),
    percentageChange: parseFloat(percentageChange),
    trendDirection,
    riskDistribution,
    glucoseMetrics: {
      average: avgGlucose ? avgGlucose.toFixed(2) : null,
      latest: glucoseLevels[glucoseLevels.length - 1] || null,
      trend:
        glucoseLevels.length > 1
          ? glucoseLevels[glucoseLevels.length - 1] - glucoseLevels[0]
          : 0,
    },
    bmiMetrics: {
      average: avgBmi ? avgBmi.toFixed(2) : null,
      latest: bmiScores[bmiScores.length - 1] || null,
      trend: bmiScores.length > 1 ? bmiScores[bmiScores.length - 1] - bmiScores[0] : 0,
    },
    lifestyleMetrics,
    reportTimeline: reports.map((r) => ({
      date: r.reportDate,
      riskScore: r.diabeticRiskScore,
      riskLevel: r.riskLevel,
      glucoseLevel: r.glucoseLevel,
      bmi: r.bmiScore,
    })),
  };
};

// Helper function to analyze lifestyle metrics
const analyzeLifestyleMetrics = (reports) => {
  const metrics = {
    sleepHours: [],
    physicalActivity: [],
    stressLevel: [],
    waterIntake: [],
    healthyEating: [],
  };

  reports.forEach((r) => {
    if (r.sleepHours) metrics.sleepHours.push(r.sleepHours);
    if (r.physicalActivity) metrics.physicalActivity.push(r.physicalActivity);
    if (r.stressLevel) metrics.stressLevel.push(r.stressLevel);
    if (r.waterIntakeLitres) metrics.waterIntake.push(r.waterIntakeLitres);
    if (r.healthyEating) metrics.healthyEating.push(r.healthyEating);
  });

  const calculateAvg = (arr) =>
    arr.length > 0 ? (arr.reduce((sum, v) => sum + v, 0) / arr.length).toFixed(2) : null;

  return {
    averageSleepHours: calculateAvg(metrics.sleepHours),
    averagePhysicalActivity: calculateAvg(metrics.physicalActivity),
    averageStressLevel: calculateAvg(metrics.stressLevel),
    averageWaterIntake: calculateAvg(metrics.waterIntake),
    averageHealthyEating: calculateAvg(metrics.healthyEating),
  };
};

// Helper function to generate recommendations based on progression
const generateProgressionRecommendations = (progression) => {
  const recommendations = [];

  // Risk score recommendations
  if (progression.trendDirection === "increasing") {
    recommendations.push({
      category: "risk_trend",
      priority: "high",
      message: `Your diabetic risk score has increased by ${Math.abs(
        progression.scoreChange
      )} points (${Math.abs(
        progression.percentageChange
      )}%) across your reports. Please consult your doctor for a comprehensive evaluation.`,
    });
  } else if (progression.trendDirection === "decreasing") {
    recommendations.push({
      category: "risk_trend",
      priority: "positive",
      message: `Great progress! Your diabetic risk score has decreased by ${Math.abs(
        progression.scoreChange
      )} points (${Math.abs(
        progression.percentageChange
      )}%) across your reports. Keep up the good work!`,
    });
  } else {
    recommendations.push({
      category: "risk_trend",
      priority: "medium",
      message:
        "Your diabetic risk score has remained relatively stable. Continue monitoring your health regularly.",
    });
  }

  // Glucose recommendations
  if (progression.glucoseMetrics.average) {
    const avgGlucose = parseFloat(progression.glucoseMetrics.average);
    if (avgGlucose > 125) {
      recommendations.push({
        category: "glucose",
        priority: "high",
        message: `Your average glucose level (${avgGlucose.toFixed(
          1
        )} mg/dL) is elevated. Consider dietary changes and consult your healthcare provider.`,
      });
    } else if (avgGlucose > 100) {
      recommendations.push({
        category: "glucose",
        priority: "medium",
        message: `Your average glucose level (${avgGlucose.toFixed(
          1
        )} mg/dL) is in the pre-diabetic range. Focus on lifestyle modifications.`,
      });
    }
  }

  // BMI recommendations
  if (progression.bmiMetrics.average) {
    const avgBmi = parseFloat(progression.bmiMetrics.average);
    if (avgBmi > 30) {
      recommendations.push({
        category: "bmi",
        priority: "high",
        message: `Your average BMI (${avgBmi.toFixed(
          1
        )}) indicates obesity. Weight management is crucial for diabetes prevention.`,
      });
    } else if (avgBmi > 25) {
      recommendations.push({
        category: "bmi",
        priority: "medium",
        message: `Your average BMI (${avgBmi.toFixed(
          1
        )}) indicates overweight. Consider a balanced diet and regular exercise.`,
      });
    }
  }

  // Lifestyle recommendations
  const lifestyle = progression.lifestyleMetrics;
  if (lifestyle.averageSleepHours && parseFloat(lifestyle.averageSleepHours) < 6) {
    recommendations.push({
      category: "lifestyle",
      priority: "medium",
      message: `Your average sleep (${lifestyle.averageSleepHours} hours) is below recommended levels. Aim for 7-9 hours per night.`,
    });
  }

  if (
    lifestyle.averagePhysicalActivity &&
    parseFloat(lifestyle.averagePhysicalActivity) < 5
  ) {
    recommendations.push({
      category: "lifestyle",
      priority: "medium",
      message:
        "Your physical activity levels are low. Try to incorporate at least 150 minutes of moderate exercise per week.",
    });
  }

  if (lifestyle.averageStressLevel && parseFloat(lifestyle.averageStressLevel) > 7) {
    recommendations.push({
      category: "lifestyle",
      priority: "medium",
      message:
        "Your stress levels are high. Consider stress management techniques like meditation or yoga.",
    });
  }

  return recommendations;
};

const updateProfile = async (patientId, updates) => {
  const { quickAssessment, ...profileUpdates } = updates;

  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  Object.assign(patient, profileUpdates);

  if (quickAssessment) {
    const latest = await Health.findOne({ patient: patientId }).sort({
      recordedAt: -1,
    });

    const vitalPayload = {
      ...quickAssessment,
      height: patient.height,
      weight: patient.weight,
    };

    if (latest) {
      Object.assign(latest, vitalPayload);
      await latest.save();
    } else {
      const health = await Health.create({
        ...vitalPayload,
        patient: patientId,
      });
      patient.healthRecords.push(health._id);
    }
  }

  const latestHealth = await Health.findOne({ patient: patientId }).sort({
    recordedAt: -1,
  });

  const baseline = calculateBaselineScore({
    bmi: patient.bmi,
    heredityHistory: patient.heredityHistory,
    glucoseLevel: latestHealth?.glucoseLevel,
    heartRate: latestHealth?.heartRate,
    bloodPressure: latestHealth?.bloodPressure,
    hba1c: latestHealth?.hba1c,
  });
  patient.diabeticScore = baseline.diabeticScore;
  patient.isDiabetic = baseline.isDiabetic;

  await patient.save();
  return patient;
};

const getPatientByIdForDoctor = async (doctorId, patientId) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  const isAssigned = doctor.patients.some(
    (id) => id.toString() === patientId.toString()
  );

  if (!isAssigned) {
    throw new ApiError(403, "Patient is not assigned to this doctor");
  }

  const patient = await Patient.findById(patientId)
    .populate({ path: "healthRecords", options: { sort: { recordedAt: -1 } } })
    .populate({ path: "reports", options: { sort: { reportDate: -1 } } });

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  return patient;
};

module.exports = {
  getProfile,
  updateProfile,
  getPatientByIdForDoctor,
  getRiskProgression, // NEW export
};