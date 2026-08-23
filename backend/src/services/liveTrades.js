const axios = require("axios");

const API_KEY = process.env.ETHERSCAN_API_KEY;
const CONTRACT = process.env.PLPE_CONTRACT;

async function getLiveTrades() {
  const response = await axios.get(
    "https://api.etherscan.io/v2/api",
    {
      params: {
        chainid: 1,
        module: "account",
        action: "tokentx",
        contractaddress: CONTRACT,
        page: 1,
        offset: 25,
        sort: "desc",
        apikey: API_KEY,
      },
    }
  );

  const data = response.data;

  if (
    data.status !== "1" ||
    !Array.isArray(data.result)
  ) {
    console.error(
      "ETHERSCAN LIVE TRADES ERROR:",
      data
    );

    return [];
  }

  return data.result;
}

module.exports = {
  getLiveTrades,
};