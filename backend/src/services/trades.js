const axios = require("axios");

const POOL =
  "0xb4ffb01c89ffa24e6d01de95d3d780bc3e835390";

async function getTrades() {
  try {
    const response = await axios.get(
      `https://api.geckoterminal.com/api/v2/networks/eth/pools/${POOL}/trades`,
      {
        timeout: 15000,
      }
    );

    console.log("========== PLPE TRADES ==========");

    const data = response.data;

    console.dir(data, {
      depth: 5,
    });

    const trades =
      data?.data ?? [];

    console.log(
      "TRADES COUNT:",
      Array.isArray(trades)
        ? trades.length
        : 0
    );

    if (Array.isArray(trades) && trades.length > 0) {
      console.log(
        "FIRST TRADE:"
      );

      console.dir(
        trades[0],
        {
          depth: 10,
        }
      );
    }

    console.log(
      "================================="
    );

    return data;
  } catch (err) {
    console.log(
      "========== TRADES ERROR =========="
    );

    console.log(
      err.response?.status
    );

    console.dir(
      err.response?.data,
      {
        depth: null,
      }
    );

    console.log(err.message);

    console.log(
      "=================================="
    );

    throw err;
  }
}

module.exports = {
  getTrades,
};