const ApiError = require("../utils/ApiError");

const validate = (schema, property = "body") => (req, _res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((d) => d.message);
    return next(new ApiError(400, "Validation failed", errors));
  }

  req[property] = value;
  next();
};

module.exports = validate;
