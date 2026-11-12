import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { AppError } from "../utils/AppError.js";

function readToken(req) {
  const [scheme, token] = (req.get("authorization") || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new AppError("Authentication is required.", 401);
  }
  return token;
}

async function loadAuthenticatedUser(req) {
  let payload;
  try {
    payload = jwt.verify(readToken(req), process.env.JWT_SECRET);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Your session is invalid or has expired.", 401);
  }

  if (!payload.sub) {
    throw new AppError("Your session is invalid or has expired.", 401);
  }
  const [users] = await pool.execute(
    "SELECT id, role FROM users WHERE id = ?",
    [payload.sub],
  );
  if (!users.length) {
    throw new AppError("Your session is invalid or has expired.", 401);
  }
  req.user = users[0];
}

export function optionalAuth(req, _res, next) {
  if (!req.get("authorization")) return next();
  return loadAuthenticatedUser(req).then(() => next()).catch(next);
}

export function requireAuth(req, _res, next) {
  return loadAuthenticatedUser(req).then(() => next()).catch(next);
}

export function requireRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to do that.", 403));
    }
    return next();
  };
}
