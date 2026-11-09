const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Profile = require("../models/Profile");
const AppError = require("../utils/AppError");
const { createTokens, hashToken } = require("../utils/tokens");
const { getEnv } = require("../config/env");

function splitIdentity(value) {
  const identity = value.trim();
  return identity.includes("@")
    ? { email: identity.toLowerCase() }
    : { phone: identity.replace(/[^\d+]/g, "") };
}

function publicUser(user) {
  return user.toJSON();
}

async function issueSession(user) {
  const tokens = createTokens(user);
  user.refreshTokenHash = hashToken(tokens.refreshToken);
  await user.save();
  return { ...tokens, user: publicUser(user) };
}

async function register({ name, identity, password, role }) {
  const credentials = splitIdentity(identity);
  const existing = await User.findOne({
    $or: Object.entries(credentials).map(([field, value]) => ({ [field]: value })),
  });
  if (existing) throw new AppError(409, "An account with those details already exists.");
  const user = await User.create({
    name,
    ...credentials,
    passwordHash: await bcrypt.hash(password, 12),
    role,
  });
  if (role === "freelancer") {
    await Profile.create({
      user: user._id,
      name,
      role: "Digital freelancer",
      service: "Digital services",
      category: "Design and Creative",
      subcategories: [],
      price: 2500,
      location: "Nairobi",
      languages: ["English", "Kiswahili"],
      experience: "new",
      availability: "flexible",
      acceptsMpesa: true,
      bio: "Tell local businesses a little about what you do and how you can help.",
    });
  }
  return issueSession(user);
}

async function login({ identity, password }) {
  const credentials = splitIdentity(identity);
  const user = await User.findOne(credentials).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(401, "The email/phone or password is incorrect.");
  }
  return issueSession(user);
}

async function refresh(refreshToken) {
  let claims;
  try {
    claims = jwt.verify(refreshToken, getEnv().JWT_REFRESH_SECRET);
  } catch {
    throw new AppError(401, "Your refresh session has expired. Please sign in again.");
  }
  if (claims.type !== "refresh") throw new AppError(401, "Invalid refresh token.");
  const user = await User.findById(claims.sub).select("+refreshTokenHash");
  if (!user || user.refreshTokenHash !== hashToken(refreshToken)) {
    throw new AppError(401, "Your refresh session is no longer valid.");
  }
  return issueSession(user);
}

async function logout(userId) {
  await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
}

module.exports = { login, logout, publicUser, refresh, register };
