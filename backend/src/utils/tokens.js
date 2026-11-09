const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const { getEnv } = require("../config/env");

function createTokens(user) {
  const env = getEnv();
  const subject = user._id.toString();
  return {
    accessToken: jwt.sign({ sub: subject, type: "access" }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    }),
    refreshToken: jwt.sign(
      { sub: subject, type: "refresh" },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN },
    ),
  };
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = { createTokens, hashToken };
