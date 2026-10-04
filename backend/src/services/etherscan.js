const {
  getPLPETransfers,
} = require("./plpeTransfers");

/*
=========================================================
WALLET PLPE HISTORY
=========================================================

Legacy filename:
etherscan.js

The implementation NO LONGER uses Etherscan.

Data source:
Alchemy PLPE transfer index.

Keeping the filename avoids breaking
existing controller imports.

=========================================================
*/

function normalizeAddress(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .toLowerCase();
}

async function getWalletHistory(
  address
) {
  const wallet =
    normalizeAddress(
      address
    );

  if (
    !/^0x[a-f0-9]{40}$/.test(
      wallet
    )
  ) {
    return {
      status: "0",
      message:
        "Invalid wallet address",
      result: [],
    };
  }

  try {
    const allTransfers =
      await getPLPETransfers();

    const walletTransfers =
      allTransfers.filter(
        (transfer) =>
          normalizeAddress(
            transfer.from
          ) === wallet ||
          normalizeAddress(
            transfer.to
          ) === wallet
      );

    /*
     * Preserve old endpoint behavior:
     * maximum 100 records.
     */

    const result =
      walletTransfers.slice(
        0,
        100
      );

    return {
      status: "1",
      message: "OK",
      result,
    };
  } catch (error) {
    console.error(
      "[WALLET HISTORY] Failed:",
      error.message
    );

    throw error;
  }
}

module.exports = {
  getWalletHistory,
};