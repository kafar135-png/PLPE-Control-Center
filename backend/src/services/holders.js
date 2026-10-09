const {
  getPLPETransfers,
  ZERO_ADDRESS,
} = require("./plpeTransfers");

/*
=========================================================
PLPE HOLDERS
=========================================================

Data source:
- complete PLPE ERC20 Transfer history via Alchemy

Address classification:
- eth_getCode === "0x" -> regular wallet / EOA
- eth_getCode contains bytecode -> smart contract

The API returns:

- holders
- topHolders
- contractHolders
- projectWallets
- liquidityPool

Project wallets, smart contracts and liquidity pool
are excluded from Top Community Holders.

=========================================================
*/

const RPC_URL =
  process.env.ETHEREUM_RPC_URL;

const HOLDERS_CACHE_TIME =
  30 * 1000;

const TOKEN_DECIMALS =
  18n;

const TOKEN_DIVISOR =
  10n ** TOKEN_DECIMALS;

const TOTAL_SUPPLY_TOKENS =
  1_000_000_000n;

const TOTAL_SUPPLY_RAW =
  TOTAL_SUPPLY_TOKENS *
  TOKEN_DIVISOR;

const TOP_COMMUNITY_LIMIT =
  10;

const TOP_CONTRACT_LIMIT =
  10;

const CODE_BATCH_SIZE =
  50;

/*
=========================================================
OFFICIAL PROJECT WALLETS
=========================================================
*/

const PROJECT_WALLETS = [
  {
    name: "Liquidity Expansion",
    address:
      "0xDcF069E8857081517cA38c8483796815BC174D41",
  },
  {
    name: "Ecosystem",
    address:
      "0x3183f1a520eE8b3dB3df847ea665dc97D4b872B8",
  },
  {
    name: "Marketing",
    address:
      "0x83f3D19244f2510107539Be2DF2EFF918d016603",
  },
  {
    name: "Deployer",
    address:
      "0x4127C2BF0d09626056C8f75058E33bbD0F45a060",
  },
  {
    name: "Strategic Reserve",
    address:
      "0x5a33DF90B710Ab237F91482a3526862C0a28119C",
  },
  {
    name: "Team",
    address:
      "0xC4a8D580a94E2baEDc2eafF48eC28Fb116fa55c5",
  },
];

/*
=========================================================
OFFICIAL LIQUIDITY POOL
=========================================================
*/

const LIQUIDITY_POOL = {
  name:
    "PLPE/WETH Liquidity Pool",

  address:
    "0xb4ffb01c89ffa24e6d01de95d3d780bc3e835390",
};

/*
=========================================================
CACHE
=========================================================
*/

const holdersCache = {
  data: null,
  time: 0,
};

/*
 * Contract/EOA classification is cached for the
 * lifetime of the backend process.
 */

const addressTypeCache =
  new Map();

/*
=========================================================
HELPERS
=========================================================
*/

function normalizeAddress(
  value
) {
  if (!value) {
    return "";
  }

  return String(
    value
  ).toLowerCase();
}

function getRpcUrl() {
  if (!RPC_URL) {
    throw new Error(
      "ETHEREUM_RPC_URL is not configured"
    );
  }

  try {
    return new URL(
      RPC_URL
    ).toString();
  } catch {
    throw new Error(
      "ETHEREUM_RPC_URL is invalid"
    );
  }
}

function formatTokenAmount(
  rawBalance
) {
  const balance =
    rawBalance > 0n
      ? rawBalance
      : 0n;

  const whole =
    balance /
    TOKEN_DIVISOR;

  const fraction =
    balance %
    TOKEN_DIVISOR;

  if (
    fraction === 0n
  ) {
    return whole.toString();
  }

  const fractionString =
    fraction
      .toString()
      .padStart(
        Number(
          TOKEN_DECIMALS
        ),
        "0"
      )
      .replace(
        /0+$/,
        ""
      );

  return `${whole.toString()}.${fractionString}`;
}

function calculatePercent(
  rawBalance
) {
  if (
    rawBalance <= 0n
  ) {
    return 0;
  }

  /*
   * Percentage with 4 decimal places.
   */

  const scaled =
    (
      rawBalance *
      1_000_000n
    ) /
    TOTAL_SUPPLY_RAW;

  return (
    Number(
      scaled
    ) /
    10_000
  );
}

function createHolderEntry(
  address,
  balance
) {
  return {
    wallet:
      address,

    balance:
      formatTokenAmount(
        balance
      ),

    percent:
      calculatePercent(
        balance
      ),
  };
}

function createNamedWalletEntry(
  wallet,
  balances,
  type
) {
  const normalized =
    normalizeAddress(
      wallet.address
    );

  const balance =
    balances.get(
      normalized
    ) ||
    0n;

  return {
    name:
      wallet.name,

    wallet:
      wallet.address,

    balance:
      formatTokenAmount(
        balance
      ),

    percent:
      calculatePercent(
        balance
      ),

    type,
  };
}

/*
=========================================================
ETH_GETCODE BATCH CLASSIFICATION
=========================================================

Instead of calling Alchemy once for every holder,
addresses are checked in JSON-RPC batches.

This is much faster and reduces request count.

=========================================================
*/

async function classifyAddressBatch(
  addresses
) {
  const unresolved =
    addresses.filter(
      (address) =>
        !addressTypeCache.has(
          normalizeAddress(
            address
          )
        )
    );

  if (
    unresolved.length ===
    0
  ) {
    return;
  }

  const url =
    getRpcUrl();

  const payload =
    unresolved.map(
      (
        address,
        index
      ) => ({
        jsonrpc:
          "2.0",

        id:
          index + 1,

        method:
          "eth_getCode",

        params: [
          normalizeAddress(
            address
          ),
          "latest",
        ],
      })
    );

  const response =
    await fetch(
      url,
      {
        method:
          "POST",

        headers: {
          "content-type":
            "application/json",
        },

        body:
          JSON.stringify(
            payload
          ),
      }
    );

  if (
    !response.ok
  ) {
    throw new Error(
      `eth_getCode batch: HTTP ${response.status}`
    );
  }

  const result =
    await response.json();

  if (
    !Array.isArray(
      result
    )
  ) {
    throw new Error(
      "eth_getCode batch returned invalid response"
    );
  }

  const byId =
    new Map(
      result.map(
        (item) => [
          item.id,
          item,
        ]
      )
    );

  unresolved.forEach(
    (
      address,
      index
    ) => {
      const item =
        byId.get(
          index + 1
        );

      if (
        !item ||
        item.error
      ) {
        return;
      }

      const code =
        item.result;

      const type =
        code &&
        code !==
          "0x" &&
        code !==
          "0x0"
          ? "contract"
          : "eoa";

      addressTypeCache.set(
        normalizeAddress(
          address
        ),
        type
      );
    }
  );
}

async function classifyAddresses(
  addresses
) {
  for (
    let i = 0;
    i <
    addresses.length;
    i +=
      CODE_BATCH_SIZE
  ) {
    const batch =
      addresses.slice(
        i,
        i +
          CODE_BATCH_SIZE
      );

    await classifyAddressBatch(
      batch
    );
  }
}

/*
=========================================================
GET HOLDERS
=========================================================
*/

async function getHolders() {
  const now =
    Date.now();

  if (
    holdersCache.data &&
    now -
      holdersCache.time <
      HOLDERS_CACHE_TIME
  ) {
    return holdersCache.data;
  }

  try {
    const transfers =
      await getPLPETransfers();

    const balances =
      new Map();

    /*
    =====================================================
    RECONSTRUCT ALL PLPE BALANCES
    =====================================================
    */

    for (
      const transfer of
      transfers
    ) {
      const from =
        normalizeAddress(
          transfer.from
        );

      const to =
        normalizeAddress(
          transfer.to
        );

      let amount;

      try {
        amount =
          BigInt(
            transfer.value ||
            "0"
          );
      } catch {
        amount =
          0n;
      }

      if (
        amount === 0n
      ) {
        continue;
      }

      /*
       * Sender loses tokens.
       * Zero address is ignored.
       */

      if (
        from &&
        from !==
          ZERO_ADDRESS
      ) {
        balances.set(
          from,

          (
            balances.get(
              from
            ) ||
            0n
          ) -
            amount
        );
      }

      /*
       * Receiver gains tokens.
       * Zero address is ignored.
       */

      if (
        to &&
        to !==
          ZERO_ADDRESS
      ) {
        balances.set(
          to,

          (
            balances.get(
              to
            ) ||
            0n
          ) +
            amount
        );
      }
    }

    /*
    =====================================================
    TOTAL HOLDERS
    =====================================================
    */

    let holders =
      0;

    for (
      const balance of
      balances.values()
    ) {
      if (
        balance >
        0n
      ) {
        holders++;
      }
    }

    /*
    =====================================================
    EXCLUDED ADDRESSES
    =====================================================
    */

    const excludedAddresses =
      new Set(
        PROJECT_WALLETS.map(
          (wallet) =>
            normalizeAddress(
              wallet.address
            )
        )
      );

    excludedAddresses.add(
      normalizeAddress(
        LIQUIDITY_POOL.address
      )
    );

    /*
    =====================================================
    NON-PROJECT HOLDER CANDIDATES
    =====================================================
    */

    const candidates =
      Array.from(
        balances.entries()
      )
        .filter(
          ([
            address,
            balance,
          ]) =>
            balance >
              0n &&
            !excludedAddresses.has(
              address
            )
        )
        .sort(
          (
            a,
            b
          ) => {
            if (
              a[1] ===
              b[1]
            ) {
              return 0;
            }

            return a[1] >
              b[1]
              ? -1
              : 1;
          }
        );

    /*
    =====================================================
    DETECT SMART CONTRACTS
    =====================================================
    */

    await classifyAddresses(
      candidates.map(
        ([
          address,
        ]) =>
          address
      )
    );

    /*
    =====================================================
    SPLIT COMMUNITY / CONTRACTS
    =====================================================
    */

    const communityCandidates =
      [];

    const contractCandidates =
      [];

    for (
      const [
        address,
        balance,
      ] of candidates
    ) {
      const type =
        addressTypeCache.get(
          normalizeAddress(
            address
          )
        );

      /*
       * If classification failed for some reason,
       * do NOT falsely call it a smart contract.
       *
       * It stays in community ranking until a
       * successful on-chain classification occurs.
       */

      if (
        type ===
        "contract"
      ) {
        contractCandidates.push([
          address,
          balance,
        ]);
      } else {
        communityCandidates.push([
          address,
          balance,
        ]);
      }
    }

    /*
    =====================================================
    TOP COMMUNITY HOLDERS
    =====================================================
    */

    const topHolders =
      communityCandidates
        .slice(
          0,
          TOP_COMMUNITY_LIMIT
        )
        .map(
          ([
            address,
            balance,
          ]) =>
            createHolderEntry(
              address,
              balance
            )
        );

    /*
    =====================================================
    SMART CONTRACT HOLDERS
    =====================================================
    */

    const contractHolders =
      contractCandidates
        .slice(
          0,
          TOP_CONTRACT_LIMIT
        )
        .map(
          ([
            address,
            balance,
          ]) => ({
            ...createHolderEntry(
              address,
              balance
            ),

            type:
              "contract",
          })
        );

    /*
    =====================================================
    PROJECT WALLETS
    =====================================================
    */

    const projectWallets =
      PROJECT_WALLETS.map(
        (wallet) =>
          createNamedWalletEntry(
            wallet,
            balances,
            "project"
          )
      );

    /*
    =====================================================
    LIQUIDITY POOL
    =====================================================
    */

    const liquidityPool =
      createNamedWalletEntry(
        LIQUIDITY_POOL,
        balances,
        "liquidity"
      );

    /*
    =====================================================
    FINAL RESPONSE
    =====================================================
    */

    const result = {
      holders,
      topHolders,
      contractHolders,
      projectWallets,
      liquidityPool,
    };

    holdersCache.data =
      result;

    holdersCache.time =
      now;

    console.log(
      "[HOLDERS] Calculated:",
      {
        holders,

        community:
          topHolders.length,

        contracts:
          contractHolders.length,

        projectWallets:
          projectWallets.length,
      }
    );

    return result;
  } catch (error) {
    console.error(
      "[HOLDERS] Failed:",
      error.message
    );

    if (
      holdersCache.data
    ) {
      return holdersCache.data;
    }

    return {
      holders: 0,

      topHolders: [],

      contractHolders:
        [],

      projectWallets:
        PROJECT_WALLETS.map(
          (wallet) => ({
            name:
              wallet.name,

            wallet:
              wallet.address,

            balance:
              "0",

            percent:
              0,

            type:
              "project",
          })
        ),

      liquidityPool: {
        name:
          LIQUIDITY_POOL.name,

        wallet:
          LIQUIDITY_POOL.address,

        balance:
          "0",

        percent:
          0,

        type:
          "liquidity",
      },
    };
  }
}

module.exports = {
  getHolders,
};