/**
 * When the client sends multipart/form-data, report fields are JSON-stringified in `data`.
 */
function parseReportBody(req, _res, next) {
  if (typeof req.body?.data === "string") {
    try {
      req.body = JSON.parse(req.body.data);
    } catch {
      const err = new Error("Invalid JSON in data field");
      err.statusCode = 400;
      return next(err);
    }
  }
  next();
}

module.exports = parseReportBody;
