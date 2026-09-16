const { supabase } = require("./supabase");

async function getLedgerTrades(phaseId) {
  const { data, error } = await supabase
    .from("challenge_ledger")
    .select("*")
    .eq("phase_id", phaseId)
    .order("timestamp", { ascending: true });

  if (error) {
    throw new Error(`Ledger read error: ${error.message}`);
  }

  return data || [];
}

async function getLedgerHashes(phaseId) {
  const { data, error } = await supabase
    .from("challenge_ledger")
    .select("tx_hash")
    .eq("phase_id", phaseId);

  if (error) {
    throw new Error(`Ledger hash read error: ${error.message}`);
  }

  return new Set((data || []).map((row) => row.tx_hash));
}

async function insertLedgerTrades(rows) {
  if (!rows || rows.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("challenge_ledger")
    .upsert(rows, {
      onConflict: "phase_id,tx_hash",
      ignoreDuplicates: true,
    })
    .select();

  if (error) {
    throw new Error(`Ledger insert error: ${error.message}`);
  }

  return data || [];
}

module.exports = {
  getLedgerTrades,
  getLedgerHashes,
  insertLedgerTrades,
};
