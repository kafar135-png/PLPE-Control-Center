const { getTrades } = require("../services/trades");

async function trades(req, res) {
  try {
    const data = await getTrades();

    const trades =
      data.data?.map((trade) => {
        const a = trade.attributes;

        const buy = a.kind === "buy";

        return {
          tx: trade.id,

          type: buy ? "BUY" : "SELL",

          amount: buy
            ? Number(a.to_token_amount)
            : Number(a.from_token_amount),

          price: Number(a.price_to_in_usd),

          timestamp: a.block_timestamp,
        };
      }) || [];

    res.json(trades);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Trades API error",
    });

  }
}

module.exports = {
  trades,
};