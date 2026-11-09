const express = require("express");
const controller = require("../controllers/savedController");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { profileIdParams, savedQuery } = require("../utils/schemas");

const router = express.Router();
router.use(authenticate);
router.get("/", validate(savedQuery, "query"), controller.list);
router.post("/:profileId", validate(profileIdParams, "params"), controller.toggle);

module.exports = router;
