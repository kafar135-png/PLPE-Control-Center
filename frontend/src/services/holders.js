const axios = require("axios");

const POOL =
  "0xb4ffb01c89ffa24e6d01de95d3d780bc3e835390";

async function getHolders() {
  const response = await axios.get(
    `https://api.geckoterminal.com/api/v2/networks/eth/pools/${POOL}`
  );

  const attr = response.data.data.attributes;

  return {
    holders: Number(attr.holders ?? 0),
  };
}

module.exports = {
  getHolders,
};