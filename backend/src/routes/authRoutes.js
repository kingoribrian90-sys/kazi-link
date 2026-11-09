const express = require("express");
const controller = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  emptyQuery,
  loginBody,
  refreshBody,
  registerBody,
} = require("../utils/schemas");

const router = express.Router();

router.post("/register", validate(registerBody), controller.register);
router.post("/login", validate(loginBody), controller.login);
router.post("/refresh", validate(refreshBody), controller.refresh);
router.get("/me", authenticate, validate(emptyQuery, "query"), controller.me);
router.post("/logout", authenticate, validate(emptyQuery), controller.logout);

module.exports = router;
