const { supabase } = require("./supabase");
const { normalizeWalletAddress } = require("./gameAuth");

const CLASS_BASE_STATS = {
  warrior: { hp: 110, attack: 21, defense: 18, speed: 18 },
  ranger: { hp: 100, attack: 21, defense: 14, speed: 23 },
  mage: { hp: 100, attack: 21, defense: 14, speed: 22 },
};

const PRESENCE_TIMEOUT_SECONDS = Math.max(
  30,
  Number(process.env.GAME_PRESENCE_TIMEOUT_SECONDS || 75)
);

function toPublicPlayer(row) {
  if (!row) return null;

  const battles = Number(row.pvp_battles || 0);
  const wins = Number(row.wins || 0);

  return {
    walletAddress: row.wallet_address,
    nickname: row.nickname || null,
    specialization: row.specialization || null,
    level: Number(row.level || 1),
    xp: Number(row.xp || 0),
    hp: Number(row.hp || 100),
    attack: Number(row.attack || 20),
    defense: Number(row.defense || 15),
    speed: Number(row.speed || 20),
    rating: Number(row.rating || 1000),
    highestRating: Number(row.highest_rating || row.rating || 1000),
    wins,
    losses: Number(row.losses || 0),
    pvpBattles: battles,
    winRate: battles > 0 ? Number(((wins / battles) * 100).toFixed(1)) : 0,
    currentWinStreak: Number(row.current_win_streak || 0),
    bestWinStreak: Number(row.best_win_streak || 0),
    damageDealt: Number(row.damage_dealt || 0),
    damageReceived: Number(row.damage_received || 0),
    healingDone: Number(row.healing_done || 0),
    blocks: Number(row.blocks || 0),
    spiritUses: Number(row.spirit_uses || 0),
    presenceStatus: row.presence_status || "offline",
    lastSeen: row.last_seen || null,
    createdAt: row.created_at || null,
  };
}

async function getPlayer(walletAddressInput) {
  const walletAddress = normalizeWalletAddress(walletAddressInput);

  if (!walletAddress) {
    const error = new Error("Invalid wallet address");
    error.statusCode = 400;
    throw error;
  }

  const { data, error } = await supabase
    .from("game_players")
    .select("*")
    .eq("wallet_address", walletAddress)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load player: ${error.message}`);
  }

  if (!data) {
    const notFound = new Error("Player profile not found");
    notFound.statusCode = 404;
    throw notFound;
  }

  return toPublicPlayer(data);
}

function validateNickname(value) {
  if (typeof value !== "string") return null;

  const nickname = value.trim();

  if (nickname.length < 3 || nickname.length > 20) {
    return null;
  }

  if (!/^[\p{L}\p{N}_-]+$/u.test(nickname)) {
    return null;
  }

  return nickname;
}

async function updateNickname(walletAddressInput, nicknameInput) {
  const walletAddress = normalizeWalletAddress(walletAddressInput);
  const nickname = validateNickname(nicknameInput);

  if (!walletAddress) {
    const error = new Error("Invalid wallet address");
    error.statusCode = 400;
    throw error;
  }

  if (!nickname) {
    const error = new Error(
      "Nickname must be 3-20 characters and use letters, numbers, _ or -"
    );
    error.statusCode = 400;
    throw error;
  }

  const { data, error } = await supabase
    .from("game_players")
    .update({
      nickname,
      nickname_key: nickname.toLocaleLowerCase("en-US"),
      updated_at: new Date().toISOString(),
    })
    .eq("wallet_address", walletAddress)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      const conflict = new Error("Nickname is already taken");
      conflict.statusCode = 409;
      throw conflict;
    }

    throw new Error(`Unable to update nickname: ${error.message}`);
  }

  return toPublicPlayer(data);
}


function validateSpecialization(value) {
  return ["warrior", "ranger", "mage"].includes(value) ? value : null;
}

async function updateSpecialization(walletAddressInput, specializationInput) {
  const walletAddress = normalizeWalletAddress(walletAddressInput);
  const specialization = validateSpecialization(specializationInput);
  if (!walletAddress) { const error = new Error("Invalid wallet address"); error.statusCode = 400; throw error; }
  if (!specialization) { const error = new Error("Invalid specialization"); error.statusCode = 400; throw error; }

  const { data: current, error: readError } = await supabase
    .from("game_players")
    .select("specialization")
    .eq("wallet_address", walletAddress)
    .single();
  if (readError) throw new Error(`Unable to load specialization: ${readError.message}`);
  if (current?.specialization && current.specialization !== specialization) {
    const error = new Error("Specialization is already selected");
    error.statusCode = 409;
    throw error;
  }

  const initialStats = current?.specialization ? {} : CLASS_BASE_STATS[specialization];
  const { data, error } = await supabase
    .from("game_players")
    .update({ specialization, ...initialStats, updated_at: new Date().toISOString() })
    .eq("wallet_address", walletAddress)
    .select("*")
    .single();
  if (error) throw new Error(`Unable to update specialization: ${error.message}`);
  return toPublicPlayer(data);
}

function clampInteger(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

async function updateProgression(walletAddressInput, payload = {}) {
  const walletAddress = normalizeWalletAddress(walletAddressInput);
  if (!walletAddress) { const error = new Error("Invalid wallet address"); error.statusCode = 400; throw error; }

  const { data: current, error: readError } = await supabase
    .from("game_players")
    .select("specialization,level,xp,hp,attack,defense,speed")
    .eq("wallet_address", walletAddress)
    .single();
  if (readError) throw new Error(`Unable to load progression: ${readError.message}`);

  const specialization = validateSpecialization(current?.specialization);
  if (!specialization) { const error = new Error("Choose a specialization before syncing progression"); error.statusCode = 409; throw error; }

  const level = clampInteger(payload.level, 1, 100, Number(current.level || 1));
  const xp = clampInteger(payload.xp, 0, 100000000, Number(current.xp || 0));
  const base = CLASS_BASE_STATS[specialization];
  const requested = {
    hp: clampInteger(payload.hp, base.hp, 1500, Number(current.hp || base.hp)),
    attack: clampInteger(payload.attack, base.attack, 500, Number(current.attack || base.attack)),
    defense: clampInteger(payload.defense, base.defense, 500, Number(current.defense || base.defense)),
    speed: clampInteger(payload.speed, base.speed, 500, Number(current.speed || base.speed)),
  };

  // Every character level grants at most one spendable stat point in the current
  // progression system: +10 HP or +2 to attack/defense/speed. Reject impossible
  // stat combinations instead of trusting arbitrary values from browser devtools.
  const spentPoints =
    Math.max(0, requested.hp - base.hp) / 10 +
    Math.max(0, requested.attack - base.attack) / 2 +
    Math.max(0, requested.defense - base.defense) / 2 +
    Math.max(0, requested.speed - base.speed) / 2;
  const allowedPoints = Math.max(0, level - 1);
  if (spentPoints > allowedPoints + 0.001) {
    const error = new Error("Progression stats exceed the available level budget");
    error.statusCode = 409;
    throw error;
  }

  const next = {
    level, xp,
    hp: requested.hp, attack: requested.attack, defense: requested.defense, speed: requested.speed,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("game_players")
    .update(next)
    .eq("wallet_address", walletAddress)
    .select("*")
    .single();
  if (error) throw new Error(`Unable to sync progression: ${error.message}`);
  return toPublicPlayer(data);
}
async function heartbeat(walletAddressInput, statusInput = "online") {
  const walletAddress = normalizeWalletAddress(walletAddressInput);
  const allowed = new Set(["online", "in_battle"]);
  const presenceStatus = allowed.has(statusInput) ? statusInput : "online";
  const now = new Date().toISOString();

  if (!walletAddress) {
    const error = new Error("Invalid wallet address");
    error.statusCode = 400;
    throw error;
  }

  const { data, error } = await supabase
    .from("game_players")
    .update({
      presence_status: presenceStatus,
      last_seen: now,
      updated_at: now,
    })
    .eq("wallet_address", walletAddress)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to update player presence: ${error.message}`);
  }

  const onlinePlayers = await listOnlinePlayers();

  return {
    player: toPublicPlayer(data),
    online: onlinePlayers.length,
  };
}

async function setOffline(walletAddressInput) {
  const walletAddress = normalizeWalletAddress(walletAddressInput);

  if (!walletAddress) return;

  const { error } = await supabase
    .from("game_players")
    .update({
      presence_status: "offline",
      updated_at: new Date().toISOString(),
    })
    .eq("wallet_address", walletAddress);

  if (error) {
    console.warn("[GAME PRESENCE] Unable to set offline:", error.message);
  }
}

async function listOnlinePlayers() {
  const cutoff = new Date(
    Date.now() - PRESENCE_TIMEOUT_SECONDS * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("game_players")
    .select("*")
    .gte("last_seen", cutoff)
    .in("presence_status", ["online", "in_battle"])
    .order("rating", { ascending: false })
    .order("last_seen", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Unable to load online players: ${error.message}`);
  }

  return (data || []).map(toPublicPlayer);
}

async function getRanking(limitInput = 50) {
  const limit = Math.min(100, Math.max(1, Number(limitInput || 50)));

  const { data, error } = await supabase
    .from("game_players")
    .select("*")
    .order("rating", { ascending: false })
    .order("wins", { ascending: false })
    .order("pvp_battles", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to load ranking: ${error.message}`);
  }

  return (data || []).map((row, index) => ({
    rank: index + 1,
    ...toPublicPlayer(row),
  }));
}

module.exports = {
  PRESENCE_TIMEOUT_SECONDS,
  toPublicPlayer,
  getPlayer,
  updateNickname,
  updateSpecialization,
  updateProgression,
  heartbeat,
  setOffline,
  listOnlinePlayers,
  getRanking,
};
