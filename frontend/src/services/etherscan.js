const axios = require("axios");

const API_KEY = process.env.ETHERSCAN_API_KEY;

const CONTRACT =
  "0xc34e5ef4f7f5607fbd3e060077cd6e2161ab54c7";

async function getWalletHistory(address) {
  const response = await axios.get(
    "https://api.etherscan.io/api",
    {
      params: {
        module: "account",
        action: "tokentx",
        contractaddress: CONTRACT,
        address,
        sort: "asc",
        apikey: API_KEY,
      },
      timeout: 10000,
    }
  );

  return response.data.result;
}

module.exports = {
  getWalletHistory,
};