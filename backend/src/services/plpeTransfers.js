const axios = require("axios");
require("dotenv").config();

/*
=========================================================
PLPE TRANSFER SOURCE
=========================================================

PRIMARY:
Alchemy Transfers API

PURPOSE:
- Challenge
- Wallet history
- Holder calculation

NO ETHERSCAN REQUIRED FOR NORMAL OPERATION.

=========================================================
*/

const RPC_URL =
  process.env.ETHEREUM_RPC_URL;

const PLPE =
  (
    process.env.PLPE_CONTRACT ||
    "0xc34e5ef4f7f5607fbd3e060077cd6e2161ab54c7"
  ).toLowerCase();

const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000";

const CACHE_TIME =
  30 * 1000;

/*
 * Small overlap protects us against
 * short chain reorganizations.
 */
const REORG_OVERLAP_BLOCKS =
  12;

const cache = {
  data: null,
  time: 0,
  syncedThroughBlock: null,
};

const blockTimestampCache =
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

function hexToNumber(value) {
  if (!value) {
    return 0;
  }

  try {
    return Number(
      BigInt(value)
    );
  } catch {
    return 0;
  }
}

function rawValueToDecimalString(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "0";
  }

  try {
    /*
     * Alchemy rawContract.value is
     * normally hex.
     */
    return BigInt(
      String(value)
    ).toString(10);
  } catch {
    return "0";
  }
}

function decimalFromAlchemy(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "18";
  }

  try {
    return String(
      Number(
        BigInt(
          String(value)
        )
      )
    );
  } catch {
    return "18";
  }
}

function blockToHex(
  blockNumber
) {
  return (
    "0x" +
    Number(
      blockNumber
    ).toString(16)
  );
}

/*
=========================================================
SAFE RPC REQUEST
=========================================================
*/

async function rpc(
  method,
  params = []
) {
  if (!RPC_URL) {
    throw new Error(
      "ETHEREUM_RPC_URL is missing"
    );
  }

  try {
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
          timeout: 30000,

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
  } catch (error) {
    /*
     * IMPORTANT:
     * Never dump Axios config.
     * RPC URL contains Alchemy API key.
     */

    const message =
      error?.response
        ?.data
        ?.error
        ?.message ||

      error?.response
        ?.data
        ?.message ||

      error?.message ||

      "Unknown RPC error";

    throw new Error(
      `${method}: ${message}`
    );
  }
}

/*
=========================================================
CURRENT BLOCK
=========================================================
*/

async function getLatestBlockNumber() {
  const value =
    await rpc(
      "eth_blockNumber"
    );

  return hexToNumber(
    value
  );
}

/*
=========================================================
BLOCK TIMESTAMP
=========================================================
*/

async function getBlockTimestamp(
  blockNumber
) {
  const key =
    Number(
      blockNumber
    );

  if (
    blockTimestampCache.has(
      key
    )
  ) {
    return (
      blockTimestampCache.get(
        key
      )
    );
  }

  const block =
    await rpc(
      "eth_getBlockByNumber",
      [
        blockToHex(
          key
        ),
        false,
      ]
    );

  if (!block) {
    throw new Error(
      `Block ${key} unavailable`
    );
  }

  const timestamp =
    hexToNumber(
      block.timestamp
    );

  blockTimestampCache.set(
    key,
    timestamp
  );

  return timestamp;
}

/*
=========================================================
UNIQUE ID / LOG INDEX
=========================================================
*/

function getLogIndex(
  transfer
) {
  const uniqueId =
    String(
      transfer?.uniqueId ||
      ""
    );

  /*
   * Typical:
   * 0xHASH:log:12
   */

  const match =
    uniqueId.match(
      /:log:(\d+)$/i
    );

  if (match) {
    return String(
      Number(
        match[1]
      )
    );
  }

  return "0";
}

/*
=========================================================
NORMALIZE ALCHEMY TRANSFER
=========================================================

Output intentionally resembles Etherscan tokentx
because Challenge already understands this format.

=========================================================
*/

async function normalizeAlchemyTransfer(
  transfer
) {
  const blockNumber =
    hexToNumber(
      transfer.blockNum
    );

  let timestamp = 0;

  const metadataTimestamp =
    transfer?.metadata
      ?.blockTimestamp ||

    transfer?.blockTimestamp;

  if (
    metadataTimestamp
  ) {
    const milliseconds =
      new Date(
        metadataTimestamp
      ).getTime();

    if (
      Number.isFinite(
        milliseconds
      )
    ) {
      timestamp =
        Math.floor(
          milliseconds /
          1000
        );
    }
  }

  if (!timestamp) {
    timestamp =
      await getBlockTimestamp(
        blockNumber
      );
  }

  const rawContract =
    transfer.rawContract ||
    {};

  return {
    blockNumber:
      String(
        blockNumber
      ),

    timeStamp:
      String(
        timestamp
      ),

    hash:
      normalizeHash(
        transfer.hash
      ),

    nonce: "",

    blockHash: "",

    from:
      normalizeAddress(
        transfer.from
      ),

    contractAddress:
      PLPE,

    to:
      normalizeAddress(
        transfer.to
      ),

    value:
      rawValueToDecimalString(
        rawContract.value
      ),

    tokenName:
      "PolishPepe",

    tokenSymbol:
      "PLPE",

    tokenDecimal:
      decimalFromAlchemy(
        rawContract.decimal
      ),

    transactionIndex:
      "",

    gas:
      "",

    gasPrice:
      "",

    gasUsed:
      "",

    cumulativeGasUsed:
      "",

    input:
      "",

    confirmations:
      "",

    logIndex:
      getLogIndex(
        transfer
      ),

    /*
     * Internal field used only
     * for reliable deduplication.
     */
    _alchemyUniqueId:
      String(
        transfer.uniqueId ||
        ""
      ),
  };
}

/*
=========================================================
ALCHEMY TRANSFERS API
=========================================================

Alchemy supports:
- contractAddresses
- ERC20 filtering
- up to 1000 results/page
- pageKey pagination

=========================================================
*/

async function loadAlchemyRange(
  fromBlock,
  toBlock
) {
  const transfers = [];

  let pageKey =
    null;

  let page =
    1;

  do {
    const request = {
      fromBlock:
        blockToHex(
          fromBlock
        ),

      toBlock:
        blockToHex(
          toBlock
        ),

      contractAddresses: [
        PLPE,
      ],

      category: [
        "erc20",
      ],

      /*
       * Match Etherscan behavior
       * as closely as possible.
       */
      excludeZeroValue:
        false,

      withMetadata:
        true,

      maxCount:
        "0x3e8",
    };

    if (pageKey) {
      request.pageKey =
        pageKey;
    }

    console.log(
      `[PLPE TRANSFERS] Alchemy page ${page}`
    );

    const result =
      await rpc(
        "alchemy_getAssetTransfers",
        [
          request,
        ]
      );

    if (
      !result ||
      !Array.isArray(
        result.transfers
      )
    ) {
      throw new Error(
        "Alchemy Transfers API returned invalid result"
      );
    }

    for (
      const transfer of
      result.transfers
    ) {
      /*
       * Defensive filtering.
       */

      const contract =
        normalizeAddress(
          transfer
            ?.rawContract
            ?.address
        );

      if (
        contract &&
        contract !== PLPE
      ) {
        continue;
      }

      const normalized =
        await normalizeAlchemyTransfer(
          transfer
        );

      transfers.push(
        normalized
      );
    }

    pageKey =
      result.pageKey ||
      null;

    page++;

    /*
     * pageKey expires after a while,
     * so pagination is intentionally
     * continuous without long waits.
     */
  } while (
    pageKey
  );

  return transfers;
}

/*
=========================================================
TRANSFER KEY
=========================================================
*/

function transferKey(
  transfer
) {
  if (
    transfer
      ?._alchemyUniqueId
  ) {
    return (
      transfer
        ._alchemyUniqueId
    );
  }

  return [
    normalizeHash(
      transfer.hash
    ),

    String(
      transfer.blockNumber ||
      ""
    ),

    String(
      transfer.logIndex ||
      ""
    ),

    normalizeAddress(
      transfer.from
    ),

    normalizeAddress(
      transfer.to
    ),

    String(
      transfer.value ||
      "0"
    ),
  ].join("|");
}

/*
=========================================================
DEDUPLICATE + SORT
=========================================================
*/

function normalizeCollection(
  transfers
) {
  const map =
    new Map();

  for (
    const transfer of
    transfers
  ) {
    map.set(
      transferKey(
        transfer
      ),
      transfer
    );
  }

  return Array.from(
    map.values()
  ).sort(
    (a, b) => {
      const blockDiff =
        Number(
          a.blockNumber ||
          0
        ) -
        Number(
          b.blockNumber ||
          0
        );

      if (blockDiff) {
        return blockDiff;
      }

      return (
        Number(
          a.logIndex ||
          0
        ) -
        Number(
          b.logIndex ||
          0
        )
      );
    }
  );
}

/*
=========================================================
FIRST FULL SYNC
=========================================================
*/

async function fullSync() {
  const head =
    await getLatestBlockNumber();

  console.log(
    "[PLPE TRANSFERS] Full Alchemy sync..."
  );

  console.log(
    "[PLPE TRANSFERS] Head block:",
    head
  );

  const transfers =
    await loadAlchemyRange(
      0,
      head
    );

  cache.data =
    normalizeCollection(
      transfers
    );

  cache.syncedThroughBlock =
    head;

  cache.time =
    Date.now();

  console.log(
    "[PLPE TRANSFERS] Full sync complete:",
    cache.data.length,
    "transfers"
  );

  return cache.data;
}

/*
=========================================================
INCREMENTAL SYNC
=========================================================

After first sync we DO NOT load history again.

Only:
(last synced block - reorg overlap)
->
current head

=========================================================
*/

async function incrementalSync() {
  if (
    !Array.isArray(
      cache.data
    ) ||
    cache.syncedThroughBlock ===
      null
  ) {
    return fullSync();
  }

  const head =
    await getLatestBlockNumber();

  if (
    head <=
    cache.syncedThroughBlock
  ) {
    cache.time =
      Date.now();

    return cache.data;
  }

  const fromBlock =
    Math.max(
      0,

      cache.syncedThroughBlock -
      REORG_OVERLAP_BLOCKS
    );

  console.log(
    `[PLPE TRANSFERS] Incremental sync ${fromBlock} -> ${head}`
  );

  const latest =
    await loadAlchemyRange(
      fromBlock,
      head
    );

  /*
   * Remove overlap from current cache.
   * Then insert fresh canonical data.
   */

  const preserved =
    cache.data.filter(
      (transfer) =>
        Number(
          transfer.blockNumber ||
          0
        ) <
        fromBlock
    );

  cache.data =
    normalizeCollection([
      ...preserved,
      ...latest,
    ]);

  cache.syncedThroughBlock =
    head;

  cache.time =
    Date.now();

  console.log(
    "[PLPE TRANSFERS] Incremental sync complete:",
    cache.data.length,
    "total transfers"
  );

  return cache.data;
}

/*
=========================================================
PUBLIC GETTER
=========================================================
*/

async function getPLPETransfers() {
  const now =
    Date.now();

  if (
    Array.isArray(
      cache.data
    ) &&
    now -
      cache.time <
      CACHE_TIME
  ) {
    return cache.data;
  }

  try {
    return await incrementalSync();
  } catch (error) {
    console.error(
      "[PLPE TRANSFERS] Alchemy error:",
      error.message
    );

    /*
     * IMPORTANT:
     * If temporary provider failure occurs,
     * keep the last known valid on-chain
     * dataset instead of destroying Challenge.
     */

    if (
      Array.isArray(
        cache.data
      ) &&
      cache.data.length >
        0
    ) {
      console.warn(
        "[PLPE TRANSFERS] Using stale cached transfer data."
      );

      return cache.data;
    }

    throw error;
  }
}

/*
=========================================================
CACHE STATUS
=========================================================
*/

function getPLPETransferStatus() {
  return {
    source:
      "alchemy",

    cachedTransfers:
      Array.isArray(
        cache.data
      )
        ? cache.data.length
        : 0,

    syncedThroughBlock:
      cache
        .syncedThroughBlock,

    cacheAgeMs:
      cache.time
        ? Date.now() -
          cache.time
        : null,
  };
}

/*
=========================================================
EXPORT
=========================================================
*/

module.exports = {
  getPLPETransfers,
  getPLPETransferStatus,
  ZERO_ADDRESS,
};