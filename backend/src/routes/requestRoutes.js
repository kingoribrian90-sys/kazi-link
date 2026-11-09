const express = require("express");
const controller = require("../controllers/requestController");
const { authenticate, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  emptyQuery,
  idParams,
  requestBody,
  requestQuery,
  statusBody,
} = require("../utils/schemas");

const router = express.Router();
router.use(authenticate);
router.get("/", validate(requestQuery, "query"), controller.list);
router.post("/", authorize("owner", "admin"), validate(requestBody), controller.create);
router.get("/:id", validate(idParams, "params"), controller.getById);
router.patch(
  "/:id/status",
  authorize("freelancer", "admin"),
  validate(idParams, "params"),
  validate(statusBody),
  controller.updateStatus,
);
router.delete(
  "/:id",
  validate(idParams, "params"),
  validate(emptyQuery),
  controller.remove,
);

module.exports = router;
