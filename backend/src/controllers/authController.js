const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const authService = require("../services/authService");

const register = asyncHandler(async (req, res) =>
  sendSuccess(res, await authService.register(req.body), "Account created.", 201),
);
const login = asyncHandler(async (req, res) =>
  sendSuccess(res, await authService.login(req.body), "Signed in."),
);
const refresh = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    await authService.refresh(req.body.refreshToken),
    "Session refreshed.",
  ),
);
const me = asyncHandler(async (req, res) =>
  sendSuccess(res, { user: authService.publicUser(req.user) }, "Account loaded."),
);
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);
  return sendSuccess(res, null, "Signed out.");
});

module.exports = { login, logout, me, refresh, register };
