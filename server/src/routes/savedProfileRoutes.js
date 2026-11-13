import { Router } from "express";
import { param } from "express-validator";
import {
  listSavedProfiles,
  saveProfile,
  unsaveProfile,
} from "../controllers/savedProfileController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);
router.get("/", asyncHandler(listSavedProfiles));
router.post(
  "/:profileId",
  param("profileId").isUUID(),
  validate,
  asyncHandler(saveProfile),
);
router.delete(
  "/:profileId",
  param("profileId").isUUID(),
  validate,
  asyncHandler(unsaveProfile),
);

export default router;
