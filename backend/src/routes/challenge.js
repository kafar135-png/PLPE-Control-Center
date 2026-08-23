const express = require("express");

const router = express.Router();

const {
  challenge,
  refreshChallenge,
  challengeDiagnostics,
} = require("../controllers/challengeController");

router.get(
  "/",
  challenge
);

router.get(
  "/refresh",
  refreshChallenge
);

router.get(
  "/diagnostics",
  challengeDiagnostics
);

module.exports = router;