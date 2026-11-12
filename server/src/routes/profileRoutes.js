import { Router } from "express";
import { body, param } from "express-validator";
import {
  getProfile,
  listProfiles,
  updateMyProfile,
} from "../controllers/profileController.js";
import { listProfileReviews } from "../controllers/reviewController.js";
import { optionalAuth, requireAuth, requireRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listProfiles));
router.get(
  "/:profileId/reviews",
  param("profileId").isUUID(),
  validate,
  asyncHandler(listProfileReviews),
);
router.get(
  "/:profileId",
  optionalAuth,
  param("profileId").isUUID(),
  validate,
  asyncHandler(getProfile),
);
router.patch(
  "/me",
  requireAuth,
  requireRoles("freelancer"),
  body("name").trim().isLength({ min: 2, max: 120 }),
  body("title").trim().isLength({ min: 1, max: 160 }),
  body("service").trim().isLength({ min: 1, max: 160 }),
  body("category").trim().isLength({ min: 1, max: 100 }),
  body("subcategories").isArray(),
  body("price").isFloat({ min: 0 }),
  body("location").trim().isLength({ min: 1, max: 160 }),
  body("languages").isArray(),
  body("availability").isIn(["this week", "this month", "flexible"]),
  body("acceptsMpesa").isBoolean(),
  body("online").isBoolean(),
  body("bio").trim().isLength({ min: 20 }),
  body("avatar").optional({ nullable: true }).isString(),
  body("portfolio").isArray(),
  validate,
  asyncHandler(updateMyProfile),
);

export default router;
