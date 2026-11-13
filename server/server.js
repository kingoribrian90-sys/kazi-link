import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pool } from "./src/config/db.js";
import { errorHandler, notFoundHandler } from "./src/middleware/errorHandler.js";
import { asyncHandler } from "./src/utils/asyncHandler.js";
import authRoutes from "./src/routes/authRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import requestRoutes from "./src/routes/requestRoutes.js";
import savedProfileRoutes from "./src/routes/savedProfileRoutes.js";

for (const name of ["CLIENT_URL", "DB_HOST", "DB_USER", "DB_NAME", "JWT_SECRET"]) {
  if (!process.env[name]) throw new Error(`${name} must be set in server/.env.`);
}

const clientUrl = new URL(process.env.CLIENT_URL);
const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: clientUrl.origin,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);
app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.get(
  "/api/health",
  asyncHandler(async (_req, res) => {
    try {
      await pool.execute("SELECT 1");
      res.json({ status: "ok", database: "connected" });
    } catch (error) {
      console.error("MySQL health check failed:", error.message);
      res.status(503).json({ status: "error", database: "disconnected" });
    }
  }),
);

app.use("/api/profiles", profileRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/saved-profiles", savedProfileRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT || 5173);
app.listen(port, () => {
  console.log(`KaziLink API listening on http://localhost:${port}`);
});
