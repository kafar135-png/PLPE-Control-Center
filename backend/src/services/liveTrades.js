const axios = require("axios");
require("dotenv").config();

// =========================================================
// CONFIG
// =========================================================

const GECKO_BASE_URL =
  process.env.GECKO_BASE_URL ||
  "https://api.geckoterminal.com/api/v2";

const NETWORK = "eth";

const POOL =
  "0xb4ffb01c89ffa24e6d01de95d3d780bc3e835390";

// PLPE token
const PLPE =
  "0x0000000000000000000000000000000000000000"
    .toLowerCase();

// WETH
const WETH =
  "0x0000000000000000000000000000000000000000"
    .toLowerCase();

const CACHE_TIME = 10 * 1000;

let cache = [];
let cacheTime = 0;

// =========================================================
// HELPERS
// =========================================================

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeAddress(value) {
  if (!value) return "";

  return String(value).trim().toLowerCase();
}

function getAttributes(row) {
  return row?.attributes || {};
}

// =========================================================
// GET LIVE TRADES
// =========================================================

async function getLiveTrades() {
  const now = Date.now();

  // -------------------------------------------------------
  // CACHE
  // -------------------------------------------------------

  if (
    cache.length > 0 &&
    now - cacheTime < CACHE_TIME
  ) {
    return cache;
  }

  try {
    console.log(
      "[LIVE TRADES] Loading GeckoTerminal trades..."
    );

    const url =
      `${GECKO_BASE_URL}/networks/${NETWORK}/pools/${POOL}/trades`;

    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        Accept:
          "application/json;version=20230203",
      },
    });

    const rows =
      response.data?.data;

    if (!Array.isArray(rows)) {
      throw new Error(
        "GeckoTerminal returned invalid trades data"
      );
    }

    // -------------------------------------------------------
    // MAP TRADES
    // -------------------------------------------------------

    const trades = rows
      .map((row) => {
        const attributes =
          getAttributes(row);

        const hash =
          normalizeAddress(
            attributes.tx_hash
          );

        if (!hash) {
          return null;
        }

        // ---------------------------------------------------
        // BASIC GECKO DATA
        // ---------------------------------------------------

        const kind =
          String(
            attributes.kind || ""
          ).toLowerCase();

        const volumeUsd =
          toNumber(
            attributes.volume_in_usd
          );

        const amountIn =
          toNumber(
            attributes.amount_in
          );

        const amountOut =
          toNumber(
            attributes.amount_out
          );

        const priceFromUsd =
          toNumber(
            attributes.price_from_in_usd
          );

        const priceToUsd =
          toNumber(
            attributes.price_to_in_usd
          );

        const txFrom =
          normalizeAddress(
            attributes.tx_from_address
          );

        const timestamp =
          attributes.block_timestamp
            ? Math.floor(
                new Date(
                  attributes.block_timestamp
                ).getTime() / 1000
              )
            : 0;

        // ---------------------------------------------------
        // BUY / SELL
        // ---------------------------------------------------

        let type = "TRADE";

        if (kind === "buy") {
          type = "BUY";
        } else if (kind === "sell") {
          type = "SELL";
        }

        // ---------------------------------------------------
        // IMPORTANT
        //
        // GeckoTerminal's amount_in / amount_out are
        // expressed in the direction of the swap.
        //
        // For PLPE/WETH:
        //
        // BUY:
        //   WETH -> PLPE
        //   amountOut = PLPE
        //
        // SELL:
        //   PLPE -> WETH
        //   amountIn = PLPE
        //
        // Therefore:
        //
        // BUY  => PLPE amount = amountOut
        // SELL => PLPE amount = amountIn
        // ---------------------------------------------------

        let plpeAmount = 0;
        let plpePrice = 0;

        if (type === "BUY") {
          plpeAmount = amountOut;

          // price_to_in_usd is the USD price
          // of the token received.
          plpePrice = priceToUsd;
        } else if (type === "SELL") {
          plpeAmount = amountIn;

          // price_from_in_usd is the USD price
          // of the token being sold.
          plpePrice = priceFromUsd;
        }

        // ---------------------------------------------------
        // FALLBACK PRICE
        //
        // If Gecko doesn't provide the correct side price,
        // calculate PLPE price from USD volume / PLPE amount.
        // ---------------------------------------------------

        if (
          (!Number.isFinite(plpePrice) ||
            plpePrice <= 0) &&
          plpeAmount > 0 &&
          volumeUsd > 0
        ) {
          plpePrice =
            volumeUsd / plpeAmount;
        }

        // ---------------------------------------------------
        // FALLBACK AMOUNT
        //
        // If amount side is missing but we have volume and
        // PLPE price, reconstruct the PLPE amount.
        // ---------------------------------------------------

        if (
          (!Number.isFinite(plpeAmount) ||
            plpeAmount <= 0) &&
          plpePrice > 0 &&
          volumeUsd > 0
        ) {
          plpeAmount =
            volumeUsd / plpePrice;
        }

        // ---------------------------------------------------
        // RETURN NORMALIZED TRADE
        // ---------------------------------------------------

        return {
          hash,

          from:
            txFrom || null,

          to:
            null,

          type,

          amount:
            Number.isFinite(plpeAmount)
              ? plpeAmount
              : 0,

          price:
            Number.isFinite(plpePrice)
              ? plpePrice
              : 0,

          volumeUsd:
            Number.isFinite(volumeUsd)
              ? volumeUsd
              : 0,

          timestamp,

          verified: true,

          source:
            "GECKOTERMINAL",
        };
      })
      .filter(Boolean);

    // -------------------------------------------------------
    // SORT NEWEST FIRST
    // -------------------------------------------------------

    trades.sort(
      (a, b) =>
        Number(b.timestamp) -
        Number(a.timestamp)
    );

    // -------------------------------------------------------
    // REMOVE DUPLICATES
    // -------------------------------------------------------

    const uniqueTrades = [];
    const seen = new Set();

    for (const trade of trades) {
      if (seen.has(trade.hash)) {
        continue;
      }

      seen.add(trade.hash);
      uniqueTrades.push(trade);
    }

    // -------------------------------------------------------
    // CACHE VALID RESULT
    // -------------------------------------------------------

    if (uniqueTrades.length > 0) {
      cache = uniqueTrades;
      cacheTime = now;
    }

    console.log(
      "[LIVE TRADES] Loaded:",
      uniqueTrades.length
    );

    if (uniqueTrades.length > 0) {
      console.log(
        "[LIVE TRADES] Latest:",
        uniqueTrades[0]
      );
    }

    return uniqueTrades.length > 0
      ? uniqueTrades
      : cache;
  } catch (err) {
    console.error(
      "[LIVE TRADES] GeckoTerminal error:",
      err.message
    );

    // -------------------------------------------------------
    // STALE CACHE
    // -------------------------------------------------------

    if (cache.length > 0) {
      console.warn(
        "[LIVE TRADES] Using previous cache:",
        cache.length
      );

      return cache;
    }

    throw new Error(
      `Unable to load live trades: ${err.message}`
    );
  }
}

// =========================================================
// CLEAR CACHE
// =========================================================

function clearLiveTradesCache() {
  cache = [];
  cacheTime = 0;

  console.log(
    "[LIVE TRADES] Cache cleared."
  );
}

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  getLiveTrades,
  clearLiveTradesCache,
};