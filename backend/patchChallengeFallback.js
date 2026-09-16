const fs = require("fs");
const path = require("path");

const challengePath =
  path.join(
    __dirname,
    "src",
    "services",
    "challenge.js"
  );

const original =
  fs.readFileSync(
    challengePath,
    "utf8"
  );

const timestamp =
  new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

const backupPath =
  `${challengePath}.before-fallback-fix-${timestamp}.bak`;

fs.writeFileSync(
  backupPath,
  original,
  "utf8"
);

const pattern =
  /  \/\*\r?\n   \* =======================================================\r?\n   \* 5\. SAVE NEW VERIFIED TX TO LEDGER[\s\S]*?  \/\*\r?\n   \* =======================================================\r?\n   \* 7\. LEADERBOARD/;

if (!pattern.test(original)) {
  console.error(
    "ERROR: Nie znaleziono bloku Ledger 5 -> 7."
  );

  console.error(
    "challenge.js NIE zostal zmieniony."
  );

  process.exit(1);
}

const replacement = `  /*
   * =======================================================
   * 5. SAVE ONLY DURABLE VERIFIED TX TO LEDGER
   * =======================================================
   *
   * Do persistent Ledger zapisujemy tylko:
   *
   * - GECKOTERMINAL_TRADE
   * - GECKOTERMINAL_OHLCV
   *
   * WETH_FALLBACK NIE jest zapisywany na stale.
   *
   * Dzięki temu chwilowa awaria Gecko/Historical WETH
   * nie zamraża przybliżonej wartości USD w Ledgerze.
   *
   * Fallback może być użyty tymczasowo w aktualnym
   * leaderboardzie, ale TX zostanie ponownie sprawdzony
   * przy następnym przeliczeniu.
   */

  const persistentTrades =
    newVerifiedTrades.filter(
      (trade) =>
        trade.volumeSource ===
          "GECKOTERMINAL_TRADE" ||
        trade.volumeSource ===
          "GECKOTERMINAL_OHLCV"
    );

  const transientTrades =
    newVerifiedTrades.filter(
      (trade) =>
        trade.volumeSource ===
          "WETH_FALLBACK"
    );

  console.log(
    "[CHALLENGE] Durable trades:",
    persistentTrades.length
  );

  console.log(
    "[CHALLENGE] Transient WETH fallback trades:",
    transientTrades.length
  );

  if (
    persistentTrades.length > 0
  ) {
    const ledgerInsertRows =
      persistentTrades
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
              trade.volumeSource,

            verified:
              true,
          })
        )
        .filter(
          (row) =>
            row.tx_hash &&
            row.wallet &&
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
        "[CHALLENGE] Durable trades saved to Ledger:",
        inserted.length
      );
    }
  }

  /*
   * =======================================================
   * 6. READ LEDGER AGAIN + ADD TRANSIENT FALLBACKS
   * =======================================================
   *
   * Persistent TX bierzemy z Supabase.
   *
   * WETH_FALLBACK dodajemy tylko do wyniku bieżącego
   * requestu. Nie zapisujemy go do Supabase.
   */

  const finalLedgerRows =
    await getLedgerTrades(
      phase.id
    );

  const verifiedTradesMap =
    new Map();

  for (
    const row of
      finalLedgerRows
  ) {
    const trade =
      ledgerRowToTrade(
        row
      );

    if (
      !trade.verified ||
      !Number.isFinite(
        Number(
          trade.volumeUsd
        )
      ) ||
      Number(
        trade.volumeUsd
      ) <= 0
    ) {
      continue;
    }

    const hash =
      normalizeHash(
        trade.hash
      );

    if (!hash) {
      continue;
    }

    verifiedTradesMap.set(
      hash,
      trade
    );
  }

  /*
   * Dodajemy fallback tylko do aktualnego wyniku.
   * Nie może nadpisać lepszego rekordu z Ledgeru.
   */

  for (
    const trade of
      transientTrades
  ) {
    if (
      !trade.verified ||
      !Number.isFinite(
        Number(
          trade.volumeUsd
        )
      ) ||
      Number(
        trade.volumeUsd
      ) <= 0
    ) {
      continue;
    }

    const hash =
      normalizeHash(
        trade.hash
      );

    if (
      !hash ||
      verifiedTradesMap.has(
        hash
      )
    ) {
      continue;
    }

    verifiedTradesMap.set(
      hash,
      trade
    );
  }

  const verifiedTrades =
    Array.from(
      verifiedTradesMap.values()
    ).sort(
      (a, b) =>
        Number(
          a.timestamp || 0
        ) -
        Number(
          b.timestamp || 0
        )
    );

  console.log(
    "[CHALLENGE] Persistent Ledger trades:",
    finalLedgerRows.length
  );

  console.log(
    "[CHALLENGE] Current verified trades including transient:",
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
  challengePath,
  updated,
  "utf8"
);

console.log("");
console.log(
  "========================================"
);

console.log(
  "CHALLENGE FALLBACK FIX APPLIED"
);

console.log(
  "Backup:"
);

console.log(
  backupPath
);

console.log(
  "========================================"
);
