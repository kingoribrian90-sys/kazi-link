const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const mongoose = require("mongoose");
const { getEnv } = require("./config/env");
const { createRateLimits } = require("./middleware/rateLimits");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const requestRoutes = require("./routes/requestRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const savedRoutes = require("./routes/savedRoutes");
const { sendSuccess } = require("./utils/response");

function createApp() {
  const env = getEnv();
  const app = express();
  const rateLimits = createRateLimits();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.use(mongoSanitize());
  if (env.NODE_ENV === "development") app.use(morgan("dev"));
  app.use(rateLimits.general);

  app.get("/api/v1/health", (_req, res) => {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: "Database unavailable.",
      });
    }
    return sendSuccess(res, { status: "ok", database: "connected" }, "Healthy.");
  });
  app.use("/api/v1/auth", rateLimits.auth, authRoutes);
  app.use("/api/v1/profiles", profileRoutes);
  app.use("/api/v1/requests", requestRoutes);
  app.use("/api/v1/reviews", reviewRoutes);
  app.use("/api/v1/saved", savedRoutes);
  app.use((req, res) =>
    res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.path}` }),
  );
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
