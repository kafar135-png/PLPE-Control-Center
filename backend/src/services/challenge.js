const axios = require("axios");
require("dotenv").config();

/*
=========================================================
PLPE MONTHLY TRADING CHALLENGE
=========================================================

ACTIVE PHASE:
PHASE #02

SOURCE:
GeckoTerminal pool trades

RULES:
- BUY + SELL = volume
- BUY >= $2 = 1 ENTRY
- BUY < $2 = 0 ENTRY
- SELL = 0 ENTRY
- MAX 6 ENTRIES / WALLET / PHASE
- MINIMUM TOTAL VOLUME = $2

RANKING:
1. ENTRIES
2. VOLUME
3. TRANSACTIONS
4. WALLET
=========================================================
*/

/*
=========================================================
GECKOTERMINAL
=========================================================
*/

const GECKO_BASE_URL =
  "https://api.geckoterminal.com/api/v2";

/*
=========================================================
POOL
=========================================================
*/

const NETWORK = "eth";

const POOL =
  "0xb4ffb01c89ffa24e6d01de95d3d780bc3e835390";

/*
=========================================================
ACTIVE PHASE
=========================================================
*/

const PHASE_02 = {
  id: "02",
  name: "MONTHLY CHALLENGE",
  status: "ACTIVE",

  start: "2026-08-26T00:00:00Z",
  end: "2026-09-26T00:00:00Z",

  displayEnd: "2026-09-26T00:00:00Z",
};

/*
=========================================================
ONLY ACTIVE PHASE
=========================================================
*/

const PHASES = [
  PHASE_02,
];

/*
=========================================================
RULES
=========================================================
*/

const MINIMUM_BUY_FOR_ENTRY = 2;
const MAXIMUM_ENTRIES = 6;
const MINIMUM_VOLUME = 2;

/*
=========================================================
CACHE
=========================================================
*/

const CHALLENGE_CACHE_TIME =
  30 * 1000;

const GECKO_TRADES_CACHE_TIME =
  30 * 1000;

const challengeCache =
  new Map();

const geckoTradesCache = {
  data: null,
  time: 0,
};

/*
=========================================================
HELPERS
=========================================================
*/

function normalizeAddress(value) {
  if (!value) {
    return "";
  }

  return String(value).toLowerCase();
}

function normalizeHash(value) {
  if (!value) {
    return "";
  }

  return String(value).toLowerCase();
}

function sleep(ms) {
  return new Promise(
    (resolve) => setTimeout(resolve, ms)
  );
}

/*
=========================================================
PHASE HELPERS
=========================================================
*/

function phaseStartTimestamp(phase) {
  return Math.floor(
    new Date(phase.start).getTime() / 1000
  );
}

function phaseEndTimestamp(phase) {
  return Math.floor(
    new Date(phase.end).getTime() / 1000
  );
}

function isInPhase(timestamp, phase) {
  const time = Number(timestamp);

  if (!Number.isFinite(time)) {
    return false;
  }

  return (
    time >= phaseStartTimestamp(phase) &&
    time < phaseEndTimestamp(phase)
  );
}

function getPhaseById(id) {
  return (
    PHASES.find(
      (phase) =>
        phase.id === String(id)
    ) || null
  );
}

/*
=========================================================
ACTIVE PHASE
=========================================================
*/

function getActivePhase() {
  /*
   * There is only one challenge phase:
   * PHASE #02.
   *
   * We intentionally return Phase #02
   * even outside its active date window.
   *
   * This keeps the API stable and prevents
   * any fallback to the deleted Phase #01.
   */

  return PHASE_02;
}

/*
=========================================================
GECKOTERMINAL REQUEST
=========================================================
*/

async function getGeckoPage(page) {
  const url =
    `${GECKO_BASE_URL}/networks/${NETWORK}/pools/${POOL}/trades`;

  const response =
    await axios.get(
      url,
      {
        params: {
          page,
        },

        timeout: 15000,

        headers: {
          Accept:
            "application/json;version=20230203",
        },
      }
    );

  return response.data;
}

/*
=========================================================
LOAD GECKO TRADES
=========================================================
*/

async function getGeckoTrades() {
  const now = Date.now();

  if (
    geckoTradesCache.data instanceof Map &&
    now -
      geckoTradesCache.time <
        GECKO_TRADES_CACHE_TIME
  ) {
    return geckoTradesCache.data;
  }

  const map = new Map();

  /*
   * We only need trades from PHASE #02.
   *
   * Gecko returns newest trades first.
   *
   * Stop once the oldest loaded trade is
   * before the beginning of Phase #02.
   */

  const phaseStart =
    phaseStartTimestamp(PHASE_02);

  let pagesLoaded = 0;

  for (
    let page = 1;
    page <= 100;
    page++
  ) {
    try {
      console.log(
        `[CHALLENGE] Loading Gecko page ${page}...`
      );

      const data =
        await getGeckoPage(page);

      const rows =
        data?.data;

      if (
        !Array.isArray(rows) ||
        rows.length === 0
      ) {
        console.log(
          `[CHALLENGE] Gecko page ${page}: no more trades`
        );

        break;
      }

      pagesLoaded += 1;

      let oldestTimestamp =
        Number.MAX_SAFE_INTEGER;

      for (
        const row of rows
      ) {
        const attributes =
          row?.attributes;

        if (!attributes) {
          continue;
        }

        const hash =
          normalizeHash(
            attributes.tx_hash
          );

        const wallet =
          normalizeAddress(
            attributes.tx_from_address
          );

        const volumeUsd =
          Number(
            attributes.volume_in_usd
          );

        const timestamp =
          attributes.block_timestamp
            ? Math.floor(
                new Date(
                  attributes.block_timestamp
                ).getTime() / 1000
              )
            : 0;

        const kind =
          String(
            attributes.kind || ""
          ).toLowerCase();

        if (
          timestamp > 0 &&
          timestamp < oldestTimestamp
        ) {
          oldestTimestamp =
            timestamp;
        }

        /*
         * Ignore malformed rows.
         */

        if (
          !hash ||
          !wallet ||
          !Number.isFinite(volumeUsd) ||
          volumeUsd <= 0 ||
          !timestamp
        ) {
          continue;
        }

        /*
         * Only BUY / SELL.
         */

        if (
          kind !== "buy" &&
          kind !== "sell"
        ) {
          continue;
        }

        /*
         * One TX hash = one challenge trade.
         */

        map.set(
          hash,
          {
            hash,

            participant:
              wallet,

            volumeUsd,

            kind,

            timestamp,

            txFrom:
              wallet,
          }
        );
      }

      console.log(
        `[CHALLENGE] Gecko page ${page}: ${rows.length} rows`
      );

      /*
       * We reached before Phase #02.
       */

      if (
        oldestTimestamp <
        phaseStart
      ) {
        console.log(
          "[CHALLENGE] Reached before Phase #02."
        );

        break;
      }

      /*
       * Last page.
       */

      if (
        rows.length < 100
      ) {
        console.log(
          "[CHALLENGE] Last Gecko page reached."
        );

        break;
      }

      await sleep(150);
    } catch (error) {
      console.error(
        `[CHALLENGE] Gecko page ${page} failed:`,
        error.message
      );

      /*
       * Preserve previously loaded
       * valid data if one page fails.
       */

      break;
    }
  }

  /*
   * Sort internally by timestamp.
   */

  const sorted =
    Array.from(
      map.values()
    ).sort(
      (a, b) =>
        a.timestamp -
        b.timestamp
    );

  const finalMap =
    new Map();

  for (
    const trade of sorted
  ) {
    finalMap.set(
      trade.hash,
      trade
    );
  }

  if (
    finalMap.size > 0
  ) {
    geckoTradesCache.data =
      finalMap;

    geckoTradesCache.time =
      now;
  }

  console.log(
    "================================================="
  );

  console.log(
    "[CHALLENGE] GECKO DATA LOADED"
  );

  console.log(
    "[CHALLENGE] Phase: #02"
  );

  console.log(
    "[CHALLENGE] Pages:",
    pagesLoaded
  );

  console.log(
    "[CHALLENGE] Unique trades:",
    finalMap.size
  );

  console.log(
    "================================================="
  );

  return (
    finalMap.size > 0
      ? finalMap
      : geckoTradesCache.data ||
        new Map()
  );
}

/*
=========================================================
BUILD TRADES FOR PHASE #02
=========================================================
*/

async function buildTrades(
  phase
) {
  const geckoTrades =
    await getGeckoTrades();

  const trades = [];

  let ignoredOutsidePhase = 0;
  let buyCount = 0;
  let sellCount = 0;
  let buyBelowTwo = 0;
  let buyAtLeastTwo = 0;

  for (
    const trade of
      geckoTrades.values()
  ) {
    if (
      !isInPhase(
        trade.timestamp,
        phase
      )
    ) {
      ignoredOutsidePhase += 1;
      continue;
    }

    /*
    =====================================================
    BUY
    =====================================================
    */

    if (
      trade.kind === "buy"
    ) {
      buyCount += 1;

      if (
        trade.volumeUsd >=
        MINIMUM_BUY_FOR_ENTRY
      ) {
        buyAtLeastTwo += 1;
      } else {
        buyBelowTwo += 1;
      }
    }

    /*
    =====================================================
    SELL
    =====================================================
    */

    if (
      trade.kind === "sell"
    ) {
      sellCount += 1;
    }

    trades.push(
      {
        hash:
          trade.hash,

        timestamp:
          trade.timestamp,

        participant:
          trade.participant,

        plpeAmount:
          0,

        plpeDirection:
          trade.kind === "buy"
            ? "BUY"
            : "SELL",

        volumeUsd:
          trade.volumeUsd,

        volumeSource:
          "GECKOTERMINAL_TRADE",

        verified:
          true,
      }
    );
  }

  trades.sort(
    (a, b) =>
      a.timestamp -
      b.timestamp
  );

  console.log(
    "================================================="
  );

  console.log(
    "[CHALLENGE] PHASE #02"
  );

  console.log(
    "[CHALLENGE] Trades:",
    trades.length
  );

  console.log(
    "[CHALLENGE] BUY:",
    buyCount
  );

  console.log(
    "[CHALLENGE] BUY >= $2:",
    buyAtLeastTwo
  );

  console.log(
    "[CHALLENGE] BUY < $2:",
    buyBelowTwo
  );

  console.log(
    "[CHALLENGE] SELL:",
    sellCount
  );

  console.log(
    "[CHALLENGE] Outside Phase #02:",
    ignoredOutsidePhase
  );

  console.log(
    "================================================="
  );

  return trades;
}

/*
=========================================================
BUILD LEADERBOARD
=========================================================
*/

function buildLeaderboard(
  trades
) {
  const wallets =
    new Map();

  for (
    const trade of
      trades
  ) {
    const wallet =
      normalizeAddress(
        trade.participant
      );

    const tradeVolume =
      Number(
        trade.volumeUsd
      );

    if (
      !wallet ||
      !Number.isFinite(
        tradeVolume
      ) ||
      tradeVolume <= 0
    ) {
      continue;
    }

    if (
      !wallets.has(wallet)
    ) {
      wallets.set(
        wallet,
        {
          wallet,

          volume: 0,

          buyVolume: 0,

          sellVolume: 0,

          trades: 0,

          buys: 0,

          sells: 0,

          qualifyingBuys: 0,

          entries: 0,

          entryDetails: [],
        }
      );
    }

    const item =
      wallets.get(wallet);

    /*
    =====================================================
    TOTAL VOLUME
    =====================================================
    */

    item.volume +=
      tradeVolume;

    item.trades += 1;

    /*
    =====================================================
    BUY
    =====================================================
    */

    if (
      trade.plpeDirection ===
      "BUY"
    ) {
      item.buys += 1;

      item.buyVolume +=
        tradeVolume;

      /*
       * Every individual BUY >= $2
       * gives exactly 1 ENTRY.
       *
       * Maximum 6.
       */

      if (
        tradeVolume >=
        MINIMUM_BUY_FOR_ENTRY
      ) {
        item.qualifyingBuys +=
          1;

        if (
          item.entries <
          MAXIMUM_ENTRIES
        ) {
          item.entries +=
            1;

          item.entryDetails.push(
            {
              hash:
                trade.hash,

              type:
                "BUY",

              volume:
                Number(
                  tradeVolume.toFixed(
                    4
                  )
                ),

              source:
                trade.volumeSource,

              entry:
                item.entries,

              entriesTotal:
                item.entries,
            }
          );
        }
      }
    }

    /*
    =====================================================
    SELL
    =====================================================
    */

    else if (
      trade.plpeDirection ===
      "SELL"
    ) {
      item.sells += 1;

      item.sellVolume +=
        tradeVolume;
    }
  }

  /*
  =======================================================
  BUILD RESULT
  =======================================================
  */

  const leaderboard =
    Array.from(
      wallets.values()
    )
      .map(
        (item) => ({
          rank: 0,

          wallet:
            item.wallet,

          volume:
            Number(
              item.volume.toFixed(
                4
              )
            ),

          buyVolume:
            Number(
              item.buyVolume.toFixed(
                4
              )
            ),

          sellVolume:
            Number(
              item.sellVolume.toFixed(
                4
              )
            ),

          trades:
            item.trades,

          buys:
            item.buys,

          sells:
            item.sells,

          qualifyingBuys:
            item.qualifyingBuys,

          entries:
            Math.min(
              item.entries,
              MAXIMUM_ENTRIES
            ),

          entryDetails:
            item.entryDetails,

          qualified:
            item.volume >=
            MINIMUM_VOLUME,
        })
      )

      /*
       * Only wallets with minimum
       * total volume qualify.
       */

      .filter(
        (item) =>
          item.qualified
      )

      /*
       ===================================================
       RANKING — SAME AS FRONTEND
       ===================================================

       1. ENTRIES
       2. VOLUME
       3. TRADES
       4. WALLET
       */

      .sort(
        (a, b) => {

          /*
           * 1. ENTRIES
           */

          if (
            b.entries !==
            a.entries
          ) {
            return (
              b.entries -
              a.entries
            );
          }

          /*
           * 2. VOLUME
           */

          if (
            b.volume !==
            a.volume
          ) {
            return (
              b.volume -
              a.volume
            );
          }

          /*
           * 3. TRANSACTIONS
           */

          if (
            b.trades !==
            a.trades
          ) {
            return (
              b.trades -
              a.trades
            );
          }

          /*
           * 4. WALLET
           *
           * Stable deterministic
           * tie-breaker.
           */

          return a.wallet.localeCompare(
            b.wallet
          );
        }
      );

  /*
   * Assign final ranks.
   */

  leaderboard.forEach(
    (
      item,
      index
    ) => {
      item.rank =
        index + 1;
    }
  );

  return leaderboard;
}

/*
=========================================================
MAIN CALCULATION
=========================================================
*/

async function calculateChallenge(
  phase = PHASE_02
) {
  /*
   * Force Phase #02.
   *
   * There is no Phase #01 anymore.
   */

  phase =
    PHASE_02;

  console.log(
    "======================================"
  );

  console.log(
    "PLPE MONTHLY TRADING CHALLENGE"
  );

  console.log(
    "PHASE #02"
  );

  console.log(
    `${phase.start} -> ${phase.end}`
  );

  console.log(
    "======================================"
  );

  /*
   * LOAD GECKO TRADES
   */

  const verifiedTrades =
    await buildTrades(
      phase
    );

  /*
   * LEADERBOARD
   */

  const leaderboard =
    buildLeaderboard(
      verifiedTrades
    );

  /*
   * STATS
   */

  const verifiedBuys =
    verifiedTrades.filter(
      (trade) =>
        trade.plpeDirection ===
        "BUY"
    ).length;

  const verifiedSells =
    verifiedTrades.filter(
      (trade) =>
        trade.plpeDirection ===
        "SELL"
    ).length;

  const qualifyingBuys =
    verifiedTrades.filter(
      (trade) =>
        trade.plpeDirection ===
          "BUY" &&
        trade.volumeUsd >=
          MINIMUM_BUY_FOR_ENTRY
    ).length;

  const smallBuys =
    verifiedTrades.filter(
      (trade) =>
        trade.plpeDirection ===
          "BUY" &&
        trade.volumeUsd <
          MINIMUM_BUY_FOR_ENTRY
    ).length;

  const totalEntries =
    leaderboard.reduce(
      (sum, wallet) =>
        sum +
        wallet.entries,
      0
    );

  const totalVolume =
    verifiedTrades.reduce(
      (sum, trade) =>
        sum +
        Number(
          trade.volumeUsd || 0
        ),
      0
    );

  return {
    status: "1",

    /*
    =====================================================
    PHASE
    =====================================================
    */

    phase: {
      id:
        PHASE_02.id,

      name:
        PHASE_02.name,

      status:
        PHASE_02.status,

      start:
        PHASE_02.start,

      end:
        PHASE_02.end,

      displayEnd:
        PHASE_02.displayEnd,
    },

    /*
    =====================================================
    RULES
    =====================================================
    */

    rules: {
      minimumVolume:
        MINIMUM_VOLUME,

      minimumBuyForEntry:
        MINIMUM_BUY_FOR_ENTRY,

      maximumEntries:
        MAXIMUM_ENTRIES,

      pair:
        "PLPE/WETH",

      volume:
        "BUY + SELL",

      entries:
        "Each individual BUY >= $2 gives exactly 1 ENTRY. BUY < $2 gives 0 ENTRY. SELL gives 0 ENTRY.",
    },

    /*
    =====================================================
    ENTRIES
    =====================================================
    */

    entries: {
      minimumBuy:
        MINIMUM_BUY_FOR_ENTRY,

      entriesPerBuy:
        1,

      maximumEntries:
        MAXIMUM_ENTRIES,

      rule:
        "BUY >= $2 = 1 ENTRY",

      sell:
        "SELL = 0 ENTRY",
    },

    /*
    =====================================================
    STATS
    =====================================================
    */

    stats: {
      plpeTransfers:
        verifiedTrades.length,

      verifiedTrades:
        verifiedTrades.length,

      verifiedBuys,

      verifiedSells,

      qualifyingBuys,

      buyBelowMinimum:
        smallBuys,

      totalEntries,

      totalVolume:
        Number(
          totalVolume.toFixed(
            4
          )
        ),

      qualifiedWallets:
        leaderboard.length,
    },

    /*
    =====================================================
    LEADERBOARD
    =====================================================
    */

    leaderboard,
  };
}

/*
=========================================================
PUBLIC API
=========================================================
*/

async function getChallenge(
  phaseId
) {
  /*
   * Phase #01 is gone.
   *
   * Any request now resolves to Phase #02.
   */

  const phase =
    PHASE_02;

  /*
   * If an old frontend/API request
   * sends "01", ignore it completely.
   */

  if (
    phaseId &&
    String(phaseId) !== "02"
  ) {
    console.warn(
      `[CHALLENGE] Ignoring requested phase ${phaseId}. Only Phase #02 exists.`
    );
  }

  const key =
    phase.id;

  const cached =
    challengeCache.get(
      key
    );

  const now =
    Date.now();

  if (
    cached &&
    now -
      cached.time <
        CHALLENGE_CACHE_TIME
  ) {
    return cached.data;
  }

  try {
    const result =
      await calculateChallenge(
        PHASE_02
      );

    if (
      result &&
      result.status === "1"
    ) {
      challengeCache.set(
        key,
        {
          data:
            result,

          time:
            Date.now(),
        }
      );
    }

    return result;
  } catch (error) {
    console.error(
      "[CHALLENGE ERROR]",
      error.message
    );

    if (
      cached?.data
    ) {
      console.warn(
        "[CHALLENGE] Returning last successful Phase #02 cache."
      );

      return cached.data;
    }

    throw error;
  }
}

/*
=========================================================
LEADERBOARD API
=========================================================
*/

async function getChallengeLeaderboard(
  phaseId
) {
  const result =
    await getChallenge(
      phaseId
    );

  return {
    phase:
      result.phase,

    stats:
      result.stats,

    leaderboard:
      result.leaderboard,
  };
}

/*
=========================================================
DIAGNOSTICS
=========================================================
*/

async function getChallengeDiagnostics(
  phaseId
) {
  const phase =
    PHASE_02;

  try {
    const data =
      await calculateChallenge(
        phase
      );

    return {
      ...data,

      cached:
        false,

      generatedAt:
        Date.now(),
    };
  } catch (error) {
    const cached =
      challengeCache.get(
        phase.id
      );

    if (
      cached?.data
    ) {
      return {
        ...cached.data,

        cached:
          true,

        generatedAt:
          Date.now(),

        diagnosticError:
          error.message,
      };
    }

    throw error;
  }
}

/*
=========================================================
CLEAR CACHE
=========================================================
*/

function clearChallengeCache(
  phaseId
) {
  /*
   * Only Phase #02 exists.
   */

  if (phaseId) {
    challengeCache.delete(
      "02"
    );

    console.log(
      "[CHALLENGE] Phase #02 cache cleared."
    );

    return;
  }

  challengeCache.clear();

  geckoTradesCache.data =
    null;

  geckoTradesCache.time =
    0;

  console.log(
    "[CHALLENGE] All challenge caches cleared."
  );
}

/*
=========================================================
PHASE LIST
=========================================================
*/

function getChallengePhases() {
  return [
    {
      ...PHASE_02,

      active:
        true,
    },
  ];
}

/*
=========================================================
EXPORTS
=========================================================
*/

module.exports = {
  getChallenge,

  getChallengeLeaderboard,

  getChallengeDiagnostics,

  calculateChallenge,

  clearChallengeCache,

  getChallengePhases,

  getActivePhase,
};
