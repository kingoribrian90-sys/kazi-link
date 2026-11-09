const rateLimit = require("express-rate-limit");
const { getEnv } = require("../config/env");

function createRateLimits() {
  const env = getEnv();
  const options = {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    standardHeaders: true,
    legacyHeaders: false,
    handler(_req, res) {
      res.status(429).json({
        success: false,
        error: "Too many requests. Please try again later.",
      });
    },
  };
  return {
    general: rateLimit({ ...options, limit: env.RATE_LIMIT_MAX }),
    auth: rateLimit({ ...options, limit: env.AUTH_RATE_LIMIT_MAX }),
  };
}

module.exports = { createRateLimits };
