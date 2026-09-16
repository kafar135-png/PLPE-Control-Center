require("dotenv").config();

const axios = require("axios");

const {
  supabase,
} = require("./src/services/supabase");

const RPC_URL =
  process.env.ETHEREUM_RPC_URL ||
  "https://ethereum-rpc.publicnode.com";

const PHASE_ID =
  "02";

const TARGET_WALLET =
  "0x000000000004444c5dc75cb358380d2e3de08a90"
    .toLowerCase();

const PLPE =
  "0xc34e5ef4f7f5607fbd3e060077cd6e2161ab54c7"
    .toLowerCase();

const WETH =
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    .toLowerCase();

const POOL =
  "0xb4ffb01c89ffa24e6d01de95d3d780bc3e835390"
    .toLowerCase();

const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

function normalizeAddress(
  value
) {
  if (!value) {
    return "";
  }

  return String(
    value
  ).toLowerCase();
}

function topicAddress(
  topic
) {
  if (!topic) {
    return "";
  }

  return (
    "0x" +
    String(
      topic
    ).slice(-40)
  ).toLowerCase();
}

function tokenAmount(
  value
) {
  if (!value) {
    return 0;
  }

  try {
    return (
      Number(
        BigInt(
          value
        )
      ) /
      1e18
    );
  } catch {
    return 0;
  }
}

async function rpc(
  method,
  params
) {
  const response =
    await axios.post(
      RPC_URL,
      {
        jsonrpc:
          "2.0",

        id:
          Date.now(),

        method,

        params,
      },
      {
        timeout:
          20000,

        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );

  if (
    response.data?.error
  ) {
    throw new Error(
      response.data.error
        .message ||
      "RPC ERROR"
    );
  }

  return (
    response.data?.result
  );
}

function parseTransfers(
  receipt
) {
  const result = [];

  for (
    const log of
      receipt?.logs || []
  ) {
    if (
      !Array.isArray(
        log.topics
      ) ||
      log.topics.length <
        3
    ) {
      continue;
    }

    if (
      String(
        log.topics[0]
      ).toLowerCase() !==
      TRANSFER_TOPIC
    ) {
      continue;
    }

    const token =
      normalizeAddress(
        log.address
      );

    if (
      token !== PLPE &&
      token !== WETH
    ) {
      continue;
    }

    result.push({
      token:
        token === PLPE
          ? "PLPE"
          : "WETH",

      from:
        topicAddress(
          log.topics[1]
        ),

      to:
        topicAddress(
          log.topics[2]
        ),

      amount:
        tokenAmount(
          log.data
        ),
    });
  }

  return result;
}

async function main() {
  console.log(
    "=============================================="
  );

  console.log(
    "PLPE CHALLENGE SELL DIAGNOSTICS"
  );

  console.log(
    "=============================================="
  );

  console.log(
    "Phase:",
    PHASE_ID
  );

  console.log(
    "Target:",
    TARGET_WALLET
  );

  console.log("");

  /*
   * LOAD SUSPICIOUS SELL ROWS
   */

  const {
    data,
    error,
  } = await supabase
    .from(
      "challenge_ledger"
    )
    .select("*")
    .eq(
      "phase_id",
      PHASE_ID
    )
    .eq(
      "wallet",
      TARGET_WALLET
    )
    .eq(
      "trade_type",
      "SELL"
    )
    .order(
      "timestamp",
      {
        ascending:
          true,
      }
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  const rows =
    Array.isArray(
      data
    )
      ? data
      : [];

  console.log(
    "SELL rows:",
    rows.length
  );

  console.log("");

  for (
    let i = 0;
    i < rows.length;
    i++
  ) {
    const row =
      rows[i];

    const hash =
      String(
        row.tx_hash
      ).toLowerCase();

    console.log(
      "=================================================="
    );

    console.log(
      `SELL ${i + 1}/${rows.length}`
    );

    console.log(
      "HASH:",
      hash
    );

    console.log(
      "Ledger USD:",
      row.volume_usd
    );

    console.log(
      "Ledger source:",
      row.source
    );

    console.log(
      "Ledger time:",
      row.timestamp
    );

    console.log("");

    const transaction =
      await rpc(
        "eth_getTransactionByHash",
        [
          hash,
        ]
      );

    const receipt =
      await rpc(
        "eth_getTransactionReceipt",
        [
          hash,
        ]
      );

    console.log(
      "TX FROM:",
      normalizeAddress(
        transaction?.from
      )
    );

    console.log(
      "TX TO:",
      normalizeAddress(
        transaction?.to
      )
    );

    console.log(
      "TX VALUE ETH:",
      tokenAmount(
        transaction?.value
      )
    );

    console.log(
      "TX STATUS:",
      receipt?.status
    );

    console.log("");

    const transfers =
      parseTransfers(
        receipt
      );

    console.log(
      "--- PLPE/WETH TRANSFERS ---"
    );

    for (
      const transfer of
        transfers
    ) {
      console.log(
        `${transfer.token}`
      );

      console.log(
        " FROM:",
        transfer.from
      );

      console.log(
        " TO:  ",
        transfer.to
      );

      console.log(
        " AMT: ",
        transfer.amount
      );

      if (
        transfer.from ===
        POOL
      ) {
        console.log(
          " NOTE: FROM PLPE POOL"
        );
      }

      if (
        transfer.to ===
        POOL
      ) {
        console.log(
          " NOTE: TO PLPE POOL"
        );
      }

      console.log("");
    }

    /*
     * CANDIDATE ADDRESSES
     */

    const addresses =
      new Set();

    if (
      transaction?.from
    ) {
      addresses.add(
        normalizeAddress(
          transaction.from
        )
      );
    }

    if (
      transaction?.to
    ) {
      addresses.add(
        normalizeAddress(
          transaction.to
        )
      );
    }

    for (
      const transfer of
        transfers
    ) {
      addresses.add(
        transfer.from
      );

      addresses.add(
        transfer.to
      );
    }

    addresses.delete(
      POOL
    );

    addresses.delete(
      PLPE
    );

    addresses.delete(
      WETH
    );

    addresses.delete(
      "0x0000000000000000000000000000000000000000"
    );

    console.log(
      "--- CANDIDATE ADDRESSES ---"
    );

    for (
      const address of
        addresses
    ) {
      console.log(
        address
      );
    }

    console.log("");
  }

  console.log(
    "=============================================="
  );

  console.log(
    "DIAGNOSTICS COMPLETE"
  );

  console.log(
    "=============================================="
  );
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch(
    (error) => {
      console.error(
        ""
      );

      console.error(
        "DIAGNOSTIC ERROR:"
      );

      console.error(
        error
      );

      process.exit(1);
    }
  );