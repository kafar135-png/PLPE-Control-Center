const axios = require("axios");

const API_KEY = process.env.ETHERSCAN_API_KEY;
const CONTRACT = process.env.PLPE_CONTRACT;

async function getHolders() {
  const response = await axios.get(
    "https://api.etherscan.io/v2/api",
    {
      params: {
        chainid: 1,
        module: "token",
        action: "tokenholdercount",
        contractaddress: CONTRACT,
        apikey: API_KEY,
      },
    }
  );

  const data = response.data;

  if (data.status !== "1") {
    console.error("ETHERSCAN HOLDERS:", data);

    return {
      holders: 0,
    };
  }

  return {
    holders: Number(data.result),
  };
}

module.exports = {
  getHolders,
};