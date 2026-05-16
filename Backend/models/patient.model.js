const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const calculateBmi = require("../utils/calculateBmi");

const heredityHistorySchema = new mongoose.Schema(
  {
    diabetes: { type: Boolean, default: false },
    heartDisease: { type: Boolean, default: false },
    hypertension: { type: Boolean, default: false },
    obesity: { type: Boolean, default: false },
    other: { type: String, default: "" },
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    age: {
      type: Number,
      min: 0,
      max: 150,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    address: {
      type: String,
      trim: true,
    },
    height: {
      type: Number,
      min: 0,
      comment: "Height in cm",
    },
    weight: {
      type: Number,
      min: 0,
      comment: "Weight in kg",
    },
    bmi: {
      type: Number,
      min: 0,
    },
    heredityHistory: {
      type: heredityHistorySchema,
      default: () => ({}),
    },
    healthSummary: {
      type: String,
      default: "",
      trim: true,
    },
    diabeticScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    isDiabetic: {
      type: Boolean,
      default: false,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    healthRecords: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Health",
      },
    ],
    reports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Report",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

patientSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
});

patientSchema.pre("save", function updateBmi() {
  if (this.weight && this.height) {
    this.bmi = calculateBmi(this.weight, this.height);
  }
});

patientSchema.methods.comparePassword = async function comparePassword(
  candidatePassword
) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Patient", patientSchema);
