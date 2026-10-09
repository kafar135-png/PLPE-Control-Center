const {
  getPLPETransfers,
  ZERO_ADDRESS,
} = require("./plpeTransfers");

/*
=========================================================
PLPE HOLDERS
=========================================================

No Etherscan API.

Holder balances are reconstructed directly from
the complete PLPE ERC20 Transfer history loaded
through Alchemy.

The endpoint returns:

- total holder count
- top community holders
- official PolishPepe project wallets
- PLPE/WETH liquidity pool

Project wallets and the liquidity pool are NOT
included in the community holder ranking.

=========================================================
*/

const HOLDERS_CACHE_TIME =
  30 * 1000;

const TOKEN_DECIMALS = 18n;

const TOKEN_DIVISOR =
  10n ** TOKEN_DECIMALS;

const TOTAL_SUPPLY_TOKENS =
  1_000_000_000n;

const TOTAL_SUPPLY_RAW =
  TOTAL_SUPPLY_TOKENS *
  TOKEN_DIVISOR;

const TOP_COMMUNITY_LIMIT = 10;

/*
=========================================================
OFFICIAL POLISHPEPE WALLETS
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
PLPE/WETH UNISWAP V2 POOL
=========================================================
*/

const LIQUIDITY_POOL = {
  name: "PLPE/WETH Liquidity Pool",
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

function formatTokenAmount(rawBalance) {
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

  if (fraction === 0n) {
    return whole.toString();
  }

  const fractionString =
    fraction
      .toString()
      .padStart(
        Number(TOKEN_DECIMALS),
        "0"
      )
      .replace(/0+$/, "");

  return `${whole.toString()}.${fractionString}`;
}

function calculatePercent(rawBalance) {
  if (
    rawBalance <= 0n ||
    TOTAL_SUPPLY_RAW <= 0n
  ) {
    return 0;
  }

  /*
   * 1,000,000 scaling gives
   * percentage precision to 4 decimals.
   *
   * Example:
   * 100% => 1,000,000 / 10,000 = 100
   */

  const scaled =
    (
      rawBalance *
      1_000_000n
    ) /
    TOTAL_SUPPLY_RAW;

  return (
    Number(scaled) /
    10_000
  );
}

function createHolderEntry(
  address,
  balance
) {
  return {
    wallet: address,
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
    RECONSTRUCT ALL TOKEN BALANCES
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
       * MINT:
       * zero -> holder
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
       * BURN:
       * holder -> zero
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
    ADDRESSES EXCLUDED FROM COMMUNITY RANKING
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
    TOP COMMUNITY HOLDERS
    =====================================================
    */

    const topHolders =
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
          (a, b) => {
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
        )
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
    OFFICIAL PROJECT WALLETS
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
      projectWallets,
      liquidityPool,
    };

    holdersCache.data =
      result;

    holdersCache.time =
      now;

    console.log(
      "[HOLDERS] Calculated from PLPE transfers:",
      {
        holders,
        communityTop:
          topHolders.length,
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
      projectWallets:
        PROJECT_WALLETS.map(
          (wallet) => ({
            name:
              wallet.name,

            wallet:
              wallet.address,

            balance: "0",
            percent: 0,
            type: "project",
          })
        ),

      liquidityPool: {
        name:
          LIQUIDITY_POOL.name,

        wallet:
          LIQUIDITY_POOL.address,

        balance: "0",
        percent: 0,
        type: "liquidity",
      },
    };
  }
}

module.exports = {
  getHolders,
};