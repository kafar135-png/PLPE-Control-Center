const {
  getChallenge,
  getChallengeDiagnostics,
  clearChallengeCache,
} = require("../services/challengeService");


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
      error:
        err.message ||
        "Challenge API error",
    });
  }
}


/* =========================================================
   GET /api/challenge/refresh
   =========================================================

   Czyści cache i wymusza ponowne przeliczenie challenge.
   ========================================================= */

async function refreshChallenge(req, res) {
  try {

    console.log(
      "[CHALLENGE] Manual refresh requested."
    );

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
   EXPORTS
   ========================================================= */

module.exports = {
  challenge,
  refreshChallenge,
  challengeDiagnostics,
};