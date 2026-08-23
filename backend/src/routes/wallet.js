const express = require("express");

const router = express.Router();

const {
  wallet,
} = require("../controllers/walletController");

router.get("/:address", wallet);

module.exports = router;