const express = require("express");

const router = express.Router();

const {
  getChallenge,
  getChallengeLeaderboard,
  getChallengeDiagnostics,
} = require("../services/challenge");

// ============================================
// GET /api/challenge
// ============================================

router.get("/", async (req, res) => {
  try {
    const result =
      await getChallenge();

    res.json(result);
  } catch (error) {
    console.error(
      "[CHALLENGE ROUTE] GET /:",
      error
    );

    res.status(500).json({
      status: "0",

      error:
        error?.message ||
        "Challenge calculation failed",
    });
  }
});

// ============================================
// GET /api/challenge/leaderboard
// ============================================

router.get(
  "/leaderboard",
  async (req, res) => {
    try {
      const result =
        await getChallengeLeaderboard();

      res.json(result);
    } catch (error) {
      console.error(
        "[CHALLENGE ROUTE] GET /leaderboard:",
        error
      );

      res.status(500).json({
        status: "0",

        error:
          error?.message ||
          "Challenge leaderboard failed",
      });
    }
  }
);

// ============================================
// GET /api/challenge/diagnostics
// ============================================

router.get(
  "/diagnostics",
  async (req, res) => {
    try {
      const result =
        await getChallengeDiagnostics();

      res.json(result);
    } catch (error) {
      console.error(
        "[CHALLENGE ROUTE] GET /diagnostics:",
        error
      );

      res.status(500).json({
        status: "0",

        error:
          error?.message ||
          "Challenge diagnostics failed",
      });
    }
  }
);

// ============================================
// EXPORT
// ============================================

module.exports = router;