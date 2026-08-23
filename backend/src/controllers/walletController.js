const { getWalletHistory } = require("../services/etherscan");

async function wallet(req, res) {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({
        status: "0",
        message: "Wallet address is required.",
        result: [],
      });
    }

    const normalized = address.trim();

    if (!/^0x[a-fA-F0-9]{40}$/.test(normalized)) {
      return res.status(400).json({
        status: "0",
        message: "Invalid wallet address.",
        result: [],
      });
    }

    const history = await getWalletHistory(normalized);

    const result = Array.isArray(history.result)
      ? history.result.sort(
          (a, b) =>
            Number(a.timeStamp) - Number(b.timeStamp)
        )
      : [];

    return res.json({
      status: history.status ?? "1",
      message: history.message ?? "OK",
      result,
      meta: {
        address: normalized,
        transactions: result.length,
        generatedAt: Date.now(),
      },
    });
  } catch (err) {
    console.error("Wallet API:", err);

    return res.status(500).json({
      status: "0",
      message: "Wallet API error",
      result: [],
    });
  }
}

module.exports = {
  wallet,
};