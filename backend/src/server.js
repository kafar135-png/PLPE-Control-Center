const express = require("express");
const cors = require("cors");
require("dotenv").config();

// ============================================
// ROUTES
// ============================================

const statusRoute = require("./routes/status");
const marketRoute = require("./routes/market");
const chartRoute = require("./routes/chart");
const tradesRoute = require("./routes/trades");
const holdersRoute = require("./routes/holders");
const liveTradesRoute = require("./routes/liveTrades");
const walletRoute = require("./routes/wallet");
const challengeRoute = require("./routes/challenge");
const onlineRoute = require("./routes/online");

console.log("🔥 ONLINE ROUTE LOADED:", typeof onlineRoute);

// ============================================
// APP
// ============================================

const app = express();

const PORT = process.env.PORT || 3001;

// ============================================
// CORS
// ============================================

const allowedOrigins = (
  process.env.CORS_ORIGIN || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Pozwala np. Postmanowi / curl / server-side requests
      if (!origin) {
        return callback(null, true);
      }

      // Lokalny frontend
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Produkcyjny frontend PLPE OS
      if (
        origin === "https://plpe-control-center.vercel.app"
      ) {
        return callback(null, true);
      }

      console.warn(
        `[CORS] Blocked origin: ${origin}`
      );

      return callback(
        new Error(`Blocked by CORS: ${origin}`)
      );
    },

    credentials: true,
  })
);

// ============================================
// BODY PARSER
// ============================================

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ============================================
// REQUEST LOGGER
// ============================================

app.use((req, res, next) => {
  console.log(
    `[API] ${req.method} ${req.originalUrl}`
  );

  next();
});

// ============================================
// ROOT
// ============================================

app.get("/", (req, res) => {
  res.json({
    application: "PLPE OS Backend",
    version: "0.1.0-beta",
    status: "online",
    environment:
      process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// HEALTH CHECK
// ============================================

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "PLPE OS Backend",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// API ROUTES
// ============================================

// STATUS
app.use(
  "/api/status",
  statusRoute
);

// MARKET
app.use(
  "/api/market",
  marketRoute
);

// CHART
app.use(
  "/api/chart",
  chartRoute
);

// TRADES
app.use(
  "/api/trades",
  tradesRoute
);

// HOLDERS
app.use(
  "/api/holders",
  holdersRoute
);

// LIVE TRADES
app.use(
  "/api/live-trades",
  liveTradesRoute
);

// WALLET
app.use(
  "/api/wallet",
  walletRoute
);

// ============================================
// MONTHLY TRADING CHALLENGE
// ============================================

app.use(
  "/api/challenge",
  challengeRoute
);

// ============================================
// ONLINE USERS
// ============================================

app.use(
  "/api/online",
  onlineRoute
);

// ============================================
// 404
// ============================================

app.use((req, res) => {
  console.warn(
    `[404] Endpoint not found: ${req.method} ${req.originalUrl}`
  );

  res.status(404).json({
    error: "Endpoint not found",
    method: req.method,
    path: req.originalUrl,
  });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  console.error("");
  console.error(
    "=========================================="
  );
  console.error(
    "🔥 PLPE BACKEND ERROR"
  );
  console.error(
    "=========================================="
  );

  console.error(
    "Method:",
    req.method
  );

  console.error(
    "URL:",
    req.originalUrl
  );

  console.error(
    "Message:",
    err?.message
  );

  console.error(
    "Stack:"
  );

  console.error(
    err?.stack || err
  );

  console.error(
    "=========================================="
  );
  console.error("");

  // Nie wysyłamy odpowiedzi ponownie,
  // jeśli nagłówki zostały już wysłane.
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: "Internal Server Error",

    message:
      err?.message ||
      "Unknown backend error",

    endpoint:
      req.originalUrl,

    timestamp:
      new Date().toISOString(),
  });
});

// ============================================
// SERVER
// ============================================

const server = app.listen(
  PORT,
  () => {
    console.log("");
    console.log(
      "=================================="
    );
    console.log(
      "🚀 PLPE Backend Started"
    );
    console.log(
      "=================================="
    );

    console.log(
      `🌍 Port: ${PORT}`
    );

    console.log(
      `📡 Environment: ${
        process.env.NODE_ENV ||
        "development"
      }`
    );

    console.log(
      `🔗 Root: http://localhost:${PORT}/`
    );

    console.log(
      `❤️ Health: http://localhost:${PORT}/health`
    );

    console.log(
      `📊 Status: /api/status`
    );

    console.log(
      `💰 Market: /api/market`
    );

    console.log(
      `📈 Chart: /api/chart`
    );

    console.log(
      `💱 Trades: /api/trades`
    );

    console.log(
      `👥 Holders: /api/holders`
    );

    console.log(
      `⚡ Live Trades: /api/live-trades`
    );

    console.log(
      `👛 Wallet: /api/wallet`
    );

    console.log(
      `🏆 Challenge: /api/challenge`
    );

    console.log(
      "=================================="
    );

    console.log("");
  }
);

// ============================================
// SERVER CLOSE
// ============================================

server.on(
  "close",
  () => {
    console.log(
      "🛑 PLPE Backend Server Closed"
    );
  }
);

// ============================================
// SIGINT
// ============================================

process.on(
  "SIGINT",
  () => {
    console.log("");
    console.log(
      "🛑 SIGINT received"
    );

    server.close(
      () => {
        console.log(
          "Server closed."
        );

        process.exit(0);
      }
    );
  }
);

// ============================================
// SIGTERM
// ============================================

process.on(
  "SIGTERM",
  () => {
    console.log("");
    console.log(
      "🛑 SIGTERM received"
    );

    server.close(
      () => {
        console.log(
          "Server closed."
        );

        process.exit(0);
      }
    );
  }
);

// ============================================
// UNCAUGHT EXCEPTION
// ============================================

process.on(
  "uncaughtException",
  (err) => {
    console.error("");
    console.error(
      "=========================================="
    );
    console.error(
      "🔥 UNCAUGHT EXCEPTION"
    );
    console.error(
      "=========================================="
    );
    console.error(
      err
    );
    console.error(
      "=========================================="
    );
  }
);

// ============================================
// UNHANDLED REJECTION
// ============================================

process.on(
  "unhandledRejection",
  (reason) => {
    console.error("");
    console.error(
      "=========================================="
    );
    console.error(
      "🔥 UNHANDLED REJECTION"
    );
    console.error(
      "=========================================="
    );
    console.error(
      reason
    );
    console.error(
      "=========================================="
    );
  }
);