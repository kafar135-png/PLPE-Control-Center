const { getLiveTrades } = require("../services/liveTrades");

async function liveTrades(req, res) {
  try {
    const trades = await getLiveTrades();

    const data = trades.map((tx) => {
      const amount =
        Number(tx.value) /
        Math.pow(10, Number(tx.tokenDecimal));

      const type =
        tx.from?.toLowerCase() ===
        "0x0000000000000000000000000000000000000000"
          ? "MINT"
          : "TRANSFER";

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        amount,
        timestamp: Number(tx.timeStamp),
        type,
      };
    });

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Live Trades Error",
    });
  }
}

module.exports = {
  liveTrades,
};