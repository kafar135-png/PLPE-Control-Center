const { supabase } = require("./supabase");
const { normalizeWalletAddress } = require("./gameAuth");

function safeClass(value) {
  return ["warrior", "ranger", "mage"].includes(value) ? value : "warrior";
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function playerState(row) {
  const specialization = safeClass(row.specialization);
  // `hp` already includes the specialization bonus synchronized from progression.
  // Do not add a second class bonus here or PvP would double-buff classes.
  const maxHp = clamp(Number(row.hp || 100), 60, 1800);
  return {
    wallet: row.wallet_address,
    nickname: row.nickname || "PLPE Player",
    specialization,
    level: Number(row.level || 1),
    maxHp,
    hp: maxHp,
    attack: clamp(Number(row.attack || 20), 5, 500),
    defense: clamp(Number(row.defense || 15), 5, 500),
    speed: clamp(Number(row.speed || 20), 5, 500),
    spirit: 0,
    shield: 0,
    defend: false,
    stunTurns: 0,
    bleedTurns: 0,
    bleedDamage: 0,
    skillCooldown: 0,
  };
}

function firstTurn(a, b) {
  if (a.speed !== b.speed) return a.speed > b.speed ? a.wallet : b.wallet;
  return a.wallet.localeCompare(b.wallet) <= 0 ? a.wallet : b.wallet;
}

function createBattleState(playerA, playerB) {
  const a = playerState(playerA);
  const b = playerState(playerB);
  return {
    round: 1,
    turnWallet: firstTurn(a, b),
    players: { [a.wallet]: a, [b.wallet]: b },
    metrics: {
      [a.wallet]: { damageDealt: 0, damageReceived: 0, blocks: 0, spiritUses: 0 },
      [b.wallet]: { damageDealt: 0, damageReceived: 0, blocks: 0, spiritUses: 0 },
    },
    log: [{ at: new Date().toISOString(), text: `Pojedynek rozpoczęty: ${a.nickname} vs ${b.nickname}.` }],
  };
}

function otherWallet(state, wallet) {
  return Object.keys(state.players).find((item) => item !== wallet) || null;
}

function effectiveDefense(target, magic = false, piercing = false) {
  if (piercing) return target.defense * 0.35;
  if (magic) {
    // Warrior keeps a small anti-magic advantage so Mage is a soft counter,
    // not an automatic win. Other classes are more exposed to spell damage.
    return target.defense * (target.specialization === "warrior" ? 0.55 : 0.45);
  }
  return target.defense;
}

function calculateDamage(actor, target, multiplier = 1, options = {}) {
  const defense = effectiveDefense(target, options.magic, options.piercing);
  let damage = Math.max(1, Math.round(actor.attack * multiplier - defense * 0.55));

  if (target.defend) {
    const guardMultiplier = options.magic ? 0.72 : options.piercing ? 0.75 : 0.55;
    damage = Math.max(1, Math.round(damage * guardMultiplier));
  }

  if (target.shield > 0) {
    const shieldFactor = options.magic
      ? (target.specialization === "warrior" ? 0.55 : 0.45)
      : options.piercing
        ? 0.25
        : 1;
    damage = Math.max(1, damage - Math.round(target.shield * shieldFactor));
  }

  return damage;
}

function pushLog(state, text) {
  state.log = [...(state.log || []), { at: new Date().toISOString(), text }].slice(-60);
}

function damageTarget(state, actor, target, damage) {
  target.hp = Math.max(0, target.hp - damage);
  if (state.metrics?.[actor.wallet]) state.metrics[actor.wallet].damageDealt += damage;
  if (state.metrics?.[target.wallet]) state.metrics[target.wallet].damageReceived += damage;
  actor.spirit = clamp(actor.spirit + 28, 0, 100);
  target.spirit = clamp(target.spirit + 18, 0, 100);
  target.defend = false;
  target.shield = Math.max(0, target.shield - 2);
  return target.hp <= 0;
}

function beginTurn(state, wallet) {
  const player = state.players[wallet];
  if (!player) return { defeated: false, skipped: false };
  player.skillCooldown = Math.max(0, Number(player.skillCooldown || 0) - 1);
  if (player.bleedTurns > 0) {
    player.hp = Math.max(0, player.hp - player.bleedDamage);
    player.bleedTurns -= 1;
    pushLog(state, `${player.nickname} otrzymuje ${player.bleedDamage} obrażeń od krwawienia.`);
    if (player.hp <= 0) return { defeated: true, skipped: false };
  }
  if (player.stunTurns > 0) {
    player.stunTurns -= 1;
    pushLog(state, `${player.nickname} jest unieruchomiony i traci ruch.`);
    return { defeated: false, skipped: true };
  }
  return { defeated: false, skipped: false };
}

function advanceTurn(state, actorWallet) {
  let nextWallet = otherWallet(state, actorWallet);
  if (!nextWallet) return null;

  const start = beginTurn(state, nextWallet);
  if (start.defeated) {
    state.turnWallet = actorWallet;
    return { winnerWallet: actorWallet, loserWallet: nextWallet };
  }

  if (start.skipped) {
    state.round += 1;
    const skippedWallet = nextWallet;
    nextWallet = actorWallet;
    const actorStart = beginTurn(state, nextWallet);
    if (actorStart.defeated) {
      state.turnWallet = skippedWallet;
      return { winnerWallet: skippedWallet, loserWallet: actorWallet };
    }
  } else if (nextWallet === Object.keys(state.players)[0]) {
    state.round += 1;
  }

  state.turnWallet = nextWallet;
  return null;
}

function applyAction(stateInput, actorWallet, actionInput) {
  const state = JSON.parse(JSON.stringify(stateInput));
  const actor = state.players[actorWallet];
  const targetWallet = otherWallet(state, actorWallet);
  const target = targetWallet ? state.players[targetWallet] : null;
  const type = actionInput?.type;
  if (!actor || !target) throw Object.assign(new Error("Invalid PvP battle state"), { statusCode: 409 });
  if (state.turnWallet !== actorWallet) throw Object.assign(new Error("It is not your turn"), { statusCode: 409 });
  if (actor.hp <= 0 || target.hp <= 0) throw Object.assign(new Error("Match is already finished"), { statusCode: 409 });

  let damage = 0;
  let winnerWallet = null;
  if (type === "defend") {
    actor.defend = true;
    actor.shield = Math.max(actor.shield, 5 + Math.floor(actor.defense * 0.12));
    if (state.metrics?.[actor.wallet]) state.metrics[actor.wallet].blocks += 1;
    actor.spirit = clamp(actor.spirit + 12, 0, 100);
    pushLog(state, `${actor.nickname} przyjmuje pozycję obronną.`);
  } else if (type === "attack") {
    const magic = actor.specialization === "mage";
    const multiplier = actor.specialization === "warrior" ? 1.04 : actor.specialization === "ranger" ? 1.05 : 1.00;
    damage = calculateDamage(actor, target, multiplier, { magic });
    if (damageTarget(state, actor, target, damage)) winnerWallet = actorWallet;
    pushLog(state, `${actor.nickname} atakuje za ${damage}.`);
  } else if (type === "skill") {
    if (actor.level < 2) throw Object.assign(new Error("Class skill unlocks at level 2"), { statusCode: 409 });
    if (Number(actor.skillCooldown || 0) > 0) throw Object.assign(new Error(`Class skill cooldown: ${actor.skillCooldown}`), { statusCode: 409 });
    if (actor.specialization === "warrior") {
      // Shield Wall trades one offensive turn for survival, cleanses Ranger
      // bleed and accelerates Spirit. It is deliberately defensive in 1v1.
      actor.shield = Math.max(actor.shield, 6 + actor.level);
      actor.defend = false;
      actor.bleedTurns = 0;
      actor.bleedDamage = 0;
      actor.spirit = clamp(actor.spirit + 18, 0, 100);
      actor.skillCooldown = 4;
      pushLog(state, `${actor.nickname} używa Muru Tarczy i oczyszcza krwawienie.`);
    } else if (actor.specialization === "ranger") {
      damage = calculateDamage(actor, target, 1.00, { piercing: true });
      target.bleedTurns = Math.max(target.bleedTurns, 2);
      target.bleedDamage = Math.max(target.bleedDamage, 2);
      actor.skillCooldown = 3;
      if (damageTarget(state, actor, target, damage)) winnerWallet = actorWallet;
      pushLog(state, `${actor.nickname} trafia Przebijającym Bełtem za ${damage}.`);
    } else {
      // Runic Frost is setup/control rather than a second full attack. The
      // spell still chips a little HP, then denies one enemy action.
      damage = calculateDamage(actor, target, 0.35, { magic: true });
      target.stunTurns = Math.max(target.stunTurns, 1);
      actor.skillCooldown = 5;
      if (damageTarget(state, actor, target, damage)) winnerWallet = actorWallet;
      pushLog(state, `${actor.nickname} używa Runicznego Mrozu za ${damage} i zamraża przeciwnika.`);
    }
  } else if (type === "spirit") {
    if (actor.level < 4) throw Object.assign(new Error("PLPE Spirit unlocks at level 4"), { statusCode: 409 });
    if (actor.spirit < 100) throw Object.assign(new Error("PLPE Spirit is not ready"), { statusCode: 409 });
    actor.spirit = 0;
    if (state.metrics?.[actor.wallet]) state.metrics[actor.wallet].spiritUses += 1;
    const multiplier = actor.specialization === "warrior" ? 1.40 : actor.specialization === "ranger" ? 1.35 : 1.35;
    damage = calculateDamage(actor, target, multiplier, { magic: actor.specialization === "mage", piercing: actor.specialization === "ranger" });
    if (actor.specialization === "warrior") actor.shield = Math.max(actor.shield, 6 + actor.level);
    if (actor.specialization === "ranger") { target.bleedTurns = Math.max(target.bleedTurns, 2); target.bleedDamage = Math.max(target.bleedDamage, 3) }
    if (damageTarget(state, actor, target, damage)) winnerWallet = actorWallet;
    pushLog(state, `${actor.nickname} uwalnia PLPE Spirit za ${damage}.`);
  } else {
    throw Object.assign(new Error("Unknown PvP action"), { statusCode: 400 });
  }

  let loserWallet = winnerWallet ? targetWallet : null;
  if (!winnerWallet) {
    const turnResult = advanceTurn(state, actorWallet);
    if (turnResult) {
      winnerWallet = turnResult.winnerWallet;
      loserWallet = turnResult.loserWallet;
    }
  }
  return { state, damage, winnerWallet, loserWallet };
}

function eloDelta(winnerRating, loserRating) {
  const expected = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  return Math.max(8, Math.min(32, Math.round(24 * (1 - expected))));
}

async function createActiveMatch(playerAWallet, playerBWallet, ratings = {}) {
  const { data: existing, error: existingError } = await supabase
    .from("game_matches")
    .select("id")
    .eq("status", "active")
    .or(`player_a_wallet.in.(${playerAWallet},${playerBWallet}),player_b_wallet.in.(${playerAWallet},${playerBWallet})`)
    .limit(1);
  if (existingError) throw new Error(`Unable to verify active PvP matches: ${existingError.message}`);
  if ((existing || []).length > 0) {
    const conflict = new Error("One of the players is already in an active PvP match");
    conflict.statusCode = 409;
    throw conflict;
  }

  const { data: players, error } = await supabase.from("game_players").select("*").in("wallet_address", [playerAWallet, playerBWallet]);
  if (error) throw new Error(`Unable to load PvP players: ${error.message}`);
  const byWallet = Object.fromEntries((players || []).map(p => [p.wallet_address, p]));
  if (!byWallet[playerAWallet] || !byWallet[playerBWallet]) throw new Error("Unable to initialize PvP players");
  const battleState = createBattleState(byWallet[playerAWallet], byWallet[playerBWallet]);
  const now = new Date().toISOString();
  const { data: match, error: matchError } = await supabase.from("game_matches").insert({
    player_a_wallet: playerAWallet,
    player_b_wallet: playerBWallet,
    player_a_rating_before: ratings[playerAWallet] || Number(byWallet[playerAWallet].rating || 1000),
    player_b_rating_before: ratings[playerBWallet] || Number(byWallet[playerBWallet].rating || 1000),
    status: "active",
    battle_state: battleState,
    turn_version: 1,
    started_at: now,
  }).select("*").single();
  if (matchError) throw new Error(`Unable to create PvP match: ${matchError.message}`);
  return match;
}

function matchDto(row) {
  return {
    id: row.id,
    status: row.status,
    playerAWallet: row.player_a_wallet,
    playerBWallet: row.player_b_wallet,
    winnerWallet: row.winner_wallet || null,
    loserWallet: row.loser_wallet || null,
    ratingDelta: Number(row.rating_delta || 0),
    turnVersion: Number(row.turn_version || 0),
    battleState: row.battle_state || null,
    createdAt: row.created_at,
    startedAt: row.started_at || null,
    endedAt: row.ended_at || null,
  };
}

async function getBattleMatch(walletInput, matchId) {
  const wallet = normalizeWalletAddress(walletInput);
  const { data, error } = await supabase.from("game_matches").select("*").eq("id", matchId).maybeSingle();
  if (error) throw new Error(`Unable to load PvP match: ${error.message}`);
  if (!data) throw Object.assign(new Error("Match not found"), { statusCode: 404 });
  if (data.player_a_wallet !== wallet && data.player_b_wallet !== wallet) throw Object.assign(new Error("You are not a participant in this match"), { statusCode: 403 });
  return matchDto(data);
}

async function finishMatch(row, winnerWallet, loserWallet, battleState) {
  const winnerBefore = winnerWallet === row.player_a_wallet ? Number(row.player_a_rating_before || 1000) : Number(row.player_b_rating_before || 1000);
  const loserBefore = loserWallet === row.player_a_wallet ? Number(row.player_a_rating_before || 1000) : Number(row.player_b_rating_before || 1000);
  const delta = eloDelta(winnerBefore, loserBefore);
  const endedAt = new Date().toISOString();
  const expectedVersion = Number(row.turn_version || 0);

  // Claim completion first with optimistic locking. This prevents two near-simultaneous
  // lethal requests from settling the same match and double-counting rating/stats.
  const { data: claimedRows, error: claimError } = await supabase
    .from("game_matches")
    .update({
      status: "completed",
      winner_wallet: winnerWallet,
      loser_wallet: loserWallet,
      rating_delta: delta,
      battle_state: battleState,
      ended_at: endedAt,
      updated_at: endedAt,
      turn_version: expectedVersion + 1,
    })
    .eq("id", row.id)
    .eq("status", "active")
    .eq("turn_version", expectedVersion)
    .select("*");
  if (claimError) throw new Error(`Unable to finish PvP match: ${claimError.message}`);
  if (!claimedRows || claimedRows.length !== 1) {
    throw Object.assign(new Error("Battle state changed. Refreshing match."), { statusCode: 409 });
  }
  const claimed = claimedRows[0];

  const { data: currentPlayers, error: playerReadError } = await supabase
    .from("game_players")
    .select("*")
    .in("wallet_address", [winnerWallet, loserWallet]);
  if (playerReadError) throw new Error(`Unable to settle PvP players: ${playerReadError.message}`);

  const byWallet = Object.fromEntries((currentPlayers || []).map(p => [p.wallet_address, p]));
  const winner = byWallet[winnerWallet];
  const loser = byWallet[loserWallet];
  const winnerMetrics = battleState.metrics?.[winnerWallet] || {};
  const loserMetrics = battleState.metrics?.[loserWallet] || {};

  if (winner) {
    const { error } = await supabase.from("game_players").update({
      rating: Number(winner.rating || 1000) + delta,
      highest_rating: Math.max(Number(winner.highest_rating || 1000), Number(winner.rating || 1000) + delta),
      wins: Number(winner.wins || 0) + 1,
      pvp_battles: Number(winner.pvp_battles || 0) + 1,
      current_win_streak: Number(winner.current_win_streak || 0) + 1,
      best_win_streak: Math.max(Number(winner.best_win_streak || 0), Number(winner.current_win_streak || 0) + 1),
      damage_dealt: Number(winner.damage_dealt || 0) + Number(winnerMetrics.damageDealt || 0),
      damage_received: Number(winner.damage_received || 0) + Number(winnerMetrics.damageReceived || 0),
      blocks: Number(winner.blocks || 0) + Number(winnerMetrics.blocks || 0),
      spirit_uses: Number(winner.spirit_uses || 0) + Number(winnerMetrics.spiritUses || 0),
      presence_status: "online",
      updated_at: endedAt,
    }).eq("wallet_address", winnerWallet);
    if (error) throw new Error(`Unable to settle PvP winner: ${error.message}`);
  }

  if (loser) {
    const { error } = await supabase.from("game_players").update({
      rating: Math.max(0, Number(loser.rating || 1000) - delta),
      losses: Number(loser.losses || 0) + 1,
      pvp_battles: Number(loser.pvp_battles || 0) + 1,
      current_win_streak: 0,
      damage_dealt: Number(loser.damage_dealt || 0) + Number(loserMetrics.damageDealt || 0),
      damage_received: Number(loser.damage_received || 0) + Number(loserMetrics.damageReceived || 0),
      blocks: Number(loser.blocks || 0) + Number(loserMetrics.blocks || 0),
      spirit_uses: Number(loser.spirit_uses || 0) + Number(loserMetrics.spiritUses || 0),
      presence_status: "online",
      updated_at: endedAt,
    }).eq("wallet_address", loserWallet);
    if (error) throw new Error(`Unable to settle PvP loser: ${error.message}`);
  }

  return matchDto(claimed);
}

async function submitBattleAction(walletInput, matchId, action, expectedVersion) {
  const wallet = normalizeWalletAddress(walletInput);
  const { data: row, error } = await supabase.from("game_matches").select("*").eq("id", matchId).maybeSingle();
  if (error) throw new Error(`Unable to load PvP match: ${error.message}`);
  if (!row) throw Object.assign(new Error("Match not found"), { statusCode: 404 });
  if (row.player_a_wallet !== wallet && row.player_b_wallet !== wallet) throw Object.assign(new Error("You are not a participant in this match"), { statusCode: 403 });
  if (row.status !== "active") return matchDto(row);
  const version = Number(row.turn_version || 0);
  if (Number(expectedVersion) !== version) throw Object.assign(new Error("Battle state changed. Refreshing match."), { statusCode: 409 });
  const result = applyAction(row.battle_state, wallet, action);
  if (result.winnerWallet) return finishMatch(row, result.winnerWallet, result.loserWallet, result.state);

  const { data, error: updateError } = await supabase.from("game_matches").update({ battle_state: result.state, turn_version: version + 1, updated_at: new Date().toISOString() }).eq("id", matchId).eq("status", "active").eq("turn_version", version).select("*");
  if (updateError) throw new Error(`Unable to update PvP battle: ${updateError.message}`);
  if (!data || data.length !== 1) throw Object.assign(new Error("Battle state changed. Refreshing match."), { statusCode: 409 });
  return matchDto(data[0]);
}


async function getActiveMatchForPlayer(walletInput) {
  const wallet = normalizeWalletAddress(walletInput);
  const { data, error } = await supabase
    .from("game_matches")
    .select("*")
    .eq("status", "active")
    .or(`player_a_wallet.eq.${wallet},player_b_wallet.eq.${wallet}`)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw new Error(`Unable to load active PvP match: ${error.message}`);
  return data?.[0] ? matchDto(data[0]) : null;
}

async function listMatchHistory(walletInput, limitInput = 20) {
  const wallet = normalizeWalletAddress(walletInput);
  const limit = Math.min(50, Math.max(1, Number(limitInput || 20)));
  const { data, error } = await supabase.from("game_matches").select("*").or(`player_a_wallet.eq.${wallet},player_b_wallet.eq.${wallet}`).in("status", ["completed", "active"]).order("created_at", { ascending: false }).limit(limit);
  if (error) throw new Error(`Unable to load PvP history: ${error.message}`);
  return (data || []).map(matchDto);
}
module.exports = { createActiveMatch, getBattleMatch, getActiveMatchForPlayer, submitBattleAction, listMatchHistory, matchDto };
