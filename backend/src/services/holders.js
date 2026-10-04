const {
  getPLPETransfers,
  ZERO_ADDRESS,
} = require("./plpeTransfers");

/*
=========================================================
PLPE HOLDERS
=========================================================

No Etherscan API.

Holder count is reconstructed directly from
the complete PLPE ERC20 Transfer history
loaded through Alchemy.

=========================================================
*/

const HOLDERS_CACHE_TIME =
  30 * 1000;

const holdersCache = {
  value: null,
  time: 0,
};

function normalizeAddress(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .toLowerCase();
}

async function getHolders() {
  const now =
    Date.now();

  if (
    Number.isFinite(
      holdersCache.value
    ) &&
    now -
      holdersCache.time <
      HOLDERS_CACHE_TIME
  ) {
    return {
      holders:
        holdersCache.value,
    };
  }

  try {
    const transfers =
      await getPLPETransfers();

    const balances =
      new Map();

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
       *
       * Zero address is never counted
       * as a holder.
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

    holdersCache.value =
      holders;

    holdersCache.time =
      now;

    console.log(
      "[HOLDERS] Calculated from PLPE transfers:",
      holders
    );

    return {
      holders,
    };
  } catch (error) {
    console.error(
      "[HOLDERS] Failed:",
      error.message
    );

    if (
      Number.isFinite(
        holdersCache.value
      )
    ) {
      return {
        holders:
          holdersCache.value,
      };
    }

    return {
      holders: 0,
    };
  }
}

module.exports = {
  getHolders,
};