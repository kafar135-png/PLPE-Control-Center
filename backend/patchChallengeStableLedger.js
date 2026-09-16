const fs = require("fs");
const path = require("path");

const file =
  path.join(
    __dirname,
    "src",
    "services",
    "challenge.js"
  );

const original =
  fs.readFileSync(
    file,
    "utf8"
  );

const timestamp =
  new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

fs.writeFileSync(
  `${file}.before-stable-ledger-${timestamp}.bak`,
  original,
  "utf8"
);

const pattern =
  /  \/\*\r?\n   \* =======================================================\r?\n   \* 5\. SAVE ONLY DURABLE VERIFIED TX TO LEDGER[\s\S]*?  \/\*\r?\n   \* =======================================================\r?\n   \* 7\. LEADERBOARD/;

if (!pattern.test(original)) {
  console.error(
    "ERROR: Nie znaleziono aktualnego bloku Ledger 5 -> 7."
  );

  process.exit(1);
}

const replacement = `  /*
   * =======================================================
   * 5. SAVE VERIFIED TX PERMANENTLY TO LEDGER
   * =======================================================
   *
   * KAŻDA zweryfikowana transakcja zostaje zapisana.
   *
   * Po zapisaniu:
   *
   * - wallet jest stały
   * - BUY / SELL jest stałe
   * - volume USD jest stałe
   * - source jest stałe
   * - ENTRY jest stałe
   *
   * Refresh strony NIE przelicza starych transakcji.
   *
   * Nowe transakcje są dodawane do Ledgeru,
   * stare pozostają bez zmian.
   */

  if (
    newVerifiedTrades.length > 0
  ) {
    const ledgerInsertRows =
      newVerifiedTrades
        .map(
          (trade) => ({
            phase_id:
              phase.id,

            tx_hash:
              normalizeHash(
                trade.hash
              ),

            wallet:
              normalizeAddress(
                trade.participant
              ),

            trade_type:
              trade.plpeDirection,

            volume_usd:
              Number(
                trade.volumeUsd || 0
              ),

            entry:
              trade.plpeDirection ===
                "BUY" &&
              Number(
                trade.volumeUsd || 0
              ) >=
                MINIMUM_BUY_FOR_ENTRY
                ? 1
                : 0,

            timestamp:
              new Date(
                Number(
                  trade.timestamp
                ) * 1000
              ).toISOString(),

            source:
              trade.volumeSource ||
              "UNKNOWN",

            verified:
              true,
          })
        )
        .filter(
          (row) =>
            row.tx_hash &&
            row.wallet &&
            Number.isFinite(
              row.volume_usd
            ) &&
            row.volume_usd > 0
        );

    if (
      ledgerInsertRows.length > 0
    ) {
      const inserted =
        await insertLedgerTrades(
          ledgerInsertRows
        );

      console.log(
        "[CHALLENGE] Trades permanently saved to Ledger:",
        inserted.length
      );
    }
  }

  /*
   * =======================================================
   * 6. READ FINAL PERSISTENT LEDGER
   * =======================================================
   *
   * Leaderboard powstaje WYŁĄCZNIE z Supabase Ledger.
   *
   * Nie dokładamy żadnych transient/fallback wyników
   * tylko na czas requestu.
   */

  const finalLedgerRows =
    await getLedgerTrades(
      phase.id
    );

  const verifiedTrades =
    finalLedgerRows
      .map(
        ledgerRowToTrade
      )
      .filter(
        (trade) =>
          trade.verified &&
          Number.isFinite(
            Number(
              trade.volumeUsd
            )
          ) &&
          Number(
            trade.volumeUsd
          ) > 0
      )
      .sort(
        (a, b) =>
          Number(
            a.timestamp || 0
          ) -
          Number(
            b.timestamp || 0
          )
      );

  console.log(
    "[CHALLENGE] Stable persistent verified trades:",
    verifiedTrades.length
  );

  /*
   * =======================================================
   * 7. LEADERBOARD`;

const updated =
  original.replace(
    pattern,
    replacement
  );

fs.writeFileSync(
  file,
  updated,
  "utf8"
);

console.log("");
console.log(
  "========================================"
);

console.log(
  "STABLE CHALLENGE LEDGER FIX APPLIED"
);

console.log(
  "========================================"
);
