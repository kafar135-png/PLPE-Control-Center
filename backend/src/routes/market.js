const express = require("express");

const router = express.Router();

const {
  market,
} = require("../controllers/marketController");

router.get("/", market);

module.exports = router;