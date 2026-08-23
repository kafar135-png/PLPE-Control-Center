const express = require("express");

const router = express.Router();

const {
  liveTrades,
} = require("../controllers/liveTradesController");

router.get("/", liveTrades);

module.exports = router;