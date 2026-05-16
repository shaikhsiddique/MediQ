const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const Patient = require("../models/patient.model");
const Doctor = require("../models/doctor.model");

const authenticate =
  (...roles) =>
  async (req, _res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return next(new ApiError(401, "Access token required"));
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (roles.length && !roles.includes(decoded.role)) {
        return next(new ApiError(403, "Insufficient permissions"));
      }

      let user;
      if (decoded.role === "patient") {
        user = await Patient.findById(decoded.id);
      } else if (decoded.role === "doctor") {
        user = await Doctor.findById(decoded.id);
      }

      if (!user) {
        return next(new ApiError(401, "User no longer exists"));
      }

      req.user = user;
      req.userId = user._id;
      req.userRole = decoded.role;
      next();
    } catch {
      return next(new ApiError(401, "Invalid or expired token"));
    }
  };

module.exports = { authenticate };
