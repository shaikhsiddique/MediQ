const Joi = require("joi");

const updatePatientSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  phone: Joi.string().trim().min(8).max(20),
  age: Joi.number().integer().min(0).max(150),
  gender: Joi.string().valid("male", "female", "other"),
  address: Joi.string().trim().max(500).allow(""),
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
}).min(1);

module.exports = { updatePatientSchema };
