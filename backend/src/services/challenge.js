const axios = require("axios");
require("dotenv").config();

/*
=========================================================
PLPE MONTHLY TRADING CHALLENGE
=========================================================

PHASE #01
15.08.2026 00:00:00
-
25.08.2026 23:59:59

PHASE #02
26.08.2026 00:01:00
-
25.09.2026 23:59:59

RULES

VOLUME:
- BUY + SELL

TRADES:
- każdy zweryfikowany BUY + SELL

ENTRIES:
- WYŁĄCZNIE BUY
- każdy pojedynczy BUY >= $2 = 1 ENTRY
- BUY < $2 = 0 ENTRY
- SELL = 0 ENTRY
- MAX 6 ENTRIES / WALLET

PHASE #01:
- zamknięta
- pozostaje w historii
- posiada własne statystyki i leaderboard

PHASE #02:
- aktywna
- posiada własny leaderboard

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
  "0xc34e5ef4f7f5607fbd3e060077cd6e2161ab54c7".toLowerCase();

const WETH =
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2".toLowerCase();

const POOL =
  "0xb4ffb01c89ffa24e6d01de95d3d780bc3e835390".toLowerCase();

/*
=========================================================
PHASES
=========================================================
*/

const PHASE_01 = {
  id: "01",
  name: "LAUNCH PHASE",
  status: "COMPLETED",

  start: "2026-08-15T00:00:00Z",

  // 25.08.2026 23:59:59.999
  end: "2026-08-26T00:00:00Z",

  displayEnd: "2026-08-26T00:00:00Z",
};

const PHASE_02 = {
  id: "02",
  name: "MONTHLY CHALLENGE",
  status: "ACTIVE",

  // 26.08.2026 00:01
  start: "2026-08-26T00:01:00Z",

  // 25.09.2026 23:59:59.999
  end: "2026-09-26T00:00:00Z",

  displayEnd: "2026-09-26T00:00:00Z",
};

const PHASES = [
  PHASE_01,
  PHASE_02,
];

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
CACHE
=========================================================
*/

let challengeCache = null;
let challengeCacheTime = 0;

const CHALLENGE_CACHE_TIME =
  30 * 1000;

/*
=========================================================
PHASE HISTORY CACHE
=========================================================
*/

let phase01Cache = null;
let phase01CacheTime = 0;

const PHASE01_CACHE_TIME =
  5 * 60 * 1000;

/*
=========================================================
ETHERSCAN SUCCESS CACHE
=========================================================
*/

let plpeTransfersCache = null;
let plpeTransfersCacheTime = 0;

const PLPE_TRANSFERS_CACHE_TIME =
  60 * 1000;

/*
=========================================================
GECKO CACHE
=========================================================
*/

let geckoTradesCache = null;
let geckoTradesCacheTime = 0;

const GECKO_TRADES_CACHE_TIME =
  60 * 1000;

/*
=========================================================
HISTORICAL WETH CACHE
=========================================================
*/

const historicalWethCache =
  new Map();

/*
=========================================================
CURRENT WETH PRICE CACHE
=========================================================
*/

let wethPriceCache = 0;
let wethPriceCacheTime = 0;

const WETH_PRICE_CACHE_TIME =
  60 * 1000;

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

function hexToBigInt(hex) {
  if (!hex) {
    return 0n;
  }

  try {
    return BigInt(hex);
  } catch {
    return 0n;
  }
}

function tokenAmount(value, decimals = 18) {
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
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

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
  const time =
    Number(timestamp);

  const start =
    phaseStartTimestamp(phase);

  const end =
    phaseEndTimestamp(phase);

  return (
    time >= start &&
    time < end
  );
}

function getPhaseById(id) {
  return PHASES.find(
    (phase) => phase.id === String(id)
  );
}

/*
=========================================================
ACTIVE PHASE
=========================================================
*/

function getActivePhase() {
  const now =
    Date.now();

  for (
    const phase of PHASES
  ) {
    const start =
      new Date(
        phase.start
      ).getTime();

    const end =
      new Date(
        phase.end
      ).getTime();

    if (
      now >= start &&
      now < end
    ) {
      return phase;
    }
  }

  /*
  Po zakończeniu Phase #01
  aktywną fazą ma być Phase #02.
  */

  if (
    now >=
    new Date(
      PHASE_02.start
    ).getTime()
  ) {
    return PHASE_02;
  }

  return PHASE_01;
}

/*
=========================================================
ETHERSCAN REQUEST WITH RETRY
=========================================================
*/

async function etherscanRequest(params) {
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
              apikey: ETHERSCAN_API_KEY,
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
          } ${data.result}`
        );
      }

      return data;

    } catch (err) {
      lastError = err;

      console.warn(
        `[CHALLENGE] Etherscan attempt ${attempt}/3 failed:`,
        err.message
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
GET ALL PLPE TRANSFERS
=========================================================
*/

async function getPLPETransfers() {
  if (!ETHERSCAN_API_KEY) {
    throw new Error(
      "ETHERSCAN_API_KEY is missing"
    );
  }

  const now =
    Date.now();

  if (
    Array.isArray(
      plpeTransfersCache
    ) &&
    now -
      plpeTransfersCacheTime <
      PLPE_TRANSFERS_CACHE_TIME
  ) {
    return plpeTransfersCache;
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
        ) *
          1000 >=
          new Date(
            PHASE_02.end
          ).getTime()
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

    plpeTransfersCache =
      allTransfers;

    plpeTransfersCacheTime =
      Date.now();

    console.log(
      "[CHALLENGE] PLPE transfers loaded:",
      allTransfers.length
    );

    return allTransfers;

  } catch (err) {
    console.error(
      "[CHALLENGE] Etherscan failed:",
      err.message
    );

    if (
      Array.isArray(
        plpeTransfersCache
      ) &&
      plpeTransfersCache.length > 0
    ) {
      console.warn(
        "[CHALLENGE] Using last successful PLPE transfer cache:",
        plpeTransfersCache.length
      );

      return plpeTransfersCache;
    }

    throw new Error(
      `Unable to load PLPE transfers: ${err.message}`
    );
  }
}

/*
=========================================================
INTERNAL TRANSACTIONS
=========================================================
*/

async function getInternalTransactions(hash) {
  if (!ETHERSCAN_API_KEY) {
    return [];
  }

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

  } catch (err) {
    console.warn(
      "[CHALLENGE] Internal TX error:",
      hash,
      err.message
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
      response.data.error.message ||
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
  } catch (err) {
    console.error(
      "[CHALLENGE] Receipt error:",
      hash,
      err.message
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
  } catch (err) {
    console.error(
      "[CHALLENGE] Transaction error:",
      hash,
      err.message
    );

    return null;
  }
}

/*
=========================================================
PARSE TRANSFER LOG
=========================================================
*/

function parseTransferLog(log) {
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
    !topics[0] ||
    topics[0].toLowerCase() !==
      TRANSFER_TOPIC
  ) {
    return null;
  }

  const token =
    normalizeAddress(
      log.address
    );

  const from =
    topicAddress(
      topics[1]
    );

  const to =
    topicAddress(
      topics[2]
    );

  const value =
    hexToBigInt(
      log.data
    );

  return {
    token,
    from,
    to,
    value,
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

  let wethAmount = 0;

  for (
    const weth of transfers.weth
  ) {
    if (
      weth.from === participant
    ) {
      wethAmount +=
        tokenAmount(
          weth.value,
          18
        );
    }
  }

  let nativeEthAmount = 0;

  if (
    wethAmount <= 0 &&
    transaction
  ) {
    const txFrom =
      normalizeAddress(
        transaction.from
      );

    if (
      txFrom === participant
    ) {
      nativeEthAmount =
        tokenAmount(
          transaction.value,
          18
        );
    }
  }

  const totalWeth =
    wethAmount > 0
      ? wethAmount
      : nativeEthAmount;

  if (
    totalWeth <= 0
  ) {
    return null;
  }

  const plpeAmount =
    buyTransfers.reduce(
      (sum, transfer) =>
        sum +
        tokenAmount(
          transfer.value,
          18
        ),
      0
    );

  return {
    participant,
    plpeAmount,
    wethAmount:
      totalWeth,
    plpeDirection:
      "BUY",
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

  let wethAmount = 0;

  for (
    const weth of transfers.weth
  ) {
    if (
      weth.to === participant
    ) {
      wethAmount +=
        tokenAmount(
          weth.value,
          18
        );
    }
  }

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
      const to =
        normalizeAddress(
          internal.to
        );

      if (
        to !== participant
      ) {
        continue;
      }

      const isError =
        String(
          internal.isError ?? "0"
        ) === "1";

      if (isError) {
        continue;
      }

      const value =
        tokenAmount(
          internal.value,
          18
        );

      if (
        value > 0
      ) {
        nativeEthAmount +=
          value;
      }
    }
  }

  const totalOutput =
    wethAmount > 0
      ? wethAmount
      : nativeEthAmount;

  if (
    totalOutput <= 0
  ) {
    return null;
  }

  const plpeAmount =
    sellTransfers.reduce(
      (sum, transfer) =>
        sum +
        tokenAmount(
          transfer.value,
          18
        ),
      0
    );

  return {
    participant,
    plpeAmount,
    wethAmount:
      totalOutput,
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
GECKOTERMINAL TRADES
=========================================================

Ładujemy kilka stron, żeby historyczny Phase #01
nie zależał wyłącznie od "recent trades".
=========================================================
*/

async function getGeckoTrades() {
  const now =
    Date.now();

  if (
    geckoTradesCache &&
    now -
      geckoTradesCacheTime <
      GECKO_TRADES_CACHE_TIME
  ) {
    return geckoTradesCache;
  }

  try {
    const map =
      new Map();

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

        if (!hash) {
          continue;
        }

        const volumeUsd =
          Number(
            attributes.volume_in_usd
          );

        if (
          !Number.isFinite(
            volumeUsd
          ) ||
          volumeUsd <= 0
        ) {
          continue;
        }

        const timestamp =
          attributes.block_timestamp
            ? Math.floor(
                new Date(
                  attributes.block_timestamp
                ).getTime() /
                  1000
              )
            : 0;

        map.set(
          hash,
          {
            hash,
            volumeUsd,

            kind:
              String(
                attributes.kind || ""
              ).toLowerCase(),

            timestamp,

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

    if (
      map.size > 0
    ) {
      geckoTradesCache =
        map;

      geckoTradesCacheTime =
        now;
    }

    console.log(
      "[CHALLENGE] GeckoTerminal trades:",
      map.size
    );

    return (
      map.size > 0
        ? map
        : geckoTradesCache ||
          new Map()
    );

  } catch (err) {
    console.warn(
      "[CHALLENGE] GeckoTerminal trades unavailable:",
      err.message
    );

    return (
      geckoTradesCache ||
      new Map()
    );
  }
}

/*
=========================================================
HISTORICAL WETH OHLCV
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
      5 * 60 * 1000
  ) {
    return cached.data;
  }

  try {
    const endTimestamp =
      phaseEndTimestamp(
        phase
      );

    const response =
      await axios.get(
        `${GECKO_BASE_URL}/networks/eth/pools/${POOL}/ohlcv/hour`,
        {
          params: {
            aggregate: 1,

            before_timestamp:
              endTimestamp,

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
        cached?.data ||
        []
      );
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
            Number.isFinite(
              close
            ) &&
            close > 0
              ? close
              : Number.isFinite(
                  open
                ) &&
                open > 0
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
        phase.id,
        {
          data: candles,
          time: now,
        }
      );
    }

    console.log(
      `[CHALLENGE] Phase #${phase.id} historical WETH candles:`,
      candles.length
    );

    return (
      candles.length > 0
        ? candles
        : cached?.data ||
          []
    );

  } catch (err) {
    console.warn(
      `[CHALLENGE] Phase #${phase.id} historical WETH unavailable:`,
      err.message
    );

    return (
      cached?.data ||
      []
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
      best =
        candle;

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
CURRENT WETH PRICE FALLBACK
=========================================================
*/

async function getWethPrice() {
  const now =
    Date.now();

  if (
    wethPriceCache > 0 &&
    now -
      wethPriceCacheTime <
      WETH_PRICE_CACHE_TIME
  ) {
    return wethPriceCache;
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

    if (
      Number.isFinite(
        quotePrice
      ) &&
      quotePrice > 0
    ) {
      wethPriceCache =
        quotePrice;

      wethPriceCacheTime =
        now;

      return quotePrice;
    }

    if (
      Number.isFinite(
        basePrice
      ) &&
      basePrice > 0
    ) {
      wethPriceCache =
        basePrice;

      wethPriceCacheTime =
        now;

      return basePrice;
    }

  } catch (err) {
    console.warn(
      "[CHALLENGE] Gecko WETH price unavailable:",
      err.message
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

    if (pair) {
      const priceUsd =
        Number(
          pair.priceUsd
        );

      const priceNative =
        Number(
          pair.priceNative
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
        const wethPrice =
          priceUsd /
          priceNative;

        if (
          Number.isFinite(
            wethPrice
          ) &&
          wethPrice > 0
        ) {
          wethPriceCache =
            wethPrice;

          wethPriceCacheTime =
            now;

          return wethPrice;
        }
      }
    }

  } catch (err) {
    console.warn(
      "[CHALLENGE] DexScreener WETH price unavailable:",
      err.message
    );
  }

  return (
    wethPriceCache > 0
      ? wethPriceCache
      : 0
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
  #1 EXACT GECKO TRADE
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
  #2 HISTORICAL WETH/USD
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
  #3 CURRENT FALLBACK
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
      usd: fallback,
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
BUILD TRADES FOR PHASE
=========================================================
*/

async function buildTrades(
  plpeTransfers,
  phase
) {
  const trades = [];

  const byHash =
    new Map();

  /*
  GROUP BY TX HASH
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

  /*
  MARKET DATA
  */

  const geckoTrades =
    await getGeckoTrades();

  const historicalCandles =
    await getHistoricalWethCandles(
      phase
    );

  const fallbackWethPrice =
    await getWethPrice();

  console.log(
    `[CHALLENGE] Phase #${phase.id} fallback WETH price:`,
    fallbackWethPrice
  );

  /*
  PROCESS TRANSACTIONS
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
        receipt.status.toLowerCase() !==
          "0x1"
      ) {
        continue;
      }

      const transaction =
        await getTransaction(
          hash
        );

      /*
      BUY
      */

      const buy =
        findBuy(
          receipt,
          transaction
        );

      if (buy) {
        const trade = {
          hash,

          timestamp:
            Number(
              txTransfers[0]
                .timeStamp
            ),

          participant:
            buy.participant,

          plpeAmount:
            buy.plpeAmount,

          plpeDirection:
            "BUY",

          wethAmount:
            buy.wethAmount,

          verified:
            true,
        };

        const geckoTrade =
          geckoTrades.get(
            hash
          );

        const usdValue =
          getTradeUsdValue(
            trade,
            geckoTrade,
            historicalCandles,
            fallbackWethPrice
          );

        trade.volumeUsd =
          usdValue.usd;

        trade.volumeSource =
         usdValue.source;