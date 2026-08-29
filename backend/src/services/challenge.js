const axios = require("axios");
require("dotenv").config();

/*
=========================================================
PLPE MONTHLY TRADING CHALLENGE
=========================================================

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
- MAX 6 ENTRIES / WALLET / PHASE

MINIMUM TOTAL VOLUME:
- $2

PHASE #01
15.08.2026 00:00:00 UTC
-
25.08.2026 23:59:59 UTC

PHASE #02
26.08.2026 00:00:00 UTC
-
25.09.2026 23:59:59 UTC

=========================================================
*/


/*
=========================================================
ENVIRONMENT
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

const COINBASE_BASE_URL =
  "https://api.exchange.coinbase.com";


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
PHASES
=========================================================
*/

/*
IMPORTANT:

end is EXCLUSIVE.

Phase #01:
2026-08-15 00:00:00
through
2026-08-25 23:59:59.999...

=> end = 2026-08-26 00:00:00

Phase #02:
2026-08-26 00:00:00
through
2026-09-25 23:59:59.999...

=> end = 2026-09-26 00:00:00
*/

const PHASE_01 = {
  id: "01",
  name: "LAUNCH PHASE",
  status: "COMPLETED",

  start:
    "2026-08-15T00:00:00Z",

  end:
    "2026-08-26T00:00:00Z",

  displayEnd:
    "2026-08-26T00:00:00Z",
};


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
TOKEN SETTINGS
=========================================================
*/

const PLPE_DECIMALS = 18;

const WETH_DECIMALS = 18;


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

const COINBASE_PRICE_CACHE_TIME =
  5 * 60 * 1000;

const WETH_PRICE_CACHE_TIME =
  60 * 1000;

const BLOCK_RANGE_CACHE_TIME =
  10 * 60 * 1000;


/*
=========================================================
CACHES
=========================================================
*/

const challengeCache =
  new Map();


const plpeTransfersCache =
  new Map();


const geckoTradesCache =
  new Map();


const historicalWethCache =
  new Map();


const coinbaseHistoricalCache =
  new Map();


const wethPriceCache = {
  value: 0,
  time: 0,
};


const blockRangeCache =
  new Map();


/*
=========================================================
HELPERS
=========================================================
*/

function normalizeAddress(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .toLowerCase();
}


function normalizeHash(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .toLowerCase();
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
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
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
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return 0;
  }

  try {
    const bigint =
      BigInt(value);

    return (
      Number(bigint) /
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


function round(value, decimals = 4) {
  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Number(
    value.toFixed(decimals)
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
  const now =
    Date.now();

  const active =
    PHASES.find(
      (phase) => {
        const start =
          new Date(
            phase.start
          ).getTime();

        const end =
          new Date(
            phase.end
          ).getTime();

        return (
          now >= start &&
          now < end
        );
      }
    );

  if (active) {
    return active;
  }

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
ETHERSCAN REQUEST
=========================================================
*/

async function etherscanRequest(
  params,
  options = {}
) {
  if (!ETHERSCAN_API_KEY) {
    throw new Error(
      "ETHERSCAN_API_KEY is missing"
    );
  }

  const allowEmpty =
    options.allowEmpty === true;

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

      /*
      Etherscan can return:
      status 0 + "No transactions found"
      */

      if (
        data.status === "0" &&
        typeof data.result ===
          "string"
      ) {
        const text =
          `${data.message || ""} ${data.result}`
            .trim();

        if (
          allowEmpty &&
          /no transactions found/i.test(
            text
          )
        ) {
          return data;
        }

        throw new Error(
          `Etherscan API: ${text}`
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
        jsonrpc:
          "2.0",

        id:
          Date.now(),

        method,

        params,
      },
      {
        timeout:
          15000,

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
GET LATEST BLOCK
=========================================================
*/

async function getLatestBlockNumber() {
  const result =
    await rpc(
      "eth_blockNumber"
    );

  return Number(
    BigInt(result)
  );
}


/*
=========================================================
GET BLOCK TIMESTAMP
=========================================================
*/

async function getBlockTimestamp(
  blockNumber
) {
  const hexBlock =
    "0x" +
    Number(
      blockNumber
    ).toString(16);

  const block =
    await rpc(
      "eth_getBlockByNumber",
      [
        hexBlock,
        false,
      ]
    );

  if (
    !block ||
    !block.timestamp
  ) {
    return 0;
  }

  return Number(
    BigInt(
      block.timestamp
    )
  );
}


/*
=========================================================
FIND FIRST BLOCK AT / AFTER TIMESTAMP
=========================================================
*/

async function findFirstBlockAtOrAfterTimestamp(
  targetTimestamp,
  latestBlock
) {
  const latestTimestamp =
    await getBlockTimestamp(
      latestBlock
    );

  /*
  Target is in the future.
  Return latest block.
  */
  if (
    targetTimestamp >
    latestTimestamp
  ) {
    return latestBlock;
  }

  let low = 0;

  let high =
    latestBlock;

  let answer =
    latestBlock;

  while (
    low <= high
  ) {
    const middle =
      Math.floor(
        (low + high) / 2
      );

    const timestamp =
      await getBlockTimestamp(
        middle
      );

    if (
      timestamp >=
      targetTimestamp
    ) {
      answer =
        middle;

      high =
        middle - 1;
    } else {
      low =
        middle + 1;
    }
  }

  return answer;
}


/*
=========================================================
PHASE BLOCK RANGE
=========================================================
*/

async function getPhaseBlockRange(
  phase
) {
  const cached =
    blockRangeCache.get(
      phase.id
    );

  const now =
    Date.now();

  if (
    cached &&
    now -
      cached.time <
      BLOCK_RANGE_CACHE_TIME
  ) {
    return cached.data;
  }

  const latestBlock =
    await getLatestBlockNumber();

  const startTimestamp =
    phaseStartTimestamp(
      phase
    );

  const endTimestamp =
    phaseEndTimestamp(
      phase
    );

  const startBlock =
    await findFirstBlockAtOrAfterTimestamp(
      startTimestamp,
      latestBlock
    );

  let endBlock;

  /*
  We want blocks whose timestamp
  is strictly before phase.end.

  Find first block >= end timestamp,
  then use previous block.
  */

  const firstEndBlock =
    await findFirstBlockAtOrAfterTimestamp(
      endTimestamp,
      latestBlock
    );

  endBlock =
    Math.max(
      startBlock,
      firstEndBlock - 1
    );

  /*
  If phase end is in the future,
  firstEndBlock is latestBlock.
  We should include latest block.
  */

  const latestTimestamp =
    await getBlockTimestamp(
      latestBlock
    );

  if (
    latestTimestamp <
    endTimestamp
  ) {
    endBlock =
      latestBlock;
  }

  const data = {
    startBlock,
    endBlock,
    latestBlock,
  };

  blockRangeCache.set(
    phase.id,
    {
      data,
      time: now,
    }
  );

  console.log(
    `[CHALLENGE] Phase #${phase.id} block range:`,
    data
  );

  return data;
}


/*
=========================================================
GET ALL PLPE TRANSFERS FOR PHASE
=========================================================
*/

async function getPLPETransfers(
  phase
) {
  const cached =
    plpeTransfersCache.get(
      phase.id
    );

  const now =
    Date.now();

  if (
    cached &&
    now -
      cached.time <
      PLPE_TRANSFERS_CACHE_TIME
  ) {
    return cached.data;
  }

  const {
    startBlock,
    endBlock,
  } =
    await getPhaseBlockRange(
      phase
    );

  const allTransfers =
    [];

  try {
    for (
      let page = 1;
      page <= 100;
      page++
    ) {
      const data =
        await etherscanRequest(
          {
            module:
              "account",

            action:
              "tokentx",

            contractaddress:
              PLPE,

            startblock:
              startBlock,

            endblock:
              endBlock,

            page,

            offset:
              1000,

            sort:
              "asc",
          },
          {
            allowEmpty:
              true,
          }
        );

      if (
        !Array.isArray(
          data.result
        )
      ) {
        break;
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

      console.log(
        `[CHALLENGE] Phase #${phase.id} PLPE page ${page}: ${data.result.length}`
      );

      if (
        data.result.length <
        1000
      ) {
        break;
      }

      await sleep(250);
    }

    /*
    Safety:
    remove duplicates.
    */

    const unique =
      new Map();

    for (
      const transfer of
        allTransfers
    ) {
      const key =
        [
          normalizeHash(
            transfer.hash
          ),

          transfer.transactionIndex ||
            "",

          transfer.logIndex ||
            "",

          transfer.from ||
            "",

          transfer.to ||
            "",

          transfer.value ||
            "",
        ].join(":");

      unique.set(
        key,
        transfer
      );
    }

    const result =
      Array.from(
        unique.values()
      )
        .filter(
          (tx) =>
            isInPhase(
              tx.timeStamp,
              phase
            )
        );

    plpeTransfersCache.set(
      phase.id,
      {
        data: result,
        time: now,
      }
    );

    console.log(
      `[CHALLENGE] Phase #${phase.id} PLPE transfers loaded:`,
      result.length
    );

    return result;

  } catch (error) {
    console.error(
      `[CHALLENGE] Phase #${phase.id} Etherscan PLPE failed:`,
      error.message
    );

    if (
      cached?.data
    ) {
      console.warn(
        `[CHALLENGE] Using last successful Phase #${phase.id} transfer cache`
      );

      return cached.data;
    }

    throw new Error(
      `Unable to load Phase #${phase.id} PLPE transfers: ${error.message}`
    );
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
      await etherscanRequest(
        {
          module:
            "account",

          action:
            "txlistinternal",

          txhash:
            hash,
        }
      );

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

async function getTransaction(
  hash
) {
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
GET PARTICIPANT
=========================================================
*/

function getParticipant(
  transaction,
  geckoTrade
) {
  /*
  Ethereum transaction sender is
  the safest primary participant.

  Gecko tx_from is secondary.
  */

  const txFrom =
    normalizeAddress(
      transaction?.from
    );

  if (txFrom) {
    return txFrom;
  }

  const geckoFrom =
    normalizeAddress(
      geckoTrade?.txFrom
    );

  if (geckoFrom) {
    return geckoFrom;
  }

  return "";
}


/*
=========================================================
FIND BUY
=========================================================
*/

function findBuy(
  receipt,
  transaction,
  geckoTrade
) {
  const transfers =
    getReceiptTransfers(
      receipt
    );

  /*
  BUY:

  PLPE moves FROM POOL
  to another address.

  We do NOT use the recipient
  as participant because a router
  can be the immediate recipient.

  Participant = transaction.from.
  */

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
    getParticipant(
      transaction,
      geckoTrade
    );

  if (!participant) {
    return null;
  }

  /*
  PLPE amount leaving pool.
  */

  const plpeAmount =
    buyTransfers.reduce(
      (
        sum,
        transfer
      ) =>
        sum +
        tokenAmount(
          transfer.value,
          PLPE_DECIMALS
        ),
      0
    );

  /*
  WETH PAYMENT:

  For a direct WETH pair,
  the swap should result in WETH
  moving INTO the pool.

  We therefore inspect WETH transfers
  involving the POOL.

  This is much safer than:

  "all WETH sent by participant"
  */

  let wethAmount = 0;

  for (
    const weth of
      transfers.weth
  ) {
    if (
      weth.to === POOL &&
      weth.from !== POOL
    ) {
      wethAmount +=
        tokenAmount(
          weth.value,
          WETH_DECIMALS
        );
    }
  }

  /*
  Native ETH BUY fallback.

  If ETH was sent directly in the
  transaction, transaction.value
  is the native ETH amount.

  This is especially useful when
  router unwrap/payment logic means
  there is no WETH transfer into the
  pool visible in this receipt.
  */

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
      txFrom ===
      participant
    ) {
      nativeEthAmount =
        tokenAmount(
          transaction.value,
          WETH_DECIMALS
        );
    }
  }

  const payment =
    wethAmount > 0
      ? wethAmount
      : nativeEthAmount;

  /*
  We allow the trade to exist even
  if payment is unknown.

  GeckoTerminal can still give us
  exact USD volume.

  If both are unavailable,
  the USD calculation will try
  historical prices.
  */

  return {
    participant,

    plpeAmount,

    wethAmount:
      payment,

    nativeEthAmount,

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
  transaction,
  geckoTrade
) {
  const transfers =
    getReceiptTransfers(
      receipt
    );

  /*
  SELL:

  PLPE moves INTO POOL.
  */

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
    getParticipant(
      transaction,
      geckoTrade
    );

  if (!participant) {
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
          transfer.value,
          PLPE_DECIMALS
        ),
      0
    );

  /*
  WETH OUTPUT:

  For SELL the pool sends WETH
  OUT of the pool.
  */

  let wethAmount = 0;

  for (
    const weth of
      transfers.weth
  ) {
    if (
      weth.from === POOL &&
      weth.to !== POOL
    ) {
      wethAmount +=
        tokenAmount(
          weth.value,
          WETH_DECIMALS
        );
    }
  }

  /*
  Native ETH fallback.

  If WETH was unwrapped,
  inspect internal ETH transfers
  going to the participant.
  */

  let nativeEthAmount = 0;

  if (
    wethAmount <= 0
  ) {
    const internalTransactions =
      arguments.length >= 4
        ? arguments[3]
        : [];

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
            internal.value,
            WETH_DECIMALS
          );

        if (
          value > 0
        ) {
          nativeEthAmount +=
            value;
        }
      }
    }
  }

  const output =
    wethAmount > 0
      ? wethAmount
      : nativeEthAmount;

  return {
    participant,

    plpeAmount,

    wethAmount:
      output,

    nativeEthAmount,

    plpeDirection:
      "SELL",

    outputType:
      wethAmount > 0
        ? "WETH"
        : nativeEthAmount > 0
          ? "NATIVE_ETH"
          : "UNKNOWN",
  };
}


/*
=========================================================
GECKOTERMINAL TRADES
=========================================================
*/

/*
GeckoTerminal trades endpoint is primarily
recent trade data.

We still use it when an exact TX hash is available.

It is NOT the source of truth for BUY/SELL.
*/

async function getGeckoTrades(
  phase
) {
  const cached =
    geckoTradesCache.get(
      phase.id
    );

  const now =
    Date.now();

  if (
    cached &&
    now -
      cached.time <
      GECKO_TRADES_CACHE_TIME
  ) {
    return cached.data;
  }

  try {
    const map =
      new Map();

    /*
    Current Gecko API exposes recent
    trades. We deliberately keep the
    number of pages controlled.
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

            timeout:
              15000,

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

      let reachedOlderThanPhase =
        false;

      for (
        const row of
          rows
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

        const timestamp =
          attributes.block_timestamp
            ? Math.floor(
                new Date(
                  attributes.block_timestamp
                ).getTime() /
                  1000
              )
            : 0;

        if (
          timestamp > 0 &&
          timestamp <
            phaseStartTimestamp(
              phase
            )
        ) {
          reachedOlderThanPhase =
            true;
        }

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

            timestamp,

            txFrom:
              normalizeAddress(
                attributes.tx_from_address
              ),
          }
        );
      }

      /*
      If Gecko is returning older trades
      than our phase, there is no reason
      to continue.
      */

      if (
        reachedOlderThanPhase
      ) {
        break;
      }

      if (
        rows.length < 100
      ) {
        break;
      }

      /*
      Public Gecko API rate limit protection.
      */

      await sleep(2500);
    }

    geckoTradesCache.set(
      phase.id,
      {
        data: map,
        time: now,
      }
    );

    console.log(
      `[CHALLENGE] Gecko trades cached for Phase #${phase.id}:`,
      map.size
    );

    return map;

  } catch (error) {
    console.warn(
      `[CHALLENGE] GeckoTerminal trades unavailable for Phase #${phase.id}:`,
      error.message
    );

    return (
      cached?.data ||
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
      HISTORICAL_WETH_CACHE_TIME
  ) {
    return cached.data;
  }

  try {
    /*
    Gecko OHLCV endpoint.
    */

    const response =
      await axios.get(
        `${GECKO_BASE_URL}/networks/eth/pools/${POOL}/ohlcv/hour`,
        {
          params: {
            aggregate:
              1,

            before_timestamp:
              phaseEndTimestamp(
                phase
              ),

            limit:
              1000,

            currency:
              "usd",

            token:
              WETH,
          },

          timeout:
            15000,

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
        .map(
          (row) => {
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
        .filter(
          (candle) =>
            candle.timestamp >=
              phaseStartTimestamp(
                phase
              ) &&
            candle.timestamp <
              phaseEndTimestamp(
                phase
              )
        )
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

    return candles;

  } catch (error) {
    console.warn(
      `[CHALLENGE] Phase #${phase.id} Gecko historical WETH unavailable:`,
      error.message
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
COINBASE HISTORICAL ETH/USD
=========================================================
*/

/*
Fallback only.

Gecko pool OHLCV remains primary.

Coinbase public candles are used if
Gecko historical WETH/USD is unavailable.
*/

async function getCoinbaseHistoricalCandles(
  phase
) {
  const cached =
    coinbaseHistoricalCache.get(
      phase.id
    );

  const now =
    Date.now();

  if (
    cached &&
    now -
      cached.time <
      COINBASE_PRICE_CACHE_TIME
  ) {
    return cached.data;
  }

  try {
    const start =
      phaseStartTimestamp(
        phase
      );

    const end =
      Math.min(
        phaseEndTimestamp(
          phase
        ),
        Math.floor(
          Date.now() / 1000
        )
      );

    if (
      end <= start
    ) {
      return [];
    }

    const maxSecondsPerRequest =
      300 * 3600;

    const candles = [];

    let cursor =
      start;

    while (
      cursor < end
    ) {
      const chunkEnd =
        Math.min(
          cursor +
            maxSecondsPerRequest,
          end
        );

      const response =
        await axios.get(
          `${COINBASE_BASE_URL}/products/ETH-USD/candles`,
          {
            params: {
              start:
                new Date(
                  cursor * 1000
                ).toISOString(),

              end:
                new Date(
                  chunkEnd * 1000
                ).toISOString(),

              granularity:
                3600,
            },

            timeout:
              15000,
          }
        );

      const rows =
        response.data;

      if (
        Array.isArray(rows)
      ) {
        for (
          const row of
            rows
        ) {
          if (
            !Array.isArray(row) ||
            row.length < 5
          ) {
            continue;
          }

          /*
          Coinbase schema:

          [timestamp, low, high, open, close]
          */

          const timestamp =
            Number(row[0]);

          const low =
            Number(row[1]);

          const high =
            Number(row[2]);

          const open =
            Number(row[3]);

          const close =
            Number(row[4]);

          const price =
            close > 0
              ? close
              : open > 0
                ? open
                : 0;

          if (
            timestamp >= start &&
            timestamp < end &&
            price > 0
          ) {
            candles.push({
              timestamp,

              open,

              high,

              low,

              close,

              price,
            });
          }
        }
      }

      cursor =
        chunkEnd;

      await sleep(250);
    }

    const unique =
      new Map();

    for (
      const candle of
        candles
    ) {
      unique.set(
        candle.timestamp,
        candle
      );
    }

    const result =
      Array.from(
        unique.values()
      ).sort(
        (a, b) =>
          a.timestamp -
          b.timestamp
      );

    coinbaseHistoricalCache.set(
      phase.id,
      {
        data:
          result,

        time:
          now,
      }
    );

    console.log(
      `[CHALLENGE] Coinbase historical ETH/USD candles Phase #${phase.id}:`,
      result.length
    );

    return result;

  } catch (error) {
    console.warn(
      `[CHALLENGE] Coinbase historical ETH/USD unavailable:`,
      error.message
    );

    return (
      cached?.data ||
      []
    );
  }
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
    return wethPriceCache.value;
  }

  /*
  1. GeckoTerminal
  */

  try {
    const response =
      await axios.get(
        `${GECKO_BASE_URL}/networks/eth/pools/${POOL}`,
        {
          timeout:
            10000,

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
    For PLPE/WETH the WETH side
    is normally quote token.

    We only use a price if it looks
    like an ETH price, not PLPE price.
    */

    let price = 0;

    if (
      Number.isFinite(
        quotePrice
      ) &&
      quotePrice > 100
    ) {
      price =
        quotePrice;
    }

    if (
      price <= 0 &&
      Number.isFinite(
        basePrice
      ) &&
      basePrice > 100
    ) {
      price =
        basePrice;
    }

    if (
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
  2. Coinbase current ETH/USD
  */

  try {
    const response =
      await axios.get(
        `${COINBASE_BASE_URL}/products/ETH-USD/ticker`,
        {
          timeout:
            10000,
        }
      );

    const price =
      Number(
        response.data?.price
      );

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
      "[CHALLENGE] Coinbase WETH price unavailable:",
      error.message
    );
  }

  /*
  3. Last known price
  */

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
  coinbaseCandles,
  fallbackWethPrice
) {
  /*
  =======================================================
  #1 EXACT GECKOTERMINAL TRADE
  =======================================================
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
  =======================================================
  #2 GECKOTERMINAL HISTORICAL WETH/USD
  =======================================================
  */

  if (
    trade.wethAmount > 0
  ) {
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
  }

  /*
  =======================================================
  #3 COINBASE HISTORICAL ETH/USD
  =======================================================
  */

  if (
    trade.wethAmount > 0
  ) {
    const coinbasePrice =
      findHistoricalWethPrice(
        trade.timestamp,
        coinbaseCandles
      );

    if (
      coinbasePrice > 0
    ) {
      const usd =
        trade.wethAmount *
        coinbasePrice;

      if (
        Number.isFinite(
          usd
        ) &&
        usd > 0
      ) {
        return {
          usd,

          source:
            "COINBASE_HISTORICAL_ETH_USD",
        };
      }
    }
  }

  /*
  =======================================================
  #4 CURRENT PRICE FALLBACK
  =======================================================
  */

  if (
    trade.wethAmount > 0 &&
    fallbackWethPrice > 0
  ) {
    const usd =
      trade.wethAmount *
      fallbackWethPrice;

    if (
      Number.isFinite(
        usd
      ) &&
      usd > 0
    ) {
      return {
        usd,

        source:
          "CURRENT_WETH_FALLBACK",
      };
    }
  }

  /*
  =======================================================
  UNKNOWN
  =======================================================
  */

  return {
    usd:
      0,

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

  const trades =
    [];

  /*
  =======================================================
  GROUP PLPE TRANSFERS BY TX HASH
  =======================================================
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
    `[CHALLENGE] Phase #${phase.id} unique TX hashes:`,
    byHash.size
  );

  /*
  =======================================================
  MARKET DATA
  =======================================================
  */

  const geckoTrades =
    await getGeckoTrades(
      phase
    );

  const historicalCandles =
    await getHistoricalWethCandles(
      phase
    );

  /*
  Only fetch Coinbase if needed.
  */

  let coinbaseCandles =
    [];

  if (
    historicalCandles.length ===
    0
  ) {
    coinbaseCandles =
      await getCoinbaseHistoricalCandles(
        phase
      );
  }

  const fallbackWethPrice =
    await getWethPrice();

  console.log(
    `[CHALLENGE] Phase #${phase.id} fallback WETH price:`,
    fallbackWethPrice
  );

  /*
  =======================================================
  PROCESS TRANSACTIONS
  =======================================================
  */

  let processed =
    0;

  for (
    const [
      hash,
      txTransfers,
    ] of byHash
  ) {
    processed++;

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

      if (!transaction) {
        continue;
      }

      const geckoTrade =
        geckoTrades.get(
          hash
        );

      const timestamp =
        Number(
          txTransfers[0]
            ?.timeStamp ||
            0
        );

      /*
      =====================================================
      DETERMINE BUY / SELL FROM PLPE POOL FLOW
      =====================================================
      */

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

      const sellTransfers =
        transfers.plpe.filter(
          (transfer) =>
            transfer.to ===
              POOL &&
            transfer.from !==
              POOL
        );

      /*
      A valid swap should have exactly
      one direction relative to this pool.

      If both directions exist in one TX,
      we don't blindly classify it.
      */

      if (
        buyTransfers.length > 0 &&
        sellTransfers.length > 0
      ) {
        console.warn(
          `[CHALLENGE] Ambiguous TX skipped: ${hash}`
        );

        continue;
      }

      /*
      =====================================================
      BUY
      =====================================================
      */

      if (
        buyTransfers.length > 0
      ) {
        const buy =
          findBuy(
            receipt,
            transaction,
            geckoTrade
          );

        if (!buy) {
          continue;
        }

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

          nativeEthAmount:
            buy.nativeEthAmount,

          verified:
            true,
        };

        const usd =
          getTradeUsdValue(
            trade,

            geckoTrade,

            historicalCandles,

            coinbaseCandles,

            fallbackWethPrice
          );

        trade.volumeUsd =
          usd.usd;

        trade.volumeSource =
          usd.source;

        /*
        A verified trade with no USD value
        cannot be used for leaderboard volume.
        */

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
      =====================================================
      SELL
      =====================================================
      */

      if (
        sellTransfers.length > 0
      ) {
        /*
        Only fetch internal TX data
        when native ETH fallback may
        actually be necessary.
        */

        let internalTransactions =
          [];

        const hasWethOut =
          transfers.weth.some(
            (weth) =>
              weth.from ===
                POOL &&
              weth.to !==
                POOL
          );

        if (
          !hasWethOut
        ) {
          internalTransactions =
            await getInternalTransactions(
              hash
            );
        }

        const sell =
          findSell(
            receipt,

            transaction,

            geckoTrade,

            internalTransactions
          );

        if (!sell) {
          continue;
        }

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

          nativeEthAmount:
            sell.nativeEthAmount,

          outputType:
            sell.outputType,

          verified:
            true,
        };

        const usd =
          getTradeUsdValue(
            trade,

            geckoTrade,

            historicalCandles,

            coinbaseCandles,

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

      /*
      Progress logging.
      */

      if (
        processed % 100 ===
        0
      ) {
        console.log(
          `[CHALLENGE] Phase #${phase.id}: processed ${processed}/${byHash.size}`
        );
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
  =======================================================
  REMOVE DUPLICATE TXS
  =======================================================
  */

  const uniqueTrades =
    new Map();

  for (
    const trade of
      trades
  ) {
    uniqueTrades.set(
      trade.hash,
      trade
    );
  }

  const result =
    Array.from(
      uniqueTrades.values()
    )
      .sort(
        (a, b) =>
          a.timestamp -
          b.timestamp
      );

  console.log(
    `[CHALLENGE] Phase #${phase.id} verified trades:`,
    result.length
  );

  return result;
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

          volume:
            0,

          buyVolume:
            0,

          sellVolume:
            0,

          trades:
            0,

          buys:
            0,

          sells:
            0,

          qualifyingBuys:
            0,

          entries:
            0,

          entryDetails:
            [],
        }
      );
    }

    const item =
      wallets.get(
        wallet
      );

    /*
    =====================================================
    TOTAL VOLUME
    =====================================================
    */

    item.volume +=
      tradeVolume;

    item.trades +=
      1;

    /*
    =====================================================
    BUY
    =====================================================
    */

    if (
      trade.plpeDirection ===
      "BUY"
    ) {
      item.buys +=
        1;

      item.buyVolume +=
        tradeVolume;

      /*
      ENTRY:

      Every individual BUY >= $2
      gives exactly 1 ENTRY.

      BUY < $2 = 0.

      SELL = 0.

      Max 6.
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
                round(
                  tradeVolume,
                  4
                ),

              source:
                trade.volumeSource,

              timestamp:
                trade.timestamp,

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
      item.sells +=
        1;

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
        (item) => ({
          rank:
            0,

          wallet:
            item.wallet,

          volume:
            round(
              item.volume,
              4
            ),

          buyVolume:
            round(
              item.buyVolume,
              4
            ),

          sellVolume:
            round(
              item.sellVolume,
              4
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
          /*
          PRIMARY:
          total volume

          SECONDARY:
          entries
          */
          b.volume -
            a.volume ||
          b.entries -
            a.entries
      );

  /*
  =======================================================
  RANKING
  =======================================================
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
  phase = getActivePhase()
) {
  if (!phase) {
    throw new Error(
      "Challenge phase not found"
    );
  }

  console.log(
    "======================================"
  );

  console.log(
    `PLPE MONTHLY TRADING CHALLENGE - PHASE #${phase.id}`
  );

  console.log(
    `${phase.start} -> ${phase.end}`
  );

  console.log(
    "======================================"
  );

  /*
  =======================================================
  LOAD TRANSFERS
  =======================================================
  */

  const allPLPE =
    await getPLPETransfers(
      phase
    );

  /*
  =======================================================
  PHASE FILTER
  =======================================================
  */

  const phasePLPE =
    allPLPE.filter(
      (tx) =>
        isInPhase(
          tx.timeStamp,
          phase
        )
    );

  /*
  =======================================================
  VERIFY TRADES
  =======================================================
  */

  const verifiedTrades =
    await buildTrades(
      phasePLPE,
      phase
    );

  /*
  =======================================================
  LEADERBOARD
  =======================================================
  */

  const leaderboard =
    buildLeaderboard(
      verifiedTrades
    );

  /*
  =======================================================
  STATS
  =======================================================
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

  /*
  =======================================================
  FINAL RESULT
  =======================================================
  */

  return {
    status:
      "1",

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
        "Each individual BUY >= $2 gives exactly 1 ENTRY. SELL gives 0 ENTRY.",
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
        round(
          totalVolume,
          4
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
    phaseId
      ? getPhaseById(
          phaseId
        )
      : getActivePhase();

  if (!phase) {
    throw new Error(
      `Unknown challenge phase: ${phaseId}`
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

  /*
  =======================================================
  CACHE
  =======================================================
  */

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
    CACHE ONLY VALID RESULT
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

    /*
    NEVER RETURN FAKE ZERO.
    */

    if (
      cached?.data
    ) {
      console.warn(
        `[CHALLENGE] Returning last successful Phase #${phase.id} cache.`
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
    phaseId
      ? getPhaseById(
          phaseId
        )
      : getActivePhase();

  if (!phase) {
    throw new Error(
      `Unknown challenge phase: ${phaseId}`
    );
  }

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
  if (phaseId) {
    const id =
      String(
        phaseId
      );

    challengeCache.delete(
      id
    );

    plpeTransfersCache.delete(
      id
    );

    geckoTradesCache.delete(
      id
    );

    historicalWethCache.delete(
      id
    );

    coinbaseHistoricalCache.delete(
      id
    );

    blockRangeCache.delete(
      id
    );

    console.log(
      `[CHALLENGE] Phase #${id} cache cleared.`
    );

    return;
  }

  /*
  ALL CACHE
  */

  challengeCache.clear();

  plpeTransfersCache.clear();

  geckoTradesCache.clear();

  historicalWethCache.clear();

  coinbaseHistoricalCache.clear();

  blockRangeCache.clear();

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
  const active =
    getActivePhase();

  return PHASES.map(
    (phase) => ({
      ...phase,

      active:
        phase.id ===
        active.id,
    })
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

  getChallengePhases,

  getActivePhase,
};
