const {
  getChallenge,
  getChallengeDiagnostics,
  clearChallengeCache,
} = require("../services/challenge");


/* =========================================================
   GET /api/challenge
   ========================================================= */

async function challenge(req, res) {
  try {
    const result = await getChallenge();

    return res.json(result);

  } catch (err) {
    console.error("======================================");
    console.error("[CHALLENGE CONTROLLER ERROR]");
    console.error(err);
    console.error("======================================");

    return res.status(500).json({
      status: "0",
      error: err.message || "Challenge API error",
    });
  }
}


/* =========================================================
   GET /api/challenge/diagnostics
   ========================================================= */

async function challengeDiagnostics(req, res) {
  try {
    const result =
      await getChallengeDiagnostics();

    return res.json(result);

  } catch (err) {
    console.error("======================================");
    console.error("[CHALLENGE DIAGNOSTICS ERROR]");
    console.error(err);
    console.error("======================================");

    return res.status(500).json({
      status: "0",
      error:
        err.message ||
        "Challenge diagnostics error",
    });
  }
}


/* =========================================================
   GET /api/challenge/refresh
   ========================================================= */

async function refreshChallenge(req, res) {
  try {

    clearChallengeCache();

    const result =
      await getChallenge();

    return res.json(result);

  } catch (err) {
    console.error("======================================");
    console.error("[CHALLENGE REFRESH ERROR]");
    console.error(err);
    console.error("======================================");

    return res.status(500).json({
      status: "0",
      error:
        err.message ||
        "Challenge refresh error",
    });
  }
}


/* =========================================================
   POST /api/challenge/clear-cache
   ========================================================= */

async function clearCache(req, res) {
  try {

    clearChallengeCache();

    return res.json({
      status: "1",
      message: "Challenge cache cleared",
    });

  } catch (err) {
    console.error(
      "[CHALLENGE CACHE ERROR]",
      err
    );

    return res.status(500).json({
      status: "0",
      error:
        err.message ||
        "Unable to clear challenge cache",
    });
  }
}


/* =========================================================
   EXPORTS
   ========================================================= */

module.exports = {
  challenge,
  refreshChallenge,
  challengeDiagnostics,
  clearCache,
};