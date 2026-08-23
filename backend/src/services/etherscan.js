const axios = require("axios");

const API_KEY = process.env.ETHERSCAN_API_KEY;

const CONTRACT =
  "0xc34e5ef4f7f5607fbd3e060077cd6e2161ab54c7";

console.log("ETHERSCAN API:", API_KEY);

async function getWalletHistory(address) {
  try {
    const response = await axios.get(
      "https://api.etherscan.io/v2/api",
      {
        params: {
          chainid: "1",
          module: "account",
          action: "tokentx",
          address: address,
          contractaddress: CONTRACT,
          page: 1,
          offset: 100,
          sort: "asc",
          apikey: API_KEY,
        },
      }
    );

    console.log("ETHERSCAN RESPONSE:");
    console.dir(response.data, { depth: null });

    return response.data;
  } catch (err) {
    console.log("========== ETHERSCAN ERROR ==========");

    if (err.response) {
      console.log(err.response.status);
      console.dir(err.response.data, { depth: null });
    } else {
      console.log(err.message);
    }

    console.log("=====================================");

    throw err;
  }
}

module.exports = {
  getWalletHistory,
};