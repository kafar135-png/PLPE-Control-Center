const {
  getLiveTrades,
} = require("../services/liveTrades");

// =========================================================
// LIVE TRADES
// =========================================================

async function liveTrades(req, res) {
  try {
    const trades =
      await getLiveTrades();

    const data = trades.map((tx) => ({
      hash:
        tx.hash || null,

      from:
        tx.from ||
        tx.txFrom ||
        null,

      to: null,

      type:
        tx.type ||
        "TRADE",

      amount:
        Number(tx.amount) || 0,

      price:
        Number(tx.price) || 0,

      volumeUsd:
        Number(tx.volumeUsd) || 0,

      timestamp:
        Number(tx.timestamp) || 0,

      verified: true,
    }));

    // -----------------------------------------------------
    // NEWEST FIRST
    // -----------------------------------------------------

    data.sort(
      (a, b) =>
        Number(b.timestamp) -
        Number(a.timestamp)
    );

    console.log(
      "[LIVE TRADES CONTROLLER] Returning:",
      data.length
    );

    if (data.length > 0) {
      console.log(
        "[LIVE TRADES CONTROLLER] Latest:",
        data[0]
      );
    }

    res.json(data);

  } catch (err) {
    console.error(
      "[LIVE TRADES CONTROLLER ERROR]",
      err
    );

    res.status(500).json({
      error: "Live Trades Error",
      message:
        err?.message ||
        "Unknown error",
    });
  }
}

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  liveTrades,
};