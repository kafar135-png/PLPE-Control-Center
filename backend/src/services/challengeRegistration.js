const crypto = require("crypto");
const { verifyMessage, getAddress } = require("viem");
const { supabase } = require("./supabase");

const PHASE_03_ID = "03";
const PHASE_03_START = "2026-09-26T00:00:00Z";
const PHASE_03_END = "2026-10-26T00:00:00Z"; // exclusive; display end is 25.10 23:59 UTC

function normalizeAddress(value) {
  return String(value || "").trim().toLowerCase();
}

function assertPhase03Open() {
  const now = Date.now();
  if (now < Date.parse(PHASE_03_START) || now >= Date.parse(PHASE_03_END)) {
    throw new Error("Phase #03 registration is not active.");
  }
}

async function isExcludedWallet(wallet) {
  const { data, error } = await supabase
    .from("challenge_excluded_wallets")
    .select("wallet,label,active")
    .eq("wallet", normalizeAddress(wallet))
    .eq("active", true)
    .maybeSingle();
  if (error) throw new Error(`Excluded wallet check failed: ${error.message}`);
  return data || null;
}

async function createRegistrationChallenge(wallet) {
  assertPhase03Open();
  const normalized = normalizeAddress(wallet);
  if (!/^0x[a-f0-9]{40}$/.test(normalized)) throw new Error("Invalid Ethereum wallet.");

  const excluded = await isExcludedWallet(normalized);
  if (excluded) throw new Error("This PLPE operational wallet is not eligible for the Challenge.");

  const { data: existing, error: existingError } = await supabase
    .from("challenge_registrations")
    .select("wallet,registered_at,status")
    .eq("phase_id", PHASE_03_ID)
    .eq("wallet", normalized)
    .eq("status", "active")
    .maybeSingle();
  if (existingError) throw new Error(`Registration check failed: ${existingError.message}`);
  if (existing) return { alreadyRegistered: true, registration: existing };

  const nonce = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const message = [
    "PLPE Monthly Trading Challenge",
    "Phase #03",
    `Wallet: ${normalized}`,
    "I register this wallet for the current Challenge Phase.",
    "One participant may use one participating private wallet per Phase.",
    `Nonce: ${nonce}`,
  ].join("\n");

  const { error } = await supabase.from("challenge_registration_nonces").upsert({
    phase_id: PHASE_03_ID,
    wallet: normalized,
    nonce,
    message,
    expires_at: expiresAt,
    used_at: null,
  }, { onConflict: "phase_id,wallet" });
  if (error) throw new Error(`Nonce save failed: ${error.message}`);

  return { alreadyRegistered: false, phaseId: PHASE_03_ID, wallet: normalized, message, expiresAt };
}

async function registerWallet({ wallet, signature }) {
  assertPhase03Open();
  const normalized = normalizeAddress(wallet);
  if (!/^0x[a-f0-9]{40}$/.test(normalized)) throw new Error("Invalid Ethereum wallet.");
  if (!signature) throw new Error("Missing wallet signature.");

  const excluded = await isExcludedWallet(normalized);
  if (excluded) throw new Error("This PLPE operational wallet is not eligible for the Challenge.");

  const { data: nonceRow, error: nonceError } = await supabase
    .from("challenge_registration_nonces")
    .select("*")
    .eq("phase_id", PHASE_03_ID)
    .eq("wallet", normalized)
    .maybeSingle();
  if (nonceError) throw new Error(`Nonce read failed: ${nonceError.message}`);
  if (!nonceRow || nonceRow.used_at) throw new Error("Registration challenge is missing or already used.");
  if (Date.parse(nonceRow.expires_at) <= Date.now()) throw new Error("Registration challenge expired. Please try again.");

  const valid = await verifyMessage({
    address: getAddress(normalized),
    message: nonceRow.message,
    signature,
  });
  if (!valid) throw new Error("Wallet signature verification failed.");

  const registeredAt = new Date().toISOString();
  const { data, error } = await supabase.from("challenge_registrations").upsert({
    phase_id: PHASE_03_ID,
    wallet: normalized,
    registered_at: registeredAt,
    status: "active",
  }, { onConflict: "phase_id,wallet" }).select().single();
  if (error) throw new Error(`Registration save failed: ${error.message}`);

  await supabase.from("challenge_registration_nonces")
    .update({ used_at: registeredAt })
    .eq("phase_id", PHASE_03_ID)
    .eq("wallet", normalized);

  return data;
}

async function getRegistrationStatus(wallet) {
  const normalized = normalizeAddress(wallet);
  if (!/^0x[a-f0-9]{40}$/.test(normalized)) return { registered: false };
  const excluded = await isExcludedWallet(normalized);
  if (excluded) return { registered: false, excluded: true, label: excluded.label };

  const { data, error } = await supabase.from("challenge_registrations")
    .select("wallet,phase_id,registered_at,status")
    .eq("phase_id", PHASE_03_ID)
    .eq("wallet", normalized)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw new Error(`Registration status failed: ${error.message}`);
  return { registered: Boolean(data), registration: data || null };
}

async function getActiveRegistrations(phaseId) {
  if (String(phaseId) !== PHASE_03_ID) return [];
  const { data, error } = await supabase.from("challenge_registrations")
    .select("wallet,registered_at,status")
    .eq("phase_id", PHASE_03_ID)
    .eq("status", "active");
  if (error) throw new Error(`Registration list failed: ${error.message}`);
  return data || [];
}

module.exports = { createRegistrationChallenge, registerWallet, getRegistrationStatus, getActiveRegistrations };
