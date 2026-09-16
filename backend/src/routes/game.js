const express = require("express");

const router = express.Router();

const { requireGameAuth } = require("../middleware/gameAuth");
const {
  registerGameAccount,
  loginGameAccount,
  logoutSession,
} = require("../services/gameAuth");
const {
  toPublicPlayer,
  getPlayer,
  updateNickname,
  updateSpecialization,
  updateProgression,
  heartbeat,
  setOffline,
  listOnlinePlayers,
  getRanking,
} = require("../services/gamePlayers");
const {
  sendChallenge,
  listChallengesWithPlayers,
  respondToChallenge,
  getMatchForPlayer,
} = require("../services/gameChallenges");
const { submitBattleAction, listMatchHistory, getActiveMatchForPlayer } = require("../services/gameBattle");

function sendError(res, error, fallbackStatus = 500) {
  const statusCode = Number(error?.statusCode || fallbackStatus);

  return res.status(statusCode).json({
    error: error?.message || "Game API error",
  });
}

// ============================================
// AUTH
// ============================================

router.post("/auth/register", async (req, res) => {
  try {
    const result = await registerGameAccount({
      email: req.body?.email,
      nickname: req.body?.nickname,
      password: req.body?.password,
      walletAddress: req.body?.walletAddress,
    });

    return res.status(201).json({
      token: result.token,
      expiresAt: result.expiresAt,
      player: toPublicPlayer(result.player),
    });
  } catch (error) {
    console.error("[GAME AUTH] register:", error);
    return sendError(res, error);
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const result = await loginGameAccount(
      req.body?.login,
      req.body?.password
    );

    return res.json({
      token: result.token,
      expiresAt: result.expiresAt,
      player: toPublicPlayer(result.player),
    });
  } catch (error) {
    console.error("[GAME AUTH] login:", error);
    return sendError(res, error);
  }
});

router.post("/auth/logout", requireGameAuth, async (req, res) => {
  try {
    await setOffline(req.gameAuth.walletAddress);
    await logoutSession(req.gameAuth.token);

    return res.json({ ok: true });
  } catch (error) {
    console.error("[GAME AUTH] logout:", error);
    return sendError(res, error);
  }
});

// ============================================
// PROFILE
// ============================================

router.get("/profile", requireGameAuth, async (req, res) => {
  try {
    return res.json({
      player: await getPlayer(req.gameAuth.walletAddress),
    });
  } catch (error) {
    console.error("[GAME PROFILE] get:", error);
    return sendError(res, error);
  }
});

router.patch("/profile", requireGameAuth, async (req, res) => {
  try {
    return res.json({
      player: await updateNickname(req.gameAuth.walletAddress, req.body?.nickname),
    });
  } catch (error) {
    console.error("[GAME PROFILE] nickname:", error);
    return sendError(res, error);
  }
});


router.patch("/profile/specialization", requireGameAuth, async (req, res) => {
  try {
    return res.json({
      player: await updateSpecialization(
        req.gameAuth.walletAddress,
        req.body?.specialization
      ),
    });
  } catch (error) {
    console.error("[GAME PROFILE] specialization:", error);
    return sendError(res, error);
  }
});

router.patch("/profile/progression", requireGameAuth, async (req, res) => {
  try {
    return res.json({ player: await updateProgression(req.gameAuth.walletAddress, req.body || {}) });
  } catch (error) {
    console.error("[GAME PROFILE] progression:", error);
    return sendError(res, error);
  }
});

// ============================================
// PRESENCE + ONLINE PLAYERS
// ============================================

router.post("/presence/heartbeat", requireGameAuth, async (req, res) => {
  try {
    return res.json(
      await heartbeat(
        req.gameAuth.walletAddress,
        req.body?.status || "online"
      )
    );
  } catch (error) {
    console.error("[GAME PRESENCE] heartbeat:", error);
    return sendError(res, error);
  }
});

router.get("/players/online", requireGameAuth, async (req, res) => {
  try {
    const players = await listOnlinePlayers();

    return res.json({
      online: players.length,
      players,
    });
  } catch (error) {
    console.error("[GAME PLAYERS] online:", error);
    return sendError(res, error);
  }
});

router.get("/ranking", async (req, res) => {
  try {
    return res.json({
      players: await getRanking(req.query?.limit),
    });
  } catch (error) {
    console.error("[GAME RANKING] get:", error);
    return sendError(res, error);
  }
});

// ============================================
// CHALLENGES
// ============================================

router.post("/challenges", requireGameAuth, async (req, res) => {
  try {
    return res.status(201).json({
      challenge: await sendChallenge(
        req.gameAuth.walletAddress,
        req.body?.challengedWallet
      ),
    });
  } catch (error) {
    console.error("[GAME CHALLENGE] create:", error);
    return sendError(res, error);
  }
});

router.get("/challenges", requireGameAuth, async (req, res) => {
  try {
    return res.json(
      await listChallengesWithPlayers(req.gameAuth.walletAddress)
    );
  } catch (error) {
    console.error("[GAME CHALLENGE] list:", error);
    return sendError(res, error);
  }
});

router.post("/challenges/:id/respond", requireGameAuth, async (req, res) => {
  try {
    return res.json(
      await respondToChallenge(
        req.gameAuth.walletAddress,
        req.params.id,
        req.body?.action
      )
    );
  } catch (error) {
    console.error("[GAME CHALLENGE] respond:", error);
    return sendError(res, error);
  }
});

// ============================================
// SYNCHRONIZED PVP MATCHES
// ============================================

router.get("/matches/active", requireGameAuth, async (req, res) => {
  try {
    return res.json({ match: await getActiveMatchForPlayer(req.gameAuth.walletAddress) });
  } catch (error) {
    console.error("[GAME MATCH] active:", error);
    return sendError(res, error);
  }
});

router.get("/matches/history", requireGameAuth, async (req, res) => {
  try {
    return res.json({ matches: await listMatchHistory(req.gameAuth.walletAddress, req.query?.limit) });
  } catch (error) {
    console.error("[GAME MATCH] history:", error);
    return sendError(res, error);
  }
});

router.get("/matches/:id", requireGameAuth, async (req, res) => {
  try {
    return res.json({
      match: await getMatchForPlayer(
        req.gameAuth.walletAddress,
        req.params.id
      ),
    });
  } catch (error) {
    console.error("[GAME MATCH] get:", error);
    return sendError(res, error);
  }
});

router.post("/matches/:id/action", requireGameAuth, async (req, res) => {
  try {
    return res.json({
      match: await submitBattleAction(
        req.gameAuth.walletAddress,
        req.params.id,
        req.body || {},
        req.body?.expectedVersion
      ),
    });
  } catch (error) {
    console.error("[GAME MATCH] action:", error);
    return sendError(res, error);
  }
});

module.exports = router;
