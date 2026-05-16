const Joi = require("joi");

const createHealthSchema = Joi.object({
  heartRate: Joi.number().min(0),
  bloodPressure: Joi.object({
    systolic: Joi.number().min(0),
    diastolic: Joi.number().min(0),
  }),
  glucoseLevel: Joi.number().min(0),
  oxygenSaturation: Joi.number().min(0).max(100),
  bodyTemperature: Joi.number(),
  respiratoryRate: Joi.number().min(0),
  weight: Joi.number().min(0),
  height: Joi.number().min(0),
  cholesterol: Joi.object({
    total: Joi.number().min(0),
    ldl: Joi.number().min(0),
    hdl: Joi.number().min(0),
  }),
  hba1c: Joi.number().min(0),
  notes: Joi.string().max(2000).allow(""),
  recordedAt: Joi.date(),
});

const updateHealthSchema = createHealthSchema.min(1);

module.exports = { createHealthSchema, updateHealthSchema };
