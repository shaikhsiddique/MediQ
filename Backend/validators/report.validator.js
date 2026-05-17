const Joi = require("joi");

const fieldRemarkSchema = Joi.object({
  field: Joi.string().required(),
  remark: Joi.string().allow(""),
});

const createReportSchema = Joi.object({
  weightKg: Joi.number().min(0),
  heightCm: Joi.number().min(0),
  bmiScore: Joi.number().min(0),
  glucoseLevel: Joi.number().min(0),
  sleepHours: Joi.number().min(0).max(24),
  physicalActivity: Joi.number().min(0).max(10),
  healthyEating: Joi.number().min(0).max(10),
  waterIntakeLitres: Joi.number().min(0),
  stressLevel: Joi.number().min(0).max(10),
  energyLevel: Joi.number().min(0).max(10),
  excessiveThirst: Joi.number().min(0).max(10),
  frequentUrination: Joi.number().min(0).max(10),
  additionalOverallRemarks: Joi.string().max(2000).allow(""),
  fieldRemarks: Joi.array().items(fieldRemarkSchema),
  reportDate: Joi.date(),
  patientId: Joi.string().hex().length(24),
}).min(1);

const updateReportSchema = createReportSchema.min(1);

const kidsBuddyReportSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        questionKey: Joi.string().required(),
        question: Joi.string().required(),
        answerType: Joi.string().valid("yes", "little", "no").required(),
        points: Joi.number().min(0).max(2),
        feedback: Joi.string().allow("").max(500),
      })
    )
    .min(1)
    .required(),
  totalScore: Joi.number().min(0).required(),
  maxScore: Joi.number().min(1).required(),
  language: Joi.string().valid("en", "hi", "mr").default("en"),
});

module.exports = {
  createReportSchema,
  updateReportSchema,
  kidsBuddyReportSchema,
};

