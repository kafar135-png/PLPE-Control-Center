const axios = require("axios");
require("dotenv").config();

/*
=========================================================
PLPE MONTHLY TRADING CHALLENGE
PHASE #02 ONLY
=========================================================

PHASE #02
26.08.2026 00:00:00 UTC
-
26.09.2026 00:00:00 UTC

RULES

VOLUME:
- BUY + SELL

TRADES:
- każdy zweryfikowany BUY lub SELL

ENTRIES:
- WYŁĄCZNIE BUY
- BUY >= $2 = 1 ENTRY
- BUY < $2 = 0 ENTRY
- SELL = 0 ENTRY
- MAX 6 ENTRIES / WALLET

MINIMUM TOTAL VOLUME:
- $2

=========================================================
*/

const ETHERSCAN_API_KEY =
  process.env.ETHERSCAN_API_KEY;

const ETHERSCAN_URL =
  "https://api.etherscan.io/v2/api";

const RPC_URL =
  process.env.ETHEREUM_RPC_URL ||
  "https://ethereum-rpc.publicnode.com";

const GECKO_BASE_URL =
  "https://api.geckoterminal.com/api/v2";

/*
=========================================================
CONTRACTS
=========================================================
*/

const PLPE =
  "0xc34e5ef4f7f5607fbd3e060077cd6e2161ab54c7";

const WETH =
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const POOL =
  "0xb4ffb01c89ffa24e6d01de95d3d780bc3e835390";

/*
=========================================================
PHASE #02
=========================================================
*/

const CHALLENGE_PHASE = {
  id: "02",
  name: "MONTHLY CHALLENGE",
  status: "ACTIVE",

  start: "2026-08-26T00:00:00Z",
  end: "2026-09-26T00:00:00Z",

  displayEnd: "2026-09-26T00:00:00Z",
};

/*
=========================================================
CHALLENGE SETTINGS
=========================================================
*/

const MINIMUM_BUY_FOR_ENTRY = 2;
const MAXIMUM_ENTRIES = 6;
const MINIMUM_VOLUME = 2;

/*
=========================================================
ERC20 TRANSFER EVENT
=========================================================
*/

const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

/*
=========================================================
CACHE SETTINGS
=========================================================
*/

const CHALLENGE_CACHE_TIME =
  30 * 1000;

const PLPE_TRANSFERS_CACHE_TIME =
  60 * 1000;

const GECKO_TRADES_CACHE_TIME =
  60 * 1000;

const HISTORICAL_WETH_CACHE_TIME =
  5 * 60 * 1000;

const WETH_PRICE_CACHE_TIME =
  60 * 1000;

/*
=========================================================
CACHES
=========================================================
*/

let challengeCache = {
  data: null,
  time: 0,
};

let plpeTransfersCache = {
  data: null,
  time: 0,
};

let geckoTradesCache = {
  data: null,
  time: 0,
};

const historicalWethCache = new Map();

let wethPriceCache = {
  value: 0,
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

function topicAddress(topic) {
  if (!topic) {
    return "";
  }

  return (
    "0x" +
    String(topic).slice(-40)
  ).toLowerCase();
}

function hexToBigInt(value) {
  if (!value) {
    return 0n;
  }

  try {
    return BigInt(value);
  } catch {
    return 0n;
  }
}

function tokenAmount(
  value,
  decimals = 18
) {
  if (!value) {
    return 0;
  }

  try {
    return (
      Number(BigInt(value)) /
      10 ** decimals
    );
  } catch {
    return 0;
  }
}

function sleep(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

/*
=========================================================
PHASE HELPERS
=========================================================
*/

function phaseStartTimestamp() {
  return Math.floor(
    new Date(
      CHALLENGE_PHASE.start
    ).getTime() / 1000
  );
}

function phaseEndTimestamp() {
  return Math.floor(
    new Date(
      CHALLENGE_PHASE.end
    ).getTime() / 1000
  );
}

function isInChallengePhase(timestamp) {
  const time = Number(timestamp);

  if (!Number.isFinite(time)) {
    return false;
  }

  return (
    time >= phaseStartTimestamp() &&
    time < phaseEndTimestamp()
  );
}

/*
=========================================================
ETHERSCAN REQUEST
=========================================================
*/

async function etherscanRequest(params) {
  if (!ETHERSCAN_API_KEY) {
    throw new Error(
      "ETHERSCAN_API_KEY is missing"
    );
  }

  let lastError = null;

  for (
    let attempt = 1;
    attempt <= 3;
    attempt++
  ) {
    try {
      const response =
        await axios.get(
          ETHERSCAN_URL,
          {
            params: {
              ...params,
              chainid: "1",
              apikey:
                ETHERSCAN_API_KEY,
            },

            timeout: 15000,
          }
        );

      const data =
        response.data;

      if (!data) {
        throw new Error(
          "Etherscan returned empty response"
        );
      }

      if (
        data.status === "0" &&
        typeof data.result === "string"
      ) {
        throw new Error(
          `Etherscan API: ${
            data.message || ""
          } ${data.result}`.trim()
        );
      }

      return data;
    } catch (error) {
      lastError = error;

      console.warn(
        `[CHALLENGE] Etherscan attempt ${attempt}/3 failed:`,
        error.message
      );

      if (attempt < 3) {
        await sleep(
          1000 * attempt
        );
      }
    }
  }

  throw (
    lastError ||
    new Error(
      "Etherscan request failed"
    )
  );
}

/*
=========================================================
GET PLPE TRANSFERS
=========================================================
*/

async function getPLPETransfers() {
  const now = Date.now();

  if (
    Array.isArray(
      plpeTransfersCache.data
    ) &&
    now -
      plpeTransfersCache.time <
      PLPE_TRANSFERS_CACHE_TIME
  ) {
    return plpeTransfersCache.data;
  }

  const allTransfers = [];

  try {
    for (
      let page = 1;
      page <= 20;
      page++
    ) {
      const data =
        await etherscanRequest({
          module: "account",
          action: "tokentx",
          contractaddress: PLPE,
          page,
          offset: 1000,
          sort: "asc",
        });

      if (
        !Array.isArray(
          data.result
        )
      ) {
        throw new Error(
          "Etherscan result is not an array"
        );
      }

      if (
        data.result.length === 0
      ) {
        break;
      }

      allTransfers.push(
        ...data.result
      );

      const last =
        data.result[
          data.result.length - 1
        ];

      if (
        last &&
        Number(
          last.timeStamp
        ) >= phaseEndTimestamp()
      ) {
        break;
      }

      if (
        data.result.length < 1000
      ) {
        break;
      }

      await sleep(250);
    }

    plpeTransfersCache.data =
      allTransfers;

    plpeTransfersCache.time =
      now;

    console.log(
      "[CHALLENGE] PLPE transfers loaded:",
      allTransfers.length
    );

    return allTransfers;
  } catch (error) {
    console.error(
      "[CHALLENGE] Etherscan failed:",
      error.message
    );

    if (
      Array.isArray(
        plpeTransfersCache.data
      ) &&
      plpeTransfersCache.data.length > 0
    ) {
      console.warn(
        "[CHALLENGE] Using last successful PLPE transfer cache"
      );

      return plpeTransfersCache.data;
    }

    throw new Error(
      `Unable to load PLPE transfers: ${error.message}`
    );
  }
}

/*
=========================================================
INTERNAL TRANSACTIONS
=========================================================
*/

async function getInternalTransactions(hash) {
  try {
    const data =
      await etherscanRequest({
        module: "account",
        action: "txlistinternal",
        txhash: hash,
      });

    if (
      !Array.isArray(
        data.result
      )
    ) {
      return [];
    }

    return data.result;
  } catch (error) {
    console.warn(
      "[CHALLENGE] Internal TX error:",
      hash,
      error.message
    );

    return [];
  }
}

/*
=========================================================
RPC
=========================================================
*/

async function rpc(
  method,
  params = []
) {
  const response =
    await axios.post(
      RPC_URL,
      {
        jsonrpc: "2.0",
        id: Date.now(),
        method,
        params,
      },
      {
        timeout: 15000,
        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );

  if (
    response.data?.error
  ) {
    throw new Error(
      response.data.error
        .message ||
        "Ethereum RPC error"
    );
  }

  return response.data?.result;
}

/*
=========================================================
RECEIPT
=========================================================
*/

async function getReceipt(hash) {
  try {
    return await rpc(
      "eth_getTransactionReceipt",
      [hash]
    );
  } catch (error) {
    console.error(
      "[CHALLENGE] Receipt error:",
      hash,
      error.message
    );

    return null;
  }
}

/*
=========================================================
TRANSACTION
=========================================================
*/

async function getTransaction(hash) {
  try {
    return await rpc(
      "eth_getTransactionByHash",
      [hash]
    );
  } catch (error) {
    console.error(
      "[CHALLENGE] Transaction error:",
      hash,
      error.message
    );

    return null;
  }
}

/*
=========================================================
PARSE ERC20 TRANSFER
=========================================================
*/

function parseTransferLog(log) {
  if (!log) {
    return null;
  }

  const topics =
    log.topics || [];

  if (topics.length < 3) {
    return null;
  }

  if (
    String(
      topics[0]
    ).toLowerCase() !==
    TRANSFER_TOPIC
  ) {
    return null;
  }

  return {
    token:
      normalizeAddress(
        log.address
      ),

    from:
      topicAddress(
        topics[1]
      ),

    to:
      topicAddress(
        topics[2]
      ),

    value:
      hexToBigInt(
        log.data
      ),
  };
}

/*
=========================================================
RECEIPT TRANSFERS
=========================================================
*/

function getReceiptTransfers(receipt) {
  const result = {
    plpe: [],
    weth: [],
  };

  if (
    !receipt ||
    !Array.isArray(
      receipt.logs
    )
  ) {
    return result;
  }

  for (
    const log of receipt.logs
  ) {
    const transfer =
      parseTransferLog(log);

    if (!transfer) {
      continue;
    }

    if (
      transfer.token === PLPE
    ) {
      result.plpe.push(
        transfer
      );
    }

    if (
      transfer.token === WETH
    ) {
      result.weth.push(
        transfer
      );
    }
  }

  return result;
}

/*
=========================================================
FIND BUY
=========================================================
*/

function findBuy(
  receipt,
  transaction
) {
  const transfers =
    getReceiptTransfers(
      receipt
    );

  /*
  BUY:
  POOL -> PARTICIPANT
  */

  const buyTransfers =
    transfers.plpe.filter(
      (transfer) =>
        transfer.from === POOL &&
        transfer.to !== POOL
    );

  if (
    buyTransfers.length === 0
  ) {
    return null;
  }

  const participant =
    buyTransfers[0].to;

  /*
  WETH PAYMENT:
  PARTICIPANT -> POOL
  */

  let wethAmount = 0;

  for (
    const weth of transfers.weth
  ) {
    if (
      weth.from === participant &&
      weth.to === POOL
    ) {
      wethAmount +=
        tokenAmount(
          weth.value
        );
    }
  }

  /*
  NATIVE ETH PAYMENT
  */

  let nativeEthAmount = 0;

  if (
    transaction &&
    normalizeAddress(
      transaction.from
    ) === participant
  ) {
    nativeEthAmount =
      tokenAmount(
        transaction.value
      );
  }

  const payment =
    wethAmount > 0
      ? wethAmount
      : nativeEthAmount;

  if (payment <= 0) {
    return null;
  }

  const plpeAmount =
    buyTransfers.reduce(
      (sum, transfer) =>
        sum +
        tokenAmount(
          transfer.value
        ),
      0
    );

  if (plpeAmount <= 0) {
    return null;
  }

  return {
    participant,
    plpeAmount,
    wethAmount: payment,
    plpeDirection: "BUY",

    paymentType:
      wethAmount > 0
        ? "WETH"
        : "NATIVE_ETH",
  };
}

/*
=========================================================
FIND SELL
=========================================================
*/

function findSell(
  receipt,
  internalTransactions
) {
  const transfers =
    getReceiptTransfers(
      receipt
    );

  /*
  SELL:
  PARTICIPANT -> POOL
  */

  const sellTransfers =
    transfers.plpe.filter(
      (transfer) =>
        transfer.to === POOL &&
        transfer.from !== POOL
    );

  if (
    sellTransfers.length === 0
  ) {
    return null;
  }

  const participant =
    sellTransfers[0].from;

  /*
  WETH OUTPUT
  */

  let wethAmount = 0;

  for (
    const weth of transfers.weth
  ) {
    if (
      weth.to === participant &&
      weth.from !== participant
    ) {
      wethAmount +=
        tokenAmount(
          weth.value
        );
    }
  }

  /*
  NATIVE ETH OUTPUT
  */

  let nativeEthAmount = 0;

  if (
    Array.isArray(
      internalTransactions
    )
  ) {
    for (
      const internal of
        internalTransactions
    ) {
      if (
        normalizeAddress(
          internal.to
        ) !== participant
      ) {
        continue;
      }

      if (
        String(
          internal.isError ?? "0"
        ) === "1"
      ) {
        continue;
      }

      const value =
        tokenAmount(
          internal.value
        );

      if (value > 0) {
        nativeEthAmount +=
          value;
      }
    }
  }

  const output =
    wethAmount > 0
      ? wethAmount
      : nativeEthAmount;

  if (output <= 0) {
    return null;
  }

  const plpeAmount =
    sellTransfers.reduce(
      (sum, transfer) =>
        sum +
        tokenAmount(
          transfer.value
        ),
      0
    );

  if (plpeAmount <= 0) {
    return null;
  }

  return {
    participant,
    plpeAmount,
    wethAmount: output,
    plpeDirection: "SELL",

    outputType:
      wethAmount > 0
        ? "WETH"
        : "NATIVE_ETH",
  };
}

/*
=========================================================
GECKOTERMINAL TRADES
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

  try {
    const map = new Map();

    for (
      let page = 1;
      page <= 10;
      page++
    ) {
      const response =
        await axios.get(
          `${GECKO_BASE_URL}/networks/eth/pools/${POOL}/trades`,
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

      const rows =
        response.data?.data;

      if (
        !Array.isArray(rows) ||
        rows.length === 0
      ) {
        break;
      }

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

        const volumeUsd =
          Number(
            attributes.volume_in_usd
          );

        if (
          !hash ||
          !Number.isFinite(
            volumeUsd
          ) ||
          volumeUsd <= 0
        ) {
          continue;
        }

        map.set(
          hash,
          {
            hash,
            volumeUsd,

            kind:
              String(
                attributes.kind || ""
              ).toLowerCase(),

            timestamp:
              attributes.block_timestamp
                ? Math.floor(
                    new Date(
                      attributes.block_timestamp
                    ).getTime() /
                      1000
                  )
                : 0,

            txFrom:
              normalizeAddress(
                attributes.tx_from_address
              ),
          }
        );
      }

      if (
        rows.length < 100
      ) {
        break;
      }

      await sleep(150);
    }

    if (map.size > 0) {
      geckoTradesCache.data =
        map;

      geckoTradesCache.time =
        now;
    }

    return map.size > 0
      ? map
      : geckoTradesCache.data ||
          new Map();
  } catch (error) {
    console.warn(
      "[CHALLENGE] GeckoTerminal trades unavailable:",
      error.message
    );

    return (
      geckoTradesCache.data ||
      new Map()
    );
  }
}

/*
=========================================================
HISTORICAL WETH OHLCV
=========================================================
*/

async function getHistoricalWethCandles() {
  const cached =
    historicalWethCache.get(
      CHALLENGE_PHASE.id
    );

  const now = Date.now();

  if (
    cached &&
    now -
      cached.time <
      HISTORICAL_WETH_CACHE_TIME
  ) {
    return cached.data;
  }

  try {
    const response =
      await axios.get(
        `${GECKO_BASE_URL}/networks/eth/pools/${POOL}/ohlcv/hour`,
        {
          params: {
            aggregate: 1,

            before_timestamp:
              phaseEndTimestamp(),

            limit: 1000,

            currency: "usd",

            token: WETH,
          },

          timeout: 15000,

          headers: {
            Accept:
              "application/json;version=20230203",
          },
        }
      );

    const list =
      response.data?.data
        ?.attributes
        ?.ohlcv_list;

    if (
      !Array.isArray(list)
    ) {
      return cached?.data || [];
    }

    const candles =
      list
        .map((row) => {
          if (
            !Array.isArray(row) ||
            row.length < 5
          ) {
            return null;
          }

          const timestamp =
            Number(row[0]);

          const open =
            Number(row[1]);

          const high =
            Number(row[2]);

          const low =
            Number(row[3]);

          const close =
            Number(row[4]);

          if (
            !Number.isFinite(
              timestamp
            )
          ) {
            return null;
          }

          const price =
            Number.isFinite(close) &&
            close > 0
              ? close
              : open > 0
                ? open
                : 0;

          if (price <= 0) {
            return null;
          }

          return {
            timestamp,
            open,
            high,
            low,
            close,
            price,
          };
        })
        .filter(Boolean)
        .sort(
          (a, b) =>
            a.timestamp -
            b.timestamp
        );

    if (
      candles.length > 0
    ) {
      historicalWethCache.set(
        CHALLENGE_PHASE.id,
        {
          data: candles,
          time: now,
        }
      );
    }

    return candles.length > 0
      ? candles
      : cached?.data || [];
  } catch (error) {
    console.warn(
      "[CHALLENGE] Historical WETH unavailable:",
      error.message
    );

    return cached?.data || [];
  }
}

/*
=========================================================
FIND HISTORICAL WETH PRICE
=========================================================
*/

function findHistoricalWethPrice(
  timestamp,
  candles
) {
  if (
    !Array.isArray(candles) ||
    candles.length === 0
  ) {
    return 0;
  }

  let left = 0;

  let right =
    candles.length - 1;

  let best = null;

  while (
    left <= right
  ) {
    const middle =
      Math.floor(
        (left + right) / 2
      );

    const candle =
      candles[middle];

    if (
      candle.timestamp <=
      timestamp
    ) {
      best = candle;
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }

  return best
    ? best.price
    : 0;
}

/*
=========================================================
CURRENT WETH PRICE
=========================================================
*/

async function getWethPrice() {
  const now = Date.now();

  if (
    wethPriceCache.value > 0 &&
    now -
      wethPriceCache.time <
      WETH_PRICE_CACHE_TIME
  ) {
    return wethPriceCache.value;
  }

  /*
  GeckoTerminal
  */

  try {
    const response =
      await axios.get(
        `${GECKO_BASE_URL}/networks/eth/pools/${POOL}`,
        {
          timeout: 10000,

          headers: {
            Accept:
              "application/json;version=20230203",
          },
        }
      );

    const attributes =
      response.data?.data
        ?.attributes;

    const quotePrice =
      Number(
        attributes
          ?.quote_token_price_usd
      );

    const basePrice =
      Number(
        attributes
          ?.base_token_price_usd
      );

    /*
    PLPE/WETH pool:
    determine WETH price from
    whichever pool side is WETH.
    */

    const baseToken =
      normalizeAddress(
        attributes?.base_token_address
      );

    const quoteToken =
      normalizeAddress(
        attributes?.quote_token_address
      );

    let price = 0;

    if (
      quoteToken === WETH &&
      quotePrice > 0
    ) {
      price = quotePrice;
    }

    if (
      baseToken === WETH &&
      basePrice > 0
    ) {
      price = basePrice;
    }

    if (
      Number.isFinite(price) &&
      price > 0
    ) {
      wethPriceCache.value =
        price;

      wethPriceCache.time =
        now;

      return price;
    }
  } catch (error) {
    console.warn(
      "[CHALLENGE] Gecko WETH price unavailable:",
      error.message
    );
  }

  /*
  DexScreener
  */

  try {
    const response =
      await axios.get(
        `https://api.dexscreener.com/latest/dex/pairs/ethereum/${POOL}`,
        {
          timeout: 10000,
        }
      );

    const pair =
      response.data?.pair ||
      response.data?.pairs?.[0];

    const priceUsd =
      Number(
        pair?.priceUsd
      );

    const priceNative =
      Number(
        pair?.priceNative
      );

    if (
      Number.isFinite(
        priceUsd
      ) &&
      priceUsd > 0 &&
      Number.isFinite(
        priceNative
      ) &&
      priceNative > 0
    ) {
      /*
      priceNative is PLPE per WETH
      in a PLPE/WETH pair.
      Therefore:
      USD PLPE / PLPE per WETH
      = USD WETH
      */

      const price =
        priceUsd /
        priceNative;

      if (
        Number.isFinite(price) &&
        price > 0
      ) {
        wethPriceCache.value =
          price;

        wethPriceCache.time =
          now;

        return price;
      }
    }
  } catch (error) {
    console.warn(
      "[CHALLENGE] DexScreener WETH price unavailable:",
      error.message
    );
  }

  return (
    wethPriceCache.value ||
    0
  );
}

/*
=========================================================
TRADE USD VALUE
=========================================================
*/

function getTradeUsdValue(
  trade,
  geckoTrade,
  historicalCandles,
  fallbackWethPrice
) {
  /*
  1. EXACT GECKOTERMINAL TRADE
  */

  if (
    geckoTrade &&
    Number.isFinite(
      geckoTrade.volumeUsd
    ) &&
    geckoTrade.volumeUsd > 0
  ) {
    return {
      usd: geckoTrade.volumeUsd,

      source:
        "GECKOTERMINAL_TRADE",
    };
  }

  /*
  2. HISTORICAL WETH PRICE
  */

  const historicalPrice =
    findHistoricalWethPrice(
      trade.timestamp,
      historicalCandles
    );

  if (
    historicalPrice > 0
  ) {
    const usd =
      trade.wethAmount *
      historicalPrice;

    if (
      Number.isFinite(usd) &&
      usd > 0
    ) {
      return {
        usd,

        source:
          "GECKOTERMINAL_OHLCV",
      };
    }
  }

  /*
  3. CURRENT FALLBACK
  */

  const fallback =
    trade.wethAmount *
    fallbackWethPrice;

  if (
    Number.isFinite(fallback) &&
    fallback > 0
  ) {
    return {
      usd: fallback,

      source:
        "WETH_FALLBACK",
    };
  }

  return {
    usd: 0,
    source: "UNKNOWN",
  };
}

/*
=========================================================
BUILD VERIFIED TRADES
=========================================================
*/

async function buildTrades(
  plpeTransfers
) {
  const byHash = new Map();

  const trades = [];

  /*
  GROUP PLPE TRANSFERS BY TX HASH
  */

  for (
    const transfer of
      plpeTransfers
  ) {
    if (
      !isInChallengePhase(
        transfer.timeStamp
      )
    ) {
      continue;
    }

    const hash =
      normalizeHash(
        transfer.hash
      );

    if (!hash) {
      continue;
    }

    if (
      !byHash.has(hash)
    ) {
      byHash.set(
        hash,
        []
      );
    }

    byHash
      .get(hash)
      .push(transfer);
  }

  /*
  MARKET DATA
  */

  const geckoTrades =
    await getGeckoTrades();

  const historicalCandles =
    await getHistoricalWethCandles();

  const fallbackWethPrice =
    await getWethPrice();

  console.log(
    "[CHALLENGE] Phase #02 fallback WETH price:",
    fallbackWethPrice
  );

  console.log(
    "[CHALLENGE] Transactions to verify:",
    byHash.size
  );

  /*
  PROCESS EACH TRANSACTION
  */

  for (
    const [
      hash,
      txTransfers,
    ] of byHash
  ) {
    try {
      const receipt =
        await getReceipt(
          hash
        );

      if (!receipt) {
        continue;
      }

      /*
      SUCCESS ONLY
      */

      if (
        receipt.status &&
        String(
          receipt.status
        ).toLowerCase() !==
          "0x1"
      ) {
        continue;
      }

      const transaction =
        await getTransaction(
          hash
        );

      const geckoTrade =
        geckoTrades.get(
          hash
        );

      const timestamp =
        Number(
          txTransfers[0]
            ?.timeStamp || 0
        );

      /*
      ========================================
      BUY
      ========================================
      */

      const buy =
        findBuy(
          receipt,
          transaction
        );

      if (buy) {
        const trade = {
          hash,

          timestamp,

          participant:
            buy.participant,

          plpeAmount:
            buy.plpeAmount,

          plpeDirection:
            "BUY",

          wethAmount:
            buy.wethAmount,

          paymentType:
            buy.paymentType,

          verified: true,
        };

        const usd =
          getTradeUsdValue(
            trade,
            geckoTrade,
            historicalCandles,
            fallbackWethPrice
          );

        trade.volumeUsd =
          usd.usd;

        trade.volumeSource =
          usd.source;

        if (
          trade.volumeUsd > 0
        ) {
          trades.push(
            trade
          );
        }

        continue;
      }

      /*
      ========================================
      SELL
      ========================================
      */

      const internalTransactions =
        await getInternalTransactions(
          hash
        );

      const sell =
        findSell(
          receipt,
          internalTransactions
        );

      if (sell) {
        const trade = {
          hash,

          timestamp,

          participant:
            sell.participant,

          plpeAmount:
            sell.plpeAmount,

          plpeDirection:
            "SELL",

          wethAmount:
            sell.wethAmount,

          outputType:
            sell.outputType,

          verified: true,
        };

        const usd =
          getTradeUsdValue(
            trade,
            geckoTrade,
            historicalCandles,
            fallbackWethPrice
          );

        trade.volumeUsd =
          usd.usd;

        trade.volumeSource =
          usd.source;

        if (
          trade.volumeUsd > 0
        ) {
          trades.push(
            trade
          );
        }
      }
    } catch (error) {
      console.error(
        "[CHALLENGE] TX processing error:",
        hash,
        error.message
      );
    }
  }

  /*
  SORT CHRONOLOGICALLY
  */

  trades.sort(
    (a, b) =>
      a.timestamp -
      b.timestamp
  );

  console.log(
    "[CHALLENGE] Verified trades:",
    trades.length
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
    const trade of trades
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
      wallets.get(
        wallet
      );

    /*
    ========================================
    TOTAL VOLUME
    ========================================
    */

    item.volume +=
      tradeVolume;

    item.trades += 1;

    /*
    ========================================
    BUY
    ========================================
    */

    if (
      trade.plpeDirection ===
      "BUY"
    ) {
      item.buys += 1;

      item.buyVolume +=
        tradeVolume;

      /*
      BUY >= $2
      = 1 ENTRY

      BUY < $2
      = 0 ENTRY

      MAX 6
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
    ========================================
    SELL
    ========================================
    */

    else if (
      trade.plpeDirection ===
      "SELL"
    ) {
      item.sells += 1;

      item.sellVolume +=
        tradeVolume;

      /*
      SELL = 0 ENTRY
      */
    }
  }

  /*
  ========================================
  FINAL LEADERBOARD
  ========================================
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
      .filter(
        (item) =>
          item.qualified
      )
      .sort(
        (a, b) =>
          b.volume -
            a.volume ||
          b.entries -
            a.entries
      );

  /*
  RANKING
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

async function calculateChallenge() {
  console.log(
    "======================================"
  );

  console.log(
    "PLPE MONTHLY TRADING CHALLENGE"
  );

  console.log(
    "PHASE #02 ONLY"
  );

  console.log(
    `${CHALLENGE_PHASE.start} -> ${CHALLENGE_PHASE.end}`
  );

  console.log(
    "======================================"
  );

  /*
  LOAD ALL PLPE TRANSFERS
  */

  const allPLPE =
    await getPLPETransfers();

  /*
  ONLY PHASE #02
  */

  const phasePLPE =
    allPLPE.filter(
      (tx) =>
        isInChallengePhase(
          tx.timeStamp
        )
    );

  console.log(
    "[CHALLENGE] Phase #02 PLPE transfers:",
    phasePLPE.length
  );

  /*
  VERIFY TRADES
  */

  const verifiedTrades =
    await buildTrades(
      phasePLPE
    );

  /*
  LEADERBOARD
  */

  const leaderboard =
    buildLeaderboard(
      verifiedTrades
    );

  /*
  STATS
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

  /*
  FINAL RESULT
  */

  return {
    status: "1",

    phase: {
      id:
        CHALLENGE_PHASE.id,

      name:
        CHALLENGE_PHASE.name,

      status:
        CHALLENGE_PHASE.status,

      start:
        CHALLENGE_PHASE.start,

      end:
        CHALLENGE_PHASE.end,

      displayEnd:
        CHALLENGE_PHASE.displayEnd,
    },

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

    stats: {
      plpeTransfers:
        phasePLPE.length,

      verifiedTrades:
        verifiedTrades.length,

      verifiedBuys,

      verifiedSells,

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

    leaderboard,
  };
}

/*
=========================================================
PUBLIC API
=========================================================
*/

async function getChallenge() {
  const now = Date.now();

  /*
  CACHE
  */

  if (
    challengeCache.data &&
    now -
      challengeCache.time <
      CHALLENGE_CACHE_TIME
  ) {
    return challengeCache.data;
  }

  try {
    const result =
      await calculateChallenge();

    if (
      result &&
      result.status === "1"
    ) {
      challengeCache = {
        data: result,
        time: Date.now(),
      };
    }

    return result;
  } catch (error) {
    console.error(
      "[CHALLENGE ERROR]",
      error.message
    );

    /*
    NEVER RETURN FAKE ZERO DATA
    */

    if (
      challengeCache.data
    ) {
      console.warn(
        "[CHALLENGE] Returning last successful cache."
      );

      return challengeCache.data;
    }

    throw error;
  }
}

/*
=========================================================
LEADERBOARD API
=========================================================
*/

async function getChallengeLeaderboard() {
  const result =
    await getChallenge();

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

async function getChallengeDiagnostics() {
  try {
    const data =
      await calculateChallenge();

    return {
      ...data,

      cached: false,

      generatedAt:
        Date.now(),
    };
  } catch (error) {
    if (
      challengeCache.data
    ) {
      return {
        ...challengeCache.data,

        cached: true,

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

function clearChallengeCache() {
  challengeCache = {
    data: null,
    time: 0,
  };

  plpeTransfersCache = {
    data: null,
    time: 0,
  };

  geckoTradesCache = {
    data: null,
    time: 0,
  };

  historicalWethCache.clear();

  wethPriceCache = {
    value: 0,
    time: 0,
  };

  console.log(
    "[CHALLENGE] All Phase #02 caches cleared."
  );
}

/*
=========================================================
PHASE
=========================================================
*/

function getChallengePhases() {
  return [
    {
      ...CHALLENGE_PHASE,
      active: true,
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

  getActivePhase: () =>
    CHALLENGE_PHASE,
};
