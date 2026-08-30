const axios = require("axios");
require("dotenv").config();

/*
=========================================================
PLPE MONTHLY TRADING CHALLENGE
=========================================================

SOURCE OF TRADES:
Etherscan PLPE token transfers

MARKET USD VALUE:
1. GeckoTerminal trade
2. Historical GeckoTerminal WETH/USD
3. Current WETH price fallback

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

ACTIVE:
PHASE #02
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
  "0xc34e5ef4f7f5607fbd3e060077cd6e2161ab54c7"
    .toLowerCase();

const WETH =
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    .toLowerCase();

const POOL =
  "0xb4ffb01c89ffa24e6d01de95d3d780bc3e835390"
    .toLowerCase();

/*
=========================================================
PHASE #02 ONLY
=========================================================
*/

const PHASE_02 = {
  id: "02",
  name: "MONTHLY CHALLENGE",
  status: "ACTIVE",

  start:
    "2026-08-26T00:00:00Z",

  end:
    "2026-09-26T00:00:00Z",

  displayEnd:
    "2026-09-26T00:00:00Z",
};

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
ERC20 TRANSFER EVENT
=========================================================
*/

const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

/*
=========================================================
CACHE
=========================================================
*/

const CHALLENGE_CACHE_TIME =
  30 * 1000;

const PLPE_TRANSFERS_CACHE_TIME =
  30 * 1000;

const GECKO_TRADES_CACHE_TIME =
  30 * 1000;

const HISTORICAL_WETH_CACHE_TIME =
  5 * 60 * 1000;

const WETH_PRICE_CACHE_TIME =
  60 * 1000;

const challengeCache =
  new Map();

const plpeTransfersCache = {
  data: null,
  time: 0,
};

const geckoTradesCache = {
  data: null,
  time: 0,
};

const historicalWethCache =
  new Map();

const wethPriceCache = {
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
    String(topic)
      .slice(-40)
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
  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms)
  );
}

/*
=========================================================
PHASE HELPERS
=========================================================
*/

function phaseStartTimestamp(
  phase
) {
  return Math.floor(
    new Date(
      phase.start
    ).getTime() / 1000
  );
}

function phaseEndTimestamp(
  phase
) {
  return Math.floor(
    new Date(
      phase.end
    ).getTime() / 1000
  );
}

function isInPhase(
  timestamp,
  phase
) {
  const time =
    Number(timestamp);

  if (
    !Number.isFinite(time)
  ) {
    return false;
  }

  return (
    time >=
      phaseStartTimestamp(
        phase
      ) &&
    time <
      phaseEndTimestamp(
        phase
      )
  );
}

function getPhaseById(id) {
  return (
    PHASES.find(
      (phase) =>
        phase.id ===
        String(id)
    ) || null
  );
}

function getActivePhase() {
  return PHASE_02;
}

/*
=========================================================
ETHERSCAN REQUEST
=========================================================
*/

async function etherscanRequest(
  params
) {
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

              chainid:
                "1",

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
        typeof data.result ===
          "string"
      ) {
        throw new Error(
          `Etherscan API: ${
            data.message || ""
          } ${
            data.result || ""
          }`.trim()
        );
      }

      return data;
    } catch (error) {
      lastError = error;

      console.warn(
        `[CHALLENGE] Etherscan attempt ${attempt}/3 failed:`,
        error.message
      );

      if (
        attempt < 3
      ) {
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
LOAD PLPE TRANSFERS
=========================================================

THIS IS THE IMPORTANT PART.

We DO NOT use Gecko /trades as the
master list.

Etherscan token transfers are the
master list of transactions.
=========================================================
*/

async function getPLPETransfers() {
  const now =
    Date.now();

  if (
    Array.isArray(
      plpeTransfersCache.data
    ) &&
    now -
      plpeTransfersCache.time <
        PLPE_TRANSFERS_CACHE_TIME
  ) {
    return (
      plpeTransfersCache.data
    );
  }

  const allTransfers = [];

  try {
    for (
      let page = 1;
      page <= 20;
      page++
    ) {
      console.log(
        `[CHALLENGE] Loading Etherscan PLPE page ${page}...`
      );

      const data =
        await etherscanRequest({
          module: "account",

          action: "tokentx",

          contractaddress:
            PLPE,

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
          "Etherscan PLPE result is not an array"
        );
      }

      if (
        data.result.length ===
        0
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
        ) >=
          phaseEndTimestamp(
            PHASE_02
          )
      ) {
        break;
      }

      if (
        data.result.length <
        1000
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
      "========================================"
    );

    console.log(
      "[CHALLENGE] PLPE TRANSFERS LOADED:",
      allTransfers.length
    );

    console.log(
      "========================================"
    );

    return allTransfers;
  } catch (error) {
    console.error(
      "[CHALLENGE] Etherscan PLPE failed:",
      error.message
    );

    if (
      Array.isArray(
        plpeTransfersCache.data
      ) &&
      plpeTransfersCache.data
        .length > 0
    ) {
      return (
        plpeTransfersCache.data
      );
    }

    throw error;
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

  return (
    response.data?.result
  );
}

/*
=========================================================
RECEIPT
=========================================================
*/

async function getReceipt(
  hash
) {
  try {
    return await rpc(
      "eth_getTransactionReceipt",
      [hash]
    );
  } catch (error) {
    console.warn(
      "[CHALLENGE] Receipt unavailable:",
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

async function getTransaction(
  hash
) {
  try {
    return await rpc(
      "eth_getTransactionByHash",
      [hash]
    );
  } catch (error) {
    console.warn(
      "[CHALLENGE] Transaction unavailable:",
      hash,
      error.message
    );

    return null;
  }
}

/*
=========================================================
INTERNAL TRANSACTIONS
=========================================================
*/

async function getInternalTransactions(
  hash
) {
  try {
    const data =
      await etherscanRequest({
        module: "account",

        action:
          "txlistinternal",

        txhash:
          hash,
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
PARSE ERC20 TRANSFER
=========================================================
*/

function parseTransferLog(
  log
) {
  if (!log) {
    return null;
  }

  const topics =
    log.topics || [];

  if (
    topics.length < 3
  ) {
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

function getReceiptTransfers(
  receipt
) {
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
    const log of
      receipt.logs
  ) {
    const transfer =
      parseTransferLog(
        log
      );

    if (!transfer) {
      continue;
    }

    if (
      transfer.token ===
      PLPE
    ) {
      result.plpe.push(
        transfer
      );
    }

    if (
      transfer.token ===
      WETH
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

  const buyTransfers =
    transfers.plpe.filter(
      (transfer) =>
        transfer.from ===
          POOL &&
        transfer.to !==
          POOL
    );

  if (
    buyTransfers.length ===
    0
  ) {
    return null;
  }

  const participant =
    buyTransfers[0].to;

  let wethAmount = 0;

  for (
    const weth of
      transfers.weth
  ) {
    if (
      weth.from ===
      participant &&
      weth.to === POOL
    ) {
      wethAmount +=
        tokenAmount(
          weth.value
        );
    }
  }

  let nativeEthAmount =
    0;

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

  if (
    payment <= 0
  ) {
    return null;
  }

  const plpeAmount =
    buyTransfers.reduce(
      (
        sum,
        transfer
      ) =>
        sum +
        tokenAmount(
          transfer.value
        ),
      0
    );

  if (
    plpeAmount <= 0
  ) {
    return null;
  }

  return {
    participant,

    plpeAmount,

    wethAmount:
      payment,

    plpeDirection:
      "BUY",

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

  const sellTransfers =
    transfers.plpe.filter(
      (transfer) =>
        transfer.to ===
          POOL &&
        transfer.from !==
          POOL
    );

  if (
    sellTransfers.length ===
    0
  ) {
    return null;
  }

  const participant =
    sellTransfers[0].from;

  let wethAmount = 0;

  for (
    const weth of
      transfers.weth
  ) {
    if (
      weth.to ===
        participant &&
      weth.from !==
        participant
    ) {
      wethAmount +=
        tokenAmount(
          weth.value
        );
    }
  }

  let nativeEthAmount =
    0;

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
        ) !==
        participant
      ) {
        continue;
      }

      if (
        String(
          internal.isError ??
            "0"
        ) === "1"
      ) {
        continue;
      }

      const value =
        tokenAmount(
          internal.value
        );

      if (
        value > 0
      ) {
        nativeEthAmount +=
          value;
      }
    }
  }

  const output =
    wethAmount > 0
      ? wethAmount
      : nativeEthAmount;

  if (
    output <= 0
  ) {
    return null;
  }

  const plpeAmount =
    sellTransfers.reduce(
      (
        sum,
        transfer
      ) =>
        sum +
        tokenAmount(
          transfer.value
        ),
      0
    );

  if (
    plpeAmount <= 0
  ) {
    return null;
  }

  return {
    participant,

    plpeAmount,

    wethAmount:
      output,

    plpeDirection:
      "SELL",

    outputType:
      wethAmount > 0
        ? "WETH"
        : "NATIVE_ETH",
  };
}

/*
=========================================================
GECKO TRADES
=========================================================

IMPORTANT:

Gecko is NOT the source of the transaction list.

It is only used to attach exact USD
value to a transaction when available.
=========================================================
*/

async function getGeckoTrades() {
  const now =
    Date.now();

  if (
    geckoTradesCache.data instanceof
      Map &&
    now -
      geckoTradesCache.time <
        GECKO_TRADES_CACHE_TIME
  ) {
    return (
      geckoTradesCache.data
    );
  }

  try {
    const map =
      new Map();

    /*
     * Try several pages.
     *
     * Duplicate pages are harmless.
     */

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
                attributes.kind ||
                  ""
              ).toLowerCase(),

            timestamp:
              attributes
                .block_timestamp
                ? Math.floor(
                    new Date(
                      attributes.block_timestamp
                    ).getTime() /
                      1000
                  )
                : 0,
          }
        );
      }

      /*
       * Gecko sometimes returns
       * the same page repeatedly.
       *
       * Do NOT use page length as
       * the challenge transaction count.
       */

      if (
        rows.length < 100
      ) {
        break;
      }

      await sleep(150);
    }

    if (
      map.size > 0
    ) {
      geckoTradesCache.data =
        map;

      geckoTradesCache.time =
        now;
    }

    console.log(
      "[CHALLENGE] Gecko price matches:",
      map.size
    );

    return (
      map.size > 0
        ? map
        : geckoTradesCache.data ||
          new Map()
    );
  } catch (error) {
    console.warn(
      "[CHALLENGE] Gecko trades unavailable:",
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
HISTORICAL WETH PRICE
=========================================================
*/

async function getHistoricalWethCandles(
  phase
) {
  const cached =
    historicalWethCache.get(
      phase.id
    );

  const now =
    Date.now();

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
              phaseEndTimestamp(
                phase
              ),

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
      return (
        cached?.data || []
      );
    }

    const candles =
      list
        .map(
          (row) => {
            if (
              !Array.isArray(
                row
              ) ||
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
              Number.isFinite(
                close
              ) &&
              close > 0
                ? close
                : open > 0
                  ? open
                  : 0;

            if (
              price <= 0
            ) {
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
          }
        )
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
        phase.id,
        {
          data:
            candles,

          time:
            now,
        }
      );
    }

    return (
      candles.length > 0
        ? candles
        : cached?.data || []
    );
  } catch (error) {
    console.warn(
      `[CHALLENGE] Historical WETH unavailable:`,
      error.message
    );

    return (
      cached?.data || []
    );
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
    !Array.isArray(
      candles
    ) ||
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

      left =
        middle + 1;
    } else {
      right =
        middle - 1;
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
  const now =
    Date.now();

  if (
    wethPriceCache.value >
      0 &&
    now -
      wethPriceCache.time <
        WETH_PRICE_CACHE_TIME
  ) {
    return (
      wethPriceCache.value
    );
  }

  /*
   * Gecko pool price
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

    const price =
      Number.isFinite(
        quotePrice
      ) &&
      quotePrice > 0
        ? quotePrice
        : basePrice;

    if (
      Number.isFinite(
        price
      ) &&
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
   * DexScreener fallback
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
      const price =
        priceUsd /
        priceNative;

      if (
        Number.isFinite(
          price
        ) &&
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
USD VALUE
=========================================================
*/

function getTradeUsdValue(
  trade,
  geckoTrade,
  historicalCandles,
  fallbackWethPrice
) {
  /*
   * 1. EXACT GECKO TRADE
   */

  if (
    geckoTrade &&
    Number.isFinite(
      geckoTrade.volumeUsd
    ) &&
    geckoTrade.volumeUsd > 0
  ) {
    return {
      usd:
        geckoTrade.volumeUsd,

      source:
        "GECKOTERMINAL_TRADE",
    };
  }

  /*
   * 2. HISTORICAL WETH/USD
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
      Number.isFinite(
        usd
      ) &&
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
   * 3. CURRENT FALLBACK
   */

  const fallback =
    trade.wethAmount *
    fallbackWethPrice;

  if (
    Number.isFinite(
      fallback
    ) &&
    fallback > 0
  ) {
    return {
      usd:
        fallback,

      source:
        "WETH_FALLBACK",
    };
  }

  return {
    usd: 0,

    source:
      "UNKNOWN",
  };
}

/*
=========================================================
BUILD VERIFIED TRADES
=========================================================
*/

async function buildTrades(
  plpeTransfers,
  phase
) {
  const byHash =
    new Map();

  const trades = [];

  /*
   * GROUP PLPE TRANSFERS
   */

  for (
    const transfer of
      plpeTransfers
  ) {
    if (
      !isInPhase(
        transfer.timeStamp,
        phase
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

  console.log(
    "[CHALLENGE] Unique Phase #02 TX:",
    byHash.size
  );

  /*
   * MARKET DATA
   */

  const geckoTrades =
    await getGeckoTrades();

  const historicalCandles =
    await getHistoricalWethCandles(
      phase
    );

  const fallbackWethPrice =
    await getWethPrice();

  /*
   * PROCESS EVERY TX FROM
   * ETHERSCAN PLPE TRANSFERS
   */

  for (
    const [
      hash,
      txTransfers,
    ] of byHash
  ) {
    try {
      /*
       * IMPORTANT:
       *
       * Do not make the Gecko trade
       * list decide whether the TX exists.
       */

      const receipt =
        await getReceipt(
          hash
        );

      if (!receipt) {
        console.warn(
          "[CHALLENGE] Receipt unavailable, skipping:",
          hash
        );

        continue;
      }

      /*
       * Successful TX only.
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
       * BUY
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
       * SELL
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

  trades.sort(
    (a, b) =>
      a.timestamp -
      b.timestamp
  );

  console.log(
    "========================================"
  );

  console.log(
    "[CHALLENGE] VERIFIED TRADES:",
    trades.length
  );

  console.log(
    "========================================"
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
      !wallets.has(
        wallet
      )
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
     * TOTAL VOLUME
     */

    item.volume +=
      tradeVolume;

    item.trades +=
      1;

    /*
     * BUY
     */

    if (
      trade.plpeDirection ===
      "BUY"
    ) {
      item.buys +=
        1;

      item.buyVolume +=
        tradeVolume;

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
     * SELL
     */

    if (
      trade.plpeDirection ===
      "SELL"
    ) {
      item.sells +=
        1;

      item.sellVolume +=
        tradeVolume;
    }
  }

  /*
   * BUILD RESULT
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
      /*
       * CORRECT RANKING
       *
       * 1. ENTRIES
       * 2. VOLUME
       * 3. TRADES
       * 4. WALLET
       */
      .sort(
        (a, b) => {
          if (
            b.entries !==
            a.entries
          ) {
            return (
              b.entries -
              a.entries
            );
          }

          if (
            b.volume !==
            a.volume
          ) {
            return (
              b.volume -
              a.volume
            );
          }

          if (
            b.trades !==
            a.trades
          ) {
            return (
              b.trades -
              a.trades
            );
          }

          return a.wallet.localeCompare(
            b.wallet
          );
        }
      );

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
  phase =
    PHASE_02;

  console.log(
    "========================================"
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
    "========================================"
  );

  /*
   * MASTER TRANSACTION SOURCE
   */

  const allPLPE =
    await getPLPETransfers();

  const phasePLPE =
    allPLPE.filter(
      (tx) =>
        isInPhase(
          tx.timeStamp,
          phase
        )
    );

  console.log(
    "[CHALLENGE] PLPE transfers in Phase #02:",
    phasePLPE.length
  );

  /*
   * VERIFIED TRADES
   */

  const verifiedTrades =
    await buildTrades(
      phasePLPE,
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
      (
        sum,
        wallet
      ) =>
        sum +
        wallet.entries,
      0
    );

  const totalVolume =
    verifiedTrades.reduce(
      (
        sum,
        trade
      ) =>
        sum +
        Number(
          trade.volumeUsd ||
            0
        ),
      0
    );

  return {
    status: "1",

    phase: {
      id:
        phase.id,

      name:
        phase.name,

      status:
        phase.status,

      start:
        phase.start,

      end:
        phase.end,

      displayEnd:
        phase.displayEnd,
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
  const phase =
    PHASE_02;

  if (
    phaseId &&
    String(phaseId) !==
      "02"
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
        phase
      );

    /*
     * NEVER cache a zero result
     * caused by an upstream failure.
     */

    if (
      result &&
      result.status ===
        "1"
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
        "[CHALLENGE] Returning last successful cache."
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
}

/*
=========================================================
CLEAR CACHE
=========================================================
*/

function clearChallengeCache(
  phaseId
) {
  if (
    phaseId
  ) {
    challengeCache.delete(
      "02"
    );

    plpeTransfersCache.data =
      null;

    plpeTransfersCache.time =
      0;

    geckoTradesCache.data =
      null;

    geckoTradesCache.time =
      0;

    historicalWethCache.clear();

    wethPriceCache.value =
      0;

    wethPriceCache.time =
      0;

    console.log(
      "[CHALLENGE] Phase #02 cache cleared."
    );

    return;
  }

  challengeCache.clear();

  plpeTransfersCache.data =
    null;

  plpeTransfersCache.time =
    0;

  geckoTradesCache.data =
    null;

  geckoTradesCache.time =
    0;

  historicalWethCache.clear();

  wethPriceCache.value =
    0;

  wethPriceCache.time =
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

  getActivePhase,
};
