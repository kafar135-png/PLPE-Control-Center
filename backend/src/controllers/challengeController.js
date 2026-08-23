const {
  getChallenge,
  getChallengeDiagnostics,
} = require("../services/challenge");

const PHASE = {
  id: "01",
  name: "LAUNCH PHASE",
  start: "2026-08-15T00:00:00Z",
  end: "2026-08-25T00:00:00Z",
};

const REWARD_POOL = {
  total: 100,
  currency: "USD",
  payoutCurrency: "ETH",

  prizes: [
    {
      place: 1,
      amount: 50,
    },
    {
      place: 2,
      amount: 30,
    },
    {
      place: 3,
      amount: 20,
    },
  ],
};

const RULES = {
  minimumVolume: 2,
  minimumBuyForEntry: 2,
  pair: "PLPE/WETH",
  currency: "USD",
  maximumEntries: 4,

  qualification:
    "BUY + SELL VOLUME >= $2",

  entries:
    "Each individual BUY >= $2 gives exactly 1 ENTRY. SELL gives 0 ENTRY.",
};

let leaderboardCache = null;
let cacheTimestamp = 0;

const CACHE_TIME = 30000;


// =====================================
// PUBLIC CHALLENGE INFO
// =====================================

function getChallengeInfo() {
  return {
    status: "1",

    phase: PHASE,

    rewardPool: REWARD_POOL,

    qualification: RULES,

    /*
     * IMPORTANT:
     * Nie używamy już starych ENTRY TIERS.
     *
     * Każdy pojedynczy BUY >= $2 = 1 ENTRY.
     * Maksymalnie 4.
     */

    entries: {
      minimumBuy: 2,

      entriesPerBuy: 1,

      maximumEntries: 4,

      rule:
        "BUY >= $2 = 1 ENTRY",

      sell:
        "SELL = 0 ENTRY",
    },
  };
}


// =====================================
// MAIN CHALLENGE ENDPOINT
// =====================================

async function challenge(req, res) {
  try {
    const now = Date.now();

    if (
      leaderboardCache &&
      now - cacheTimestamp < CACHE_TIME
    ) {
      return res.json({
        ...getChallengeInfo(),

        stats:
          leaderboardCache.stats,

        leaderboard:
          leaderboardCache.leaderboard,

        cached: true,

        generatedAt:
          cacheTimestamp,
      });
    }

    const result =
      await getChallenge();

    leaderboardCache = {
      stats:
        result.stats,

      leaderboard:
        result.leaderboard,
    };

    cacheTimestamp =
      Date.now();

    return res.json({
      ...getChallengeInfo(),

      stats:
        result.stats,

      leaderboard:
        result.leaderboard,

      cached: false,

      generatedAt:
        cacheTimestamp,
    });
  } catch (err) {
    console.error(
      "Challenge API:",
      err
    );

    return res.status(500).json({
      status: "0",

      error:
        "Challenge calculation error",
    });
  }
}


// =====================================
// FORCE REFRESH
// =====================================

async function refreshChallenge(
  req,
  res
) {
  try {
    const result =
      await getChallengeDiagnostics();

    leaderboardCache = {
      stats:
        result.stats,

      leaderboard:
        result.leaderboard,
    };

    cacheTimestamp =
      Date.now();

    return res.json({
      ...getChallengeInfo(),

      stats:
        result.stats,

      leaderboard:
        result.leaderboard,

      cached: false,

      generatedAt:
        cacheTimestamp,
    });
  } catch (err) {
    console.error(
      "Challenge refresh:",
      err
    );

    return res.status(500).json({
      status: "0",

      error:
        "Challenge refresh error",
    });
  }
}


// =====================================
// DIAGNOSTICS
// =====================================

async function challengeDiagnostics(
  req,
  res
) {
  try {
    const result =
      await getChallengeDiagnostics();

    return res.json({
      status: "1",

      ...result,
    });
  } catch (err) {
    console.error(
      "Challenge diagnostics:",
      err
    );

    return res.status(500).json({
      status: "0",

      error:
        "Challenge calculation error",
    });
  }
}


module.exports = {
  challenge,
  refreshChallenge,
  challengeDiagnostics,
};