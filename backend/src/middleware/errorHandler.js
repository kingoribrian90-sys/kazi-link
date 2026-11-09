const { getEnv } = require("../config/env");

function errorHandler(error, req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || "An unexpected error occurred.";
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");
  } else if (error.code === 11000) {
    statusCode = 409;
    message = "An account with those details already exists.";
  } else if (error.name === "CastError") {
    statusCode = 400;
    message = "The supplied identifier is invalid.";
  } else if (error.type === "entity.too.large") {
    statusCode = 413;
    message = "Request body exceeds the 1 MB limit.";
  } else if (error instanceof SyntaxError && Object.hasOwn(error, "body")) {
    statusCode = 400;
    message = "Request body contains invalid JSON.";
  }

  if (getEnv().NODE_ENV === "production" && statusCode >= 500) {
    console.error(
      JSON.stringify({
        level: "error",
        message: error.message,
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
      }),
    );
    message = "An unexpected error occurred.";
  } else if (statusCode >= 500) {
    console.error(error);
  }
  return res.status(statusCode).json({ success: false, error: message });
}

module.exports = errorHandler;
