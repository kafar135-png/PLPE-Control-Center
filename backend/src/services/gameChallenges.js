const { supabase } = require("./supabase");
const { normalizeWalletAddress } = require("./gameAuth");
const {
  PRESENCE_TIMEOUT_SECONDS,
  toPublicPlayer,
} = require("./gamePlayers");
const { createActiveMatch, getBattleMatch } = require("./gameBattle");

const CHALLENGE_TIMEOUT_SECONDS = Math.max(
  30,
  Number(process.env.GAME_CHALLENGE_TIMEOUT_SECONDS || 120)
);

function challengeDto(row) {
  if (!row) return null;

  return {
    id: row.id,
    challengerWallet: row.challenger_wallet,
    challengedWallet: row.challenged_wallet,
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    respondedAt: row.responded_at || null,
    matchId: row.match_id || null,
  };
}

async function expireStaleChallenges() {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("game_challenges")
    .update({
      status: "expired",
      responded_at: now,
    })
    .eq("status", "pending")
    .lt("expires_at", now);

  if (error) {
    console.warn("[GAME CHALLENGE] Expire cleanup failed:", error.message);
  }
}

async function ensureTargetCanBeChallenged(targetWallet) {
  const cutoff = new Date(
    Date.now() - PRESENCE_TIMEOUT_SECONDS * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("game_players")
    .select("*")
    .eq("wallet_address", targetWallet)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load challenged player: ${error.message}`);
  }

  if (!data) {
    const notFound = new Error("Player not found");
    notFound.statusCode = 404;
    throw notFound;
  }

  if (
    !data.last_seen ||
    new Date(data.last_seen).getTime() < new Date(cutoff).getTime() ||
    data.presence_status !== "online"
  ) {
    const unavailable = new Error("Player is no longer available for a duel");
    unavailable.statusCode = 409;
    throw unavailable;
  }

  return data;
}

async function sendChallenge(challengerWalletInput, challengedWalletInput) {
  const challengerWallet = normalizeWalletAddress(challengerWalletInput);
  const challengedWallet = normalizeWalletAddress(challengedWalletInput);

  if (!challengerWallet || !challengedWallet) {
    const error = new Error("Invalid player wallet address");
    error.statusCode = 400;
    throw error;
  }

  if (challengerWallet === challengedWallet) {
    const error = new Error("You cannot challenge yourself");
    error.statusCode = 400;
    throw error;
  }

  await expireStaleChallenges();
  await ensureTargetCanBeChallenged(challengedWallet);

  const now = new Date().toISOString();

  const { data: duplicates, error: duplicateError } = await supabase
    .from("game_challenges")
    .select("id")
    .eq("status", "pending")
    .gt("expires_at", now)
    .or(
      `and(challenger_wallet.eq.${challengerWallet},challenged_wallet.eq.${challengedWallet}),and(challenger_wallet.eq.${challengedWallet},challenged_wallet.eq.${challengerWallet})`
    )
    .limit(1);

  if (duplicateError) {
    throw new Error(`Unable to check pending challenges: ${duplicateError.message}`);
  }

  if ((duplicates || []).length > 0) {
    const conflict = new Error("A pending challenge already exists between these players");
    conflict.statusCode = 409;
    throw conflict;
  }

  const expiresAt = new Date(
    Date.now() + CHALLENGE_TIMEOUT_SECONDS * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("game_challenges")
    .insert({
      challenger_wallet: challengerWallet,
      challenged_wallet: challengedWallet,
      status: "pending",
      expires_at: expiresAt,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create challenge: ${error.message}`);
  }

  return challengeDto(data);
}

async function listChallenges(walletAddressInput) {
  const walletAddress = normalizeWalletAddress(walletAddressInput);

  if (!walletAddress) {
    const error = new Error("Invalid wallet address");
    error.statusCode = 400;
    throw error;
  }

  await expireStaleChallenges();

  const { data, error } = await supabase
    .from("game_challenges")
    .select("*")
    .eq("status", "pending")
    .or(
      `challenger_wallet.eq.${walletAddress},challenged_wallet.eq.${walletAddress}`
    )
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    throw new Error(`Unable to load challenges: ${error.message}`);
  }

  const rows = data || [];

  return {
    incoming: rows
      .filter((row) => row.challenged_wallet === walletAddress)
      .map(challengeDto),
    outgoing: rows
      .filter((row) => row.challenger_wallet === walletAddress)
      .map(challengeDto),
  };
}

async function getPlayersByWallets(wallets) {
  const unique = [...new Set(wallets.filter(Boolean))];

  if (unique.length === 0) return {};

  const { data, error } = await supabase
    .from("game_players")
    .select("*")
    .in("wallet_address", unique);

  if (error) {
    throw new Error(`Unable to load challenge players: ${error.message}`);
  }

  return Object.fromEntries(
    (data || []).map((row) => [row.wallet_address, toPublicPlayer(row)])
  );
}

async function listChallengesWithPlayers(walletAddressInput) {
  const result = await listChallenges(walletAddressInput);
  const wallets = [
    ...result.incoming.flatMap((item) => [
      item.challengerWallet,
      item.challengedWallet,
    ]),
    ...result.outgoing.flatMap((item) => [
      item.challengerWallet,
      item.challengedWallet,
    ]),
  ];
  const players = await getPlayersByWallets(wallets);

  const enrich = (item) => ({
    ...item,
    challenger: players[item.challengerWallet] || null,
    challenged: players[item.challengedWallet] || null,
  });

  return {
    incoming: result.incoming.map(enrich),
    outgoing: result.outgoing.map(enrich),
  };
}

async function respondToChallenge(walletAddressInput, challengeId, action) {
  const walletAddress = normalizeWalletAddress(walletAddressInput);

  if (!walletAddress) {
    const error = new Error("Invalid wallet address");
    error.statusCode = 400;
    throw error;
  }

  if (!challengeId || typeof challengeId !== "string") {
    const error = new Error("challengeId is required");
    error.statusCode = 400;
    throw error;
  }

  if (!new Set(["accept", "decline"]).has(action)) {
    const error = new Error("Action must be accept or decline");
    error.statusCode = 400;
    throw error;
  }

  await expireStaleChallenges();

  const { data: challenge, error: challengeError } = await supabase
    .from("game_challenges")
    .select("*")
    .eq("id", challengeId)
    .maybeSingle();

  if (challengeError) {
    throw new Error(`Unable to load challenge: ${challengeError.message}`);
  }

  if (!challenge) {
    const notFound = new Error("Challenge not found");
    notFound.statusCode = 404;
    throw notFound;
  }

  if (challenge.challenged_wallet !== walletAddress) {
    const forbidden = new Error("Only the challenged player can respond");
    forbidden.statusCode = 403;
    throw forbidden;
  }

  if (challenge.status !== "pending") {
    const conflict = new Error(`Challenge is already ${challenge.status}`);
    conflict.statusCode = 409;
    throw conflict;
  }

  if (new Date(challenge.expires_at).getTime() <= Date.now()) {
    const expired = new Error("Challenge expired");
    expired.statusCode = 409;
    throw expired;
  }

  const respondedAt = new Date().toISOString();

  if (action === "decline") {
    const { data, error } = await supabase
      .from("game_challenges")
      .update({
        status: "declined",
        responded_at: respondedAt,
      })
      .eq("id", challenge.id)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Unable to decline challenge: ${error.message}`);
    }

    return {
      challenge: challengeDto(data),
      match: null,
    };
  }

  const { data: players, error: playersError } = await supabase
    .from("game_players")
    .select("wallet_address,rating")
    .in("wallet_address", [
      challenge.challenger_wallet,
      challenge.challenged_wallet,
    ]);

  if (playersError) {
    throw new Error(`Unable to load player ratings: ${playersError.message}`);
  }

  const ratingByWallet = Object.fromEntries(
    (players || []).map((player) => [
      player.wallet_address,
      Number(player.rating || 1000),
    ])
  );

  const match = await createActiveMatch(
    challenge.challenger_wallet,
    challenge.challenged_wallet,
    ratingByWallet
  );

  const { data: updatedChallenge, error: updateError } = await supabase
    .from("game_challenges")
    .update({
      status: "accepted",
      responded_at: respondedAt,
      match_id: match.id,
    })
    .eq("id", challenge.id)
    .eq("status", "pending")
    .select("*")
    .single();

  if (updateError) {
    await supabase
      .from("game_matches")
      .delete()
      .eq("id", match.id);

    throw new Error(`Unable to accept challenge: ${updateError.message}`);
  }

  await supabase
    .from("game_players")
    .update({
      presence_status: "in_battle",
      updated_at: respondedAt,
    })
    .in("wallet_address", [
      challenge.challenger_wallet,
      challenge.challenged_wallet,
    ]);

  return {
    challenge: challengeDto(updatedChallenge),
    match: {
      id: match.id,
      status: match.status,
      playerAWallet: match.player_a_wallet,
      playerBWallet: match.player_b_wallet,
      createdAt: match.created_at,
    },
  };
}

async function getMatchForPlayer(walletAddressInput, matchId) {
  return getBattleMatch(walletAddressInput, matchId);
}

module.exports = {
  CHALLENGE_TIMEOUT_SECONDS,
  sendChallenge,
  listChallengesWithPlayers,
  respondToChallenge,
  getMatchForPlayer,
};
