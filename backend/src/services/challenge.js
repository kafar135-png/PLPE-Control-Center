const axios = require("axios");
require("dotenv").config();

/*
=========================================================
PLPE MONTHLY TRADING CHALLENGE
=========================================================

VOLUME:
- BUY + SELL

TRADES:
- każdy zweryfikowany BUY + SELL

BUYS:
- liczba zweryfikowanych BUY

SELLS:
- liczba zweryfikowanych SELL

ENTRIES:
- WYŁĄCZNIE BUY
- każdy POJEDYNCZY BUY >= $2 = 1 ENTRY
- BUY < $2 = 0 ENTRY
- BRAK LIMITU ENTRIES

PRZYKŁAD:
BUY $2   = 1 ENTRY
BUY $10  = 1 ENTRY
BUY $100 = 1 ENTRY

WAŻNE:
- $100 BUY NIE daje 50 entries
- każdy pojedynczy zakup daje maksymalnie 1 entry

PHASE #01
15.08.2026 -> 26.08.2026
=========================================================
*/

/*
=========================================================
CONFIG
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
CHALLENGE SETTINGS
=========================================================
*/

const PHASE = {
  id: "01",
  name: "LAUNCH PHASE",
  start: "2026-08-15T00:00:00Z",
  end: "2026-08-26T00:00:00Z",
};

const MINIMUM_BUY_FOR_ENTRY = 2;
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
CHALLENGE RESULT CACHE
=========================================================
*/

let cache = null;
let cacheTime = 0;

const CACHE_TIME = 30 * 1000;

/*
=========================================================
PLPE TRANSFERS CACHE
=========================================================
*/

let plpeTransfersCache = null;
let plpeTransfersCacheTime = 0;

const PLPE_TRANSFERS_CACHE_TIME = 60 * 1000;

/*
=========================================================
GECKO CACHE
=========================================================
*/

let geckoTradesCache = null;
let geckoTradesCacheTime = 0;

const GECKO_TRADES_CACHE_TIME = 60 * 1000;

/*
=========================================================
HISTORICAL WETH CACHE
=========================================================
*/

let historicalWethCandlesCache = null;
let historicalWethCandlesCacheTime = 0;

const HISTORICAL_WETH_CACHE_TIME = 5 * 60 * 1000;

/*
=========================================================
WETH PRICE FALLBACK
=========================================================
*/

let wethPriceCache = 0;
let wethPriceCacheTime = 0;

const WETH_PRICE_CACHE_TIME = 60 * 1000;

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

/*
=========================================================
PHASE
=========================================================
*/

function isInPhase(timestamp) {
  const time =
    Number(timestamp) * 1000;

  const start =
    new Date(PHASE.start).getTime();

  const end =
    new Date(PHASE.end).getTime();

  return (
    time >= start &&
    time < end
  );
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
      if (!ETHERSCAN_API_KEY) {
        throw new Error(
          "ETHERSCAN_API_KEY is missing"
        );
      }

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

      if (attempt < 3) {
        await sleep(1000 * attempt);
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
ETHERSCAN - PLPE TRANSFERS
=========================================================
*/

async function getPLPETransfers() {
  if (!ETHERSCAN_API_KEY) {
    throw new Error(
      "ETHERSCAN_API_KEY is missing"
    );
  }

  const allTransfers = [];

  try {
    for (
      let page = 1;
      page <= 10;
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
        !Array.isArray(data.result)
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
        Number(last.timeStamp) * 1000 >=
          new Date(
            PHASE.end
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
      "[CHALLENGE] Etherscan PLPE transfers loaded:",
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
        "[CHALLENGE] Using last successful PLPE transfers cache:",
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
ETHERSCAN - INTERNAL TRANSACTIONS
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
      !Array.isArray(data.result)
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
TRANSACTION RECEIPT
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
GET TRANSFERS FROM RECEIPT
=========================================================
*/

function getReceiptTransfers(receipt) {
  const result = {
    plpe: [],
    weth: [],
  };

  if (
    !receipt ||
    !Array.isArray(receipt.logs)
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
      (transfer) => {
        return (
          transfer.from === POOL &&
          transfer.to !== POOL
        );
      }
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
      (sum, transfer) => {
        return (
          sum +
          tokenAmount(
            transfer.value,
            18
          )
        );
      },
      0
    );

  return {
    participant,
    plpeAmount,
    wethAmount: totalWeth,
    plpeDirection: "BUY",
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
      (transfer) => {
        return (
          transfer.to === POOL &&
          transfer.from !== POOL
        );
      }
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
      (sum, transfer) => {
        return (
          sum +
          tokenAmount(
            transfer.value,
            18
          )
        );
      },
      0
    );

  return {
    participant,
    plpeAmount,
    wethAmount: totalOutput,
    plpeDirection: "SELL",
    outputType:
      wethAmount > 0
        ? "WETH"
        : "NATIVE_ETH",
  };
}

/*
=========================================================
GECKOTERMINAL - RECENT TRADES
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
    const response =
      await axios.get(
        `${GECKO_BASE_URL}/networks/eth/pools/${POOL}/trades`,
        {
          timeout: 15000,
          headers: {
            Accept:
              "application/json;version=20230203",
          },
        }
      );

    const rows =
      response.data?.data;

    const map =
      new Map();

    if (
      Array.isArray(rows)
    ) {
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
                    ).getTime() / 1000
                  )
                : 0,

            txFrom:
              normalizeAddress(
                attributes.tx_from_address
              ),
          }
        );
      }
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

async function getHistoricalWethCandles() {
  const now =
    Date.now();

  if (
    historicalWethCandlesCache &&
    now -
      historicalWethCandlesCacheTime <
      HISTORICAL_WETH_CACHE_TIME
  ) {
    return historicalWethCandlesCache;
  }

  try {
    const endTimestamp =
      Math.floor(
        new Date(
          PHASE.end
        ).getTime() / 1000
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
        historicalWethCandlesCache ||
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
            Number.isFinite(close) &&
            close > 0
              ? close
              : Number.isFinite(open) &&
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
      historicalWethCandlesCache =
        candles;

      historicalWethCandlesCacheTime =
        now;
    }

    console.log(
      "[CHALLENGE] Historical WETH candles:",
      candles.length
    );

    return (
      candles.length > 0
        ? candles
        : historicalWethCandlesCache ||
          []
    );
  } catch (err) {
    console.warn(
      "[CHALLENGE] Historical WETH OHLCV unavailable:",
      err.message
    );

    return (
      historicalWethCandlesCache ||
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
  1. GeckoTerminal
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
      response.data?.data?.attributes;

    const quotePrice =
      Number(
        attributes?.quote_token_price_usd
      );

    const basePrice =
      Number(
        attributes?.base_token_price_usd
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
      "[CHALLENGE] Gecko current WETH price unavailable:",
      err.message
    );
  }

  /*
  2. DexScreener
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
        Number.isFinite(priceUsd) &&
        priceUsd > 0 &&
        Number.isFinite(priceNative) &&
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

  /*
  3. Last known price
  */

  return wethPriceCache > 0
    ? wethPriceCache
    : 0;
}

/*
=========================================================
GET TRADE USD VALUE
=========================================================
*/

function getTradeUsdValue(
  trade,
  geckoTrade,
  historicalCandles,
  fallbackWethPrice
) {
  /*
  PRIORITY #1
  Exact GeckoTerminal trade.
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
  PRIORITY #2
  Historical WETH/USD.
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
  PRIORITY #3
  Current fallback.
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

    source:
      "UNKNOWN",
  };
}

/*
=========================================================
BUILD TRADES
=========================================================
*/

async function buildTrades(
  plpeTransfers
) {
  const trades = [];

  /*
  GROUP BY TX HASH
  */

  const byHash =
    new Map();

  for (
    const transfer of
      plpeTransfers
  ) {
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
  LOAD MARKET DATA
  */

  const geckoTrades =
    await getGeckoTrades();

  const historicalCandles =
    await getHistoricalWethCandles();

  const fallbackWethPrice =
    await getWethPrice();

  console.log(
    "[CHALLENGE] Fallback WETH price:",
    fallbackWethPrice
  );

  /*
  PROCESS TX
  */

  for (
    const [
      hash,
      txTransfers,
    ] of byHash
  ) {
    try {
      /*
      PHASE FILTER
      */

      if (
        !isInPhase(
          txTransfers[0]
            .timeStamp
        )
      ) {
        continue;
      }

      /*
      RECEIPT
      */

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

      /*
      TRANSACTION
      */

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

        if (
          trade.volumeUsd <= 0
        ) {
          console.log(
            "[CHALLENGE] BUY ignored - no USD value:",
            hash
          );

          continue;
        }

        trades.push(
          trade
        );

        console.log(
          "[CHALLENGE] BUY:",
          hash,
          buy.participant,
          "USD:",
          "$" +
            trade.volumeUsd.toFixed(
              4
            ),
          "SOURCE:",
          trade.volumeSource
        );

        continue;
      }

      /*
      SELL
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

          timestamp:
            Number(
              txTransfers[0]
                .timeStamp
            ),

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

        if (
          trade.volumeUsd <= 0
        ) {
          console.log(
            "[CHALLENGE] SELL ignored - no USD value:",
            hash
          );

          continue;
        }

        trades.push(
          trade
        );

        console.log(
          "[CHALLENGE] SELL:",
          hash,
          sell.participant,
          "USD:",
          "$" +
            trade.volumeUsd.toFixed(
              4
            ),
          "SOURCE:",
          trade.volumeSource
        );

        continue;
      }

      console.log(
        "[CHALLENGE] Ignored TX:",
        hash
      );
    } catch (err) {
      console.error(
        "[CHALLENGE] TX processing error:",
        hash,
        err.message
      );
    }
  }

  return trades;
}

/*
=========================================================
LEADERBOARD
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

          entries: 0,

          qualifyingBuys: 0,

          entryDetails: [],
        }
      );
    }

    const item =
      wallets.get(
        wallet
      );

    /*
    =====================================================
    BUY
    =====================================================
    */

    if (
      trade.plpeDirection ===
      "BUY"
    ) {
      /*
      BUY COUNT
      */

      item.buys += 1;

      /*
      TRADE COUNT
      */

      item.trades += 1;

      /*
      VOLUME
      */

      item.volume +=
        tradeVolume;

      item.buyVolume +=
        tradeVolume;

      /*
      ENTRY

      KAŻDY POJEDYNCZY BUY >= $2
      = DOKŁADNIE 1 ENTRY

      BRAK LIMITU.
      */

      const qualifiesForEntry =
        tradeVolume >=
        MINIMUM_BUY_FOR_ENTRY;

      if (
        qualifiesForEntry
      ) {
        item.qualifyingBuys +=
          1;

        item.entries += 1;

        item.entryDetails.push({
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
            1,

          entriesTotal:
            item.entries,
        });
      }

      continue;
    }

    /*
    =====================================================
    SELL
    =====================================================
    */

    if (
      trade.plpeDirection ===
      "SELL"
    ) {
      /*
      SELL COUNT
      */

      item.sells += 1;

      /*
      TRADE COUNT
      */

      item.trades += 1;

      /*
      VOLUME
      */

      item.volume +=
        tradeVolume;

      item.sellVolume +=
        tradeVolume;

      /*
      SELL = 0 ENTRY
      */
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
        (item) => {
          const qualified =
            item.volume >=
            MINIMUM_VOLUME;

          return {
            rank: 0,

            wallet:
              item.wallet,

            /*
            TOTAL VOLUME
            BUY + SELL
            */

            volume:
              Number(
                item.volume.toFixed(
                  4
                )
              ),

            /*
            BUY VOLUME
            */

            buyVolume:
              Number(
                item.buyVolume.toFixed(
                  4
                )
              ),

            /*
            SELL VOLUME
            */

            sellVolume:
              Number(
                item.sellVolume.toFixed(
                  4
                )
              ),

            /*
            COUNTS
            */

            trades:
              item.trades,

            buys:
              item.buys,

            sells:
              item.sells,

            /*
            ENTRIES

            Unlimited.
            Every BUY >= $2 = 1.
            */

            qualifyingBuys:
              item.qualifyingBuys,

            entries:
              item.entries,

            entryDetails:
              item.entryDetails,

            qualified,
          };
        }
      )
      .filter(
        (item) =>
          item.qualified
      )
      .sort(
        (a, b) =>
          b.volume -
          a.volume
      );

  /*
  =======================================================
  RANKING
  =======================================================
  */

  leaderboard.forEach(
    (item, index) => {
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
  console.log("");
  console.log(
    "======================================"
  );
  console.log(
    "PLPE MONTHLY TRADING CHALLENGE"
  );
  console.log(
    `Phase #${PHASE.id}: ${PHASE.start.slice(
      0,
      10
    )} -> ${PHASE.end.slice(
      0,
      10
    )}`
  );
  console.log(
    "======================================"
  );

  /*
  LOAD PLPE TRANSFERS
  */

  console.log(
    "[CHALLENGE] Loading PLPE transfers..."
  );

  const allPLPE =
    await getPLPETransfers();

  console.log(
    `[CHALLENGE] PLPE transfers: ${allPLPE.length}`
  );

  /*
  PHASE FILTER
  */

  const phasePLPE =
    allPLPE.filter(
      (tx) =>
        isInPhase(
          tx.timeStamp
        )
    );

  console.log(
    `[CHALLENGE] PLPE transfers in phase: ${phasePLPE.length}`
  );

  /*
  VERIFY TRADES
  */

  console.log(
    "[CHALLENGE] Verifying BUY + SELL transactions..."
  );

  const verifiedTrades =
    await buildTrades(
      phasePLPE
    );

  console.log(
    `[CHALLENGE] Verified trades: ${verifiedTrades.length}`
  );

  /*
  LEADERBOARD
  */

  const leaderboard =
    buildLeaderboard(
      verifiedTrades
    );

  console.log(
    `[CHALLENGE] Qualified wallets: ${leaderboard.length}`
  );

  /*
  STATS
  */

  const totalBuys =
    verifiedTrades.filter(
      (trade) =>
        trade.plpeDirection ===
        "BUY"
    ).length;

  const totalSells =
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
    status:
      "1",

    phase: {
      id:
        PHASE.id,

      name:
        PHASE.name,

      start:
        PHASE.start,

      end:
        PHASE.end,
    },

    rules: {
      minimumVolume:
        MINIMUM_VOLUME,

      minimumBuyForEntry:
        MINIMUM_BUY_FOR_ENTRY,

      pair:
        "PLPE/WETH",

      maximumEntries:
        null,

      qualification:
        "BUY + SELL VOLUME >= $2",

      entries:
        "Each individual BUY >= $2 gives exactly 1 ENTRY. There is no maximum number of ENTRIES. SELL gives 0 ENTRY.",
    },

    entries: {
      minimumBuy:
        MINIMUM_BUY_FOR_ENTRY,

      entriesPerBuy:
        1,

      maximumEntries:
        null,

      unlimited:
        true,

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

      verifiedBuys:
        totalBuys,

      verifiedSells:
        totalSells,

      totalEntries:
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
  const now =
    Date.now();

  /*
  NORMAL CACHE
  */

  if (
    cache &&
    now -
      cacheTime <
      CACHE_TIME
  ) {
    return cache;
  }

  try {
    const result =
      await calculateChallenge();

    /*
    CACHE TYLKO POPRAWNEGO WYNIKU
    */

    if (
      result &&
      result.status === "1" &&
      result.stats &&
      result.stats.verifiedTrades >= 0
    ) {
      cache =
        result;

      cacheTime =
        Date.now();
    }

    return result;
  } catch (err) {
    console.error(
      "======================================"
    );

    console.error(
      "[CHALLENGE ERROR]",
      err.message
    );

    console.error(
      "======================================"
    );

    /*
    JEŻELI MAMY OSTATNI POPRAWNY WYNIK,
    NIE ZWRACAMY ZERA.
    */

    if (cache) {
      console.warn(
        "[CHALLENGE] Returning last successful challenge cache."
      );

      return cache;
    }

    throw err;
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

      cached:
        false,

      generatedAt:
        Date.now(),
    };
  } catch (err) {
    /*
    Diagnostics też nie mogą zwrócić
    fałszywego pustego wyniku.
    */

    if (cache) {
      return {
        ...cache,

        cached:
          true,

        generatedAt:
          Date.now(),

        diagnosticError:
          err.message,
      };
    }

    throw err;
  }
}

/*
=========================================================
FORCE CACHE CLEAR
=========================================================
*/

function clearChallengeCache() {
  cache = null;
  cacheTime = 0;

  console.log(
    "[CHALLENGE] Challenge cache cleared."
  );
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
};