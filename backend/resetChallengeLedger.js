require("dotenv").config();

const fs = require("fs");
const path = require("path");

const { supabase } = require("./src/services/supabase");

const PHASE_ID = "02";

async function main() {
  console.log("====================================");
  console.log("PLPE CHALLENGE LEDGER RESET");
  console.log("====================================");
  console.log("Phase:", PHASE_ID);
  console.log("");

  /*
   * =======================================================
   * 1. READ CURRENT LEDGER
   * =======================================================
   */

  const {
    data: ledgerRows,
    error: readError,
  } = await supabase
    .from("challenge_ledger")
    .select("*")
    .eq("phase_id", PHASE_ID)
    .order("timestamp", {
      ascending: true,
    });

  if (readError) {
    throw new Error(
      `Ledger read failed: ${readError.message}`
    );
  }

  const rows =
    Array.isArray(ledgerRows)
      ? ledgerRows
      : [];

  console.log(
    "Ledger rows found:",
    rows.length
  );

  /*
   * =======================================================
   * 2. BACKUP
   * =======================================================
   */

  const backupDirectory =
    path.join(
      __dirname,
      "backups"
    );

  if (
    !fs.existsSync(
      backupDirectory
    )
  ) {
    fs.mkdirSync(
      backupDirectory,
      {
        recursive: true,
      }
    );
  }

  const now =
    new Date()
      .toISOString()
      .replace(
        /[:.]/g,
        "-"
      );

  const backupFile =
    path.join(
      backupDirectory,
      `challenge-ledger-phase-${PHASE_ID}-${now}.json`
    );

  fs.writeFileSync(
    backupFile,
    JSON.stringify(
      {
        phaseId:
          PHASE_ID,

        createdAt:
          new Date()
            .toISOString(),

        rows:
          rows.length,

        data:
          rows,
      },
      null,
      2
    ),
    "utf8"
  );

  console.log("");
  console.log(
    "BACKUP CREATED:"
  );

  console.log(
    backupFile
  );

  /*
   * =======================================================
   * 3. VERIFY BACKUP
   * =======================================================
   */

  if (
    !fs.existsSync(
      backupFile
    )
  ) {
    throw new Error(
      "Backup file was not created. RESET CANCELLED."
    );
  }

  const backupStats =
    fs.statSync(
      backupFile
    );

  if (
    backupStats.size <= 0
  ) {
    throw new Error(
      "Backup file is empty. RESET CANCELLED."
    );
  }

  console.log(
    "Backup size:",
    backupStats.size,
    "bytes"
  );

  /*
   * =======================================================
   * 4. DELETE ONLY PHASE 02
   * =======================================================
   */

  console.log("");
  console.log(
    "Deleting Phase 02 Ledger..."
  );

  const {
    error: deleteError,
  } = await supabase
    .from("challenge_ledger")
    .delete()
    .eq(
      "phase_id",
      PHASE_ID
    );

  if (deleteError) {
    throw new Error(
      `Ledger delete failed: ${deleteError.message}`
    );
  }

  /*
   * =======================================================
   * 5. VERIFY RESET
   * =======================================================
   */

  const {
    data: remainingRows,
    error: verifyError,
  } = await supabase
    .from("challenge_ledger")
    .select(
      "tx_hash"
    )
    .eq(
      "phase_id",
      PHASE_ID
    );

  if (verifyError) {
    throw new Error(
      `Ledger verification failed: ${verifyError.message}`
    );
  }

  const remaining =
    Array.isArray(
      remainingRows
    )
      ? remainingRows.length
      : 0;

  console.log("");
  console.log(
    "Phase 02 rows remaining:",
    remaining
  );

  if (
    remaining !== 0
  ) {
    throw new Error(
      "Ledger reset verification failed."
    );
  }

  console.log("");
  console.log(
    "===================================="
  );

  console.log(
    "PHASE 02 LEDGER RESET COMPLETE"
  );

  console.log(
    "Backup preserved."
  );

  console.log(
    "===================================="
  );
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("");
    console.error(
      "RESET ERROR:"
    );

    console.error(
      error
    );

    process.exit(1);
  });