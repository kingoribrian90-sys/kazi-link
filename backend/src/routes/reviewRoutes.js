const express = require("express");
const controller = require("../controllers/reviewController");
const { authenticate, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  emptyQuery,
  idParams,
  reviewBody,
  reviewQuery,
  reviewUpdateBody,
} = require("../utils/schemas");

const router = express.Router();
router.get("/", validate(reviewQuery, "query"), controller.list);
router.post(
  "/",
  authenticate,
  authorize("owner", "admin"),
  validate(reviewBody),
  controller.create,
);
router.patch(
  "/:id",
  authenticate,
  validate(idParams, "params"),
  validate(reviewUpdateBody),
  controller.update,
);
router.delete(
  "/:id",
  authenticate,
  validate(idParams, "params"),
  validate(emptyQuery),
  controller.remove,
);

module.exports = router;
