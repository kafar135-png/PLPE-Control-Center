const axios = require("axios");

const POOL =
  "0xb4ffb01c89ffa24e6d01de95d3d780bc3e835390";

const CACHE_TIME = 60 * 1000;

const cache = new Map();

const pendingRequests = new Map();

function getConfig(tf) {
  switch (tf) {
    case "5m":
      return {
        timeframe: "minute",
        aggregate: 5,
      };

    case "15m":
      return {
        timeframe: "minute",
        aggregate: 15,
      };

    case "1H":
      return {
        timeframe: "hour",
        aggregate: 1,
      };

    case "4H":
      return {
        timeframe: "hour",
        aggregate: 4,
      };

    case "1D":
    default:
      return {
        timeframe: "day",
        aggregate: 1,
      };
  }
}

async function fetchChartData(tf) {
  const { timeframe, aggregate } =
    getConfig(tf);

  const url =
    `https://api.geckoterminal.com/api/v2/networks/eth/pools/${POOL}/ohlcv/${timeframe}`;

  const response = await axios.get(url, {
    params: {
      aggregate,
      limit: 1000,
      currency: "usd",
    },

    timeout: 15000,
  });

  const candles =
    response.data?.data?.attributes?.ohlcv_list ?? [];

  console.log(
    `[CHART API] ${tf} → ${candles.length} candles`
  );

  return response.data;
}

async function getChartData(tf = "1D") {
  const now = Date.now();

  // --------------------------------
  // CACHE
  // --------------------------------

  const cached = cache.get(tf);

  if (
    cached &&
    now - cached.timestamp < CACHE_TIME
  ) {
    console.log(
      `[CHART CACHE] ${tf} → using cached data`
    );

    return cached.data;
  }

  // --------------------------------
  // PREVENT DUPLICATE REQUESTS
  // --------------------------------

  if (pendingRequests.has(tf)) {
    console.log(
      `[CHART WAIT] ${tf} → request already running`
    );

    return pendingRequests.get(tf);
  }

  // --------------------------------
  // NEW REQUEST
  // --------------------------------

  const request = fetchChartData(tf)
    .then((data) => {
      cache.set(tf, {
        data,
        timestamp: Date.now(),
      });

      return data;
    })
    .catch((err) => {
      console.log(
        "========== CHART ERROR =========="
      );

      console.log("Timeframe:", tf);
      console.log(
        "Status:",
        err.response?.status
      );

      if (err.response?.status === 429) {
        console.log(
          "GECKOTERMINAL RATE LIMIT REACHED"
        );
      }

      console.log(err.message);

      console.log(
        "================================="
      );

      // Jeżeli mamy stare dane w cache,
      // zwracamy je zamiast wywalać wykres.
      const oldCache = cache.get(tf);

      if (oldCache?.data) {
        console.log(
          `[CHART FALLBACK] ${tf} → using old cached data`
        );

        return oldCache.data;
      }

      throw err;
    })
    .finally(() => {
      pendingRequests.delete(tf);
    });

  pendingRequests.set(tf, request);

  return request;
}

module.exports = {
  getChartData,
};