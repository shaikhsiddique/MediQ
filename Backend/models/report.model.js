const mongoose = require("mongoose");
const calculateBmi = require("../utils/calculateBmi");
const calculateDiabeticScore = require("../utils/calculateDiabeticScore");

const fieldRemarkSchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    remark: { type: String, default: "" },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    weightKg: {
      type: Number,
      min: 0,
    },
    heightCm: {
      type: Number,
      min: 0,
    },
    bmiScore: {
      type: Number,
      min: 0,
    },
    glucoseLevel: {
      type: Number,
      min: 0,
      comment: "mg/dL",
    },
    sleepHours: {
      type: Number,
      min: 0,
      max: 24,
    },
    physicalActivity: {
      type: Number,
      min: 0,
      max: 10,
    },
    healthyEating: {
      type: Number,
      min: 0,
      max: 10,
    },
    waterIntakeLitres: {
      type: Number,
      min: 0,
    },
    stressLevel: {
      type: Number,
      min: 0,
      max: 10,
    },
    energyLevel: {
      type: Number,
      min: 0,
      max: 10,
    },
    excessiveThirst: {
      type: Number,
      min: 0,
      max: 10,
    },
    frequentUrination: {
      type: Number,
      min: 0,
      max: 10,
    },
    additionalOverallRemarks: {
      type: String,
      default: "",
      trim: true,
    },
    fieldRemarks: [fieldRemarkSchema],
    reportDate: {
      type: Date,
      default: Date.now,
    },
    diabeticRiskScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
    },
    recommendation: {
      type: String,
      default: "",
    },
    analyzedByGemini: {
      type: Boolean,
      default: false,
    },
    aiConfidence: {
      type: Number,
      min: 0,
      max: 100,
    },
    healthSummary: {
      type: String,
      default: "",
    },
    sourceType: {
      type: String,
      enum: ["form", "upload"],
      default: "form",
    },
    attachedFile: {
      type: String,
      default: "",
    },
    attachedFileName: {
      type: String,
      default: "",
    },
    attachedFileMime: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

reportSchema.pre("save", async function computeMetrics() {
  if (this.weightKg && this.heightCm) {
    this.bmiScore = calculateBmi(this.weightKg, this.heightCm);
  }

  if (!this.analyzedByGemini) {
    const { diabeticScore, riskLevel } = calculateDiabeticScore({
      glucoseLevel: this.glucoseLevel ?? 0,
      sleepHours: this.sleepHours,
      physicalActivity: this.physicalActivity,
      healthyEating: this.healthyEating,
      stressLevel: this.stressLevel,
      energyLevel: this.energyLevel,
      excessiveThirst: this.excessiveThirst,
      frequentUrination: this.frequentUrination,
      bmi: this.bmiScore ?? 0,
    });

    this.diabeticRiskScore = diabeticScore;
    this.riskLevel = riskLevel;

    const recommendations = {
      low: "Current lifestyle looks healthy. Continue maintaining balanced habits.",
      medium:
        "Some patterns may need attention. Monitor health regularly and follow up with your doctor.",
      high: "Possible diabetes-related indicators detected. Please consult a doctor soon.",
    };
    this.recommendation = recommendations[riskLevel];
  }

  if (this.isNew || this.isModified()) {
    try {
      const Patient = mongoose.model("Patient");
      const patient = await Patient.findById(this.patient);

      if (patient) {
        if (this.analyzedByGemini && this.diabeticRiskScore != null) {
          patient.diabeticScore = this.diabeticRiskScore;
          patient.isDiabetic = this.riskLevel === "high";
          if (this.healthSummary) patient.healthSummary = this.healthSummary;
        } else {
          const profileScore = calculateDiabeticScore({
            glucoseLevel: this.glucoseLevel ?? 0,
            sleepHours: this.sleepHours,
            physicalActivity: this.physicalActivity,
            healthyEating: this.healthyEating,
            stressLevel: this.stressLevel,
            energyLevel: this.energyLevel,
            excessiveThirst: this.excessiveThirst,
            frequentUrination: this.frequentUrination,
            bmi: this.bmiScore ?? patient.bmi ?? 0,
            heredityHistory: patient.heredityHistory,
          });

          patient.diabeticScore = profileScore.diabeticScore;
          patient.isDiabetic = profileScore.isDiabetic;
        }
        if (this.weightKg) patient.weight = this.weightKg;
        if (this.heightCm) patient.height = this.heightCm;
        if (this.bmiScore) patient.bmi = this.bmiScore;
        await patient.save();
      }
    } catch (err) {
      throw err;
    }
  }
});

module.exports = mongoose.model("Report", reportSchema);
