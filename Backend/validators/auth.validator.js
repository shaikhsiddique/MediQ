const Joi = require("joi");

const passwordSchema = Joi.string().min(6).max(128).required();

const registerPatientSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: passwordSchema,
  phone: Joi.string().trim().min(8).max(20).required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  address: Joi.string().trim().max(500).allow(""),
  age: Joi.number().integer().min(0).max(150),
  height: Joi.number().min(0).max(300),
  weight: Joi.number().min(0).max(500),
  heredityHistory: Joi.object({
    diabetes: Joi.boolean(),
    heartDisease: Joi.boolean(),
    hypertension: Joi.boolean(),
    obesity: Joi.boolean(),
    other: Joi.string().allow(""),
  }),
  healthSummary: Joi.string().max(2000).allow(""),
  doctorId: Joi.string().hex().length(24),
  quickAssessment: Joi.object({
    heartRate: Joi.number().min(0),
    glucoseLevel: Joi.number().min(0),
    bloodPressure: Joi.object({
      systolic: Joi.number().min(0),
      diastolic: Joi.number().min(0),
    }),
    oxygenSaturation: Joi.number().min(0).max(100),
    bodyTemperature: Joi.number(),
    respiratoryRate: Joi.number().min(0),
    hba1c: Joi.number().min(0),
    notes: Joi.string().max(2000).allow(""),
  }),
});

const registerDoctorSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: passwordSchema,
  phone: Joi.string().trim().min(8).max(20).required(),
  address: Joi.string().trim().max(500).allow(""),
  specialization: Joi.string().trim().max(100),
  licenseNumber: Joi.string().trim().max(50),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: passwordSchema,
});

module.exports = {
  registerPatientSchema,
  registerDoctorSchema,
  loginSchema,
};
