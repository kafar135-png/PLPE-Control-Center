const axios = require("axios");

const POOL =
  "0xb4ffb01c89ffa24e6d01de95d3d780bc3e835390";

let cache = {
  price: 0,
  liquidity: 0,
  marketCap: 0,
  volume24h: 0,
  priceChange24h: 0,
};

let lastFetch = 0;

const CACHE_TIME = 30000;

async function getMarketData() {
  const now = Date.now();

  if (now - lastFetch < CACHE_TIME) {
    return cache;
  }

  try {
    const response = await axios.get(
      `https://api.geckoterminal.com/api/v2/networks/eth/pools/${POOL}`,
      {
        timeout: 10000,
      }
    );

    const attr = response.data?.data?.attributes;

    if (!attr) {
      throw new Error("GeckoTerminal: missing pool attributes");
    }

    const price = Number(
      attr.base_token_price_usd ?? 0
    );

    const liquidity = Number(
      attr.reserve_in_usd ?? 0
    );

    /*
     * Prefer real market cap.
     * If GeckoTerminal does not provide it,
     * fall back to FDV.
     */
    const marketCap = Number(
      attr.market_cap_usd ??
      attr.fdv_usd ??
      0
    );

    const volume24h = Number(
      attr.volume_usd?.h24 ?? 0
    );

    const priceChange24h = Number(
      attr.price_change_percentage?.h24 ?? 0
    );

    cache = {
      price,
      liquidity,
      marketCap,
      volume24h,
      priceChange24h,
    };

    lastFetch = now;

    console.log("========== MARKET DATA ==========");
    console.log("PRICE:", price);
    console.log("LIQUIDITY:", liquidity);
    console.log("MARKET CAP:", marketCap);
    console.log("VOLUME 24H:", volume24h);
    console.log("CHANGE 24H:", priceChange24h);
    console.log("=================================");

    return cache;
  } catch (err) {
    console.warn(
      "Gecko unavailable - returning cached data"
    );

    if (err.response?.data) {
      console.dir(
        err.response.data,
        { depth: null }
      );
    } else {
      console.warn(err.message);
    }

    return cache;
  }
}

module.exports = {
  getMarketData,
};