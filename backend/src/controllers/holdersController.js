const { getHolders } = require("../services/holders");

async function holders(req, res) {
  try {
    const data = await getHolders();
    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Holders API error",
    });
  }
}

module.exports = {
  holders,
};