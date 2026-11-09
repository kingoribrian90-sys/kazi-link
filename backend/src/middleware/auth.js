const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { getEnv } = require("../config/env");

const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new AppError(401, "Authentication is required.");
  let claims;
  try {
    claims = jwt.verify(token, getEnv().JWT_SECRET);
  } catch {
    throw new AppError(401, "Your session has expired. Please sign in again.");
  }
  if (claims.type !== "access") throw new AppError(401, "Invalid access token.");
  const user = await User.findById(claims.sub);
  if (!user) throw new AppError(401, "Account not found.");
  req.user = user;
  next();
});

const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError(403, "You do not have permission to do that."));
  }
  return next();
};

module.exports = { authenticate, authorize };
