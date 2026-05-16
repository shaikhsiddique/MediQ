const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const Patient = require("../models/patient.model");
const Doctor = require("../models/doctor.model");
const Health = require("../models/health.model");
const calculateBaselineScore = require("../utils/calculateBaselineScore");

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const formatAuthResponse = (user, role) => {
  const token = signToken(user._id, role);
  const userObj = user.toJSON ? user.toJSON() : user;

  return {
    token,
    user: {
      id: userObj._id,
      name: userObj.name,
      email: userObj.email,
      role,
      ...(role === "patient" && {
        phone: userObj.phone,
        gender: userObj.gender,
        diabeticScore: userObj.diabeticScore,
        isDiabetic: userObj.isDiabetic,
        bmi: userObj.bmi,
      }),
      ...(role === "doctor" && {
        specialization: userObj.specialization,
        patientsCount: userObj.patients?.length ?? 0,
      }),
    },
  };
};

const hasVitalData = (qa) =>
  qa &&
  Object.entries(qa).some(([key, val]) => {
    if (key === "bloodPressure") {
      return val?.systolic || val?.diastolic;
    }
    if (key === "notes") return false;
    return val != null && val !== "";
  });

const registerPatient = async (data) => {
  const existing = await Patient.findOne({ email: data.email });
  if (existing) {
    throw new ApiError(409, "Email already registered");
  }

  const { quickAssessment, doctorId, ...patientData } = data;

  const patient = await Patient.create(patientData);

  const baseline = calculateBaselineScore({
    bmi: patient.bmi,
    heredityHistory: patient.heredityHistory,
    glucoseLevel: quickAssessment?.glucoseLevel,
    heartRate: quickAssessment?.heartRate,
    bloodPressure: quickAssessment?.bloodPressure,
    hba1c: quickAssessment?.hba1c,
  });
  patient.diabeticScore = baseline.diabeticScore;
  patient.isDiabetic = baseline.isDiabetic;

  if (hasVitalData(quickAssessment)) {
    const health = await Health.create({
      ...quickAssessment,
      patient: patient._id,
      height: patient.height,
      weight: patient.weight,
    });
    patient.healthRecords.push(health._id);
  }

  if (doctorId) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new ApiError(404, "Doctor not found");
    }
    patient.doctor = doctor._id;
    doctor.patients.push(patient._id);
    await doctor.save();
  }

  await patient.save();

  return formatAuthResponse(patient, "patient");
};

const registerDoctor = async (data) => {
  const existing = await Doctor.findOne({ email: data.email });
  if (existing) {
    throw new ApiError(409, "Email already registered");
  }

  const doctor = await Doctor.create(data);
  return formatAuthResponse(doctor, "doctor");
};

const loginPatient = async ({ email, password }) => {
  const patient = await Patient.findOne({ email }).select("+password");
  if (!patient || !(await patient.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  return formatAuthResponse(patient, "patient");
};

const loginDoctor = async ({ email, password }) => {
  const doctor = await Doctor.findOne({ email }).select("+password");
  if (!doctor || !(await doctor.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  return formatAuthResponse(doctor, "doctor");
};

const getMe = async (userId, role) => {
  if (role === "patient") {
    return Patient.findById(userId)
      .populate("doctor", "name email specialization")
      .populate({
        path: "reports",
        options: { sort: { reportDate: -1 }, limit: 5 },
      });
  }

  return Doctor.findById(userId).populate(
    "patients",
    "name email phone age gender diabeticScore isDiabetic bmi"
  );
};

module.exports = {
  registerPatient,
  registerDoctor,
  loginPatient,
  loginDoctor,
  getMe,
};
