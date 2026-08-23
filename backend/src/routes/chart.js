const express = require("express");

const router = express.Router();

const {
  chart,
} = require("../controllers/chartController");

router.get("/", chart);

module.exports = router;