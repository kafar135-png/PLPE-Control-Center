const {
  getSessionByToken,
  touchSession,
} = require("../services/gameAuth");

function readBearerToken(req) {
  const header = req.headers.authorization;

  if (!header || typeof header !== "string") return null;

  const match = /^Bearer\s+(.+)$/i.exec(header.trim());

  return match?.[1] || null;
}

async function requireGameAuth(req, res, next) {
  try {
    const token = readBearerToken(req);

    if (!token) {
      return res.status(401).json({
        error: "Game authentication required",
      });
    }

    const session = await getSessionByToken(token);

    if (!session) {
      return res.status(401).json({
        error: "Game session is invalid or expired",
      });
    }

    req.gameAuth = {
      token,
      walletAddress: session.wallet_address,
      expiresAt: session.expires_at,
    };

    touchSession(token).catch((error) => {
      console.warn("[GAME AUTH] Session touch failed:", error.message);
    });

    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  requireGameAuth,
};
