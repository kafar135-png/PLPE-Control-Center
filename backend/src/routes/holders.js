const express = require("express");

const router = express.Router();

const {
  holders,
} = require("../controllers/holdersController");

router.get("/", holders);

module.exports = router;