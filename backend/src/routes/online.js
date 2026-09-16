const express = require("express");

const router = express.Router();

// ============================================
// PLPE OS ONLINE USERS
// ============================================

// sessionId -> last heartbeat timestamp
const activeSessions = new Map();

// User is considered online for 45 seconds
const SESSION_TIMEOUT = 45 * 1000;

// ============================================
// CLEANUP
// ============================================

function cleanupSessions() {
  const now = Date.now();

  for (const [sessionId, lastSeen] of activeSessions.entries()) {
    if (now - lastSeen > SESSION_TIMEOUT) {
      activeSessions.delete(sessionId);
    }
  }
}

// Cleanup every 15 seconds
setInterval(cleanupSessions, 15000);

// ============================================
// POST /api/online/heartbeat
// ============================================

router.post("/heartbeat", (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({
        error: "sessionId is required",
      });
    }

    activeSessions.set(sessionId, Date.now());

    cleanupSessions();

    return res.json({
      online: activeSessions.size,
    });
  } catch (error) {
    console.error("[ONLINE] Heartbeat error:", error);

    return res.status(500).json({
      error: "Online counter error",
    });
  }
});

// ============================================
// GET /api/online
// ============================================

router.get("/", (req, res) => {
  try {
    cleanupSessions();

    return res.json({
      online: activeSessions.size,
    });
  } catch (error) {
    console.error("[ONLINE] Counter error:", error);

    return res.status(500).json({
      error: "Online counter error",
    });
  }
});

// ============================================
// EXPORT
// ============================================

module.exports = router;
