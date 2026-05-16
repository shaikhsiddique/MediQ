const mongoose = require("mongoose");
const calculateBmi = require("../utils/calculateBmi");

const healthSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    heartRate: {
      type: Number,
      min: 0,
      comment: "bpm",
    },
    bloodPressure: {
      systolic: { type: Number, min: 0 },
      diastolic: { type: Number, min: 0 },
    },
    glucoseLevel: {
      type: Number,
      min: 0,
      comment: "mg/dL",
    },
    oxygenSaturation: {
      type: Number,
      min: 0,
      max: 100,
      comment: "SpO2 %",
    },
    bodyTemperature: {
      type: Number,
      comment: "Celsius",
    },
    respiratoryRate: {
      type: Number,
      min: 0,
      comment: "breaths per minute",
    },
    weight: {
      type: Number,
      min: 0,
      comment: "kg",
    },
    height: {
      type: Number,
      min: 0,
      comment: "cm",
    },
    bmi: {
      type: Number,
      min: 0,
    },
    cholesterol: {
      total: { type: Number },
      ldl: { type: Number },
      hdl: { type: Number },
    },
    hba1c: {
      type: Number,
      comment: "%",
    },
    notes: {
      type: String,
      trim: true,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

healthSchema.pre("save", function updateBmi() {
  if (this.weight && this.height) {
    this.bmi = calculateBmi(this.weight, this.height);
  }
});

module.exports = mongoose.model("Health", healthSchema);
