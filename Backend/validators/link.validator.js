const Joi = require("joi");

const linkDoctorSchema = Joi.object({
  doctorId: Joi.string().hex().length(24),
  doctorEmail: Joi.string().email().lowercase().trim(),
})
  .or("doctorId", "doctorEmail")
  .messages({
    "object.missing": "Provide doctorId or doctorEmail",
  });

const linkPatientSchema = Joi.object({
  patientId: Joi.string().hex().length(24),
  patientEmail: Joi.string().email().lowercase().trim(),
})
  .or("patientId", "patientEmail")
  .messages({
    "object.missing": "Provide patientId or patientEmail",
  });

const lookupEmailSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
});

module.exports = {
  linkDoctorSchema,
  linkPatientSchema,
  lookupEmailSchema,
};
