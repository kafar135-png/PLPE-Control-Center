const { getMarketData } = require("../services/gecko");

async function market(req, res) {
  try {
    const data = await getMarketData();

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Market API error",
    });
  }
}

module.exports = {
  market,
};