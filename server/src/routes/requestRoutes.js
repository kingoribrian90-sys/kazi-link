import { Router } from "express";
import { body, param } from "express-validator";
import {
  createRequest,
  listRequests,
  updateRequestStatus,
} from "../controllers/requestController.js";
import { createReview } from "../controllers/reviewController.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);
router.get("/", asyncHandler(listRequests));
router.post(
  "/",
  requireRoles("owner"),
  body("freelancerId").isUUID(),
  body("service").trim().isLength({ min: 1, max: 160 }),
  body("description").trim().isLength({ min: 12 }),
  body("budget").isFloat({ min: 0.01 }),
  body("deadline").isISO8601({ strict: true }),
  body("location").trim().isLength({ min: 1, max: 160 }),
  validate,
  asyncHandler(createRequest),
);
router.patch(
  "/:requestId/status",
  requireRoles("freelancer", "admin"),
  param("requestId").isUUID(),
  body("status").isIn(["accepted", "declined", "completed"]),
  validate,
  asyncHandler(updateRequestStatus),
);
router.post(
  "/:requestId/review",
  requireRoles("owner", "admin"),
  param("requestId").isUUID(),
  body("rating").isInt({ min: 1, max: 5 }),
  body("comment").trim().isLength({ min: 10 }),
  validate,
  asyncHandler(createReview),
);

export default router;
