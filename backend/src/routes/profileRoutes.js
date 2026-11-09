const express = require("express");
const controller = require("../controllers/profileController");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  emptyQuery,
  idParams,
  profileBody,
  profileQuery,
} = require("../utils/schemas");

const router = express.Router();

router.get("/", validate(profileQuery, "query"), controller.list);
router.get("/me", authenticate, validate(emptyQuery, "query"), controller.getMine);
router.post("/me", authenticate, validate(profileBody), controller.createMine);
router.patch("/me", authenticate, validate(profileBody), controller.updateMine);
router.delete("/me", authenticate, validate(emptyQuery), controller.deleteMine);
router.get("/:id", validate(idParams, "params"), controller.getById);

module.exports = router;
