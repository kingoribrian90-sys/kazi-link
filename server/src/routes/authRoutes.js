import { Router } from "express";
import { body } from "express-validator";
import {
  getMe,
  login,
  register,
  requestPasswordReset,
  resendVerification,
  resetPassword,
  verifyEmail,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post(
  "/register",
  body("name").trim().isLength({ min: 2, max: 120 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6, max: 128 }),
  body("role").isIn(["owner", "freelancer"]),
  validate,
  asyncHandler(register),
);
router.post(
  "/login",
  body("email").isEmail().normalizeEmail(),
  body("password").isString().notEmpty(),
  validate,
  asyncHandler(login),
);
router.get("/me", requireAuth, asyncHandler(getMe));
router.post(
  "/verify-email",
  body("token").isHexadecimal().isLength({ min: 64, max: 64 }),
  validate,
  asyncHandler(verifyEmail),
);
router.post(
  "/resend-verification",
  body("email").isEmail().normalizeEmail(),
  validate,
  asyncHandler(resendVerification),
);
router.post(
  "/password-reset/request",
  body("email").isEmail().normalizeEmail(),
  validate,
  asyncHandler(requestPasswordReset),
);
router.post(
  "/password-reset/confirm",
  body("token").isHexadecimal().isLength({ min: 64, max: 64 }),
  body("password").isLength({ min: 6, max: 128 }),
  validate,
  asyncHandler(resetPassword),
);

export default router;
