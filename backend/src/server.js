const express = require("express");
const cors = require("cors");
require("dotenv").config();

const statusRoute = require("./routes/status");
const marketRoute = require("./routes/market");
const chartRoute = require("./routes/chart");
const tradesRoute = require("./routes/trades");
const holdersRoute = require("./routes/holders");
const liveTradesRoute = require("./routes/liveTrades");
const walletRoute = require("./routes/wallet");
const challengeRoute = require("./routes/challenge");

const app = express();

const PORT = process.env.PORT || 3001;

// ========================================
// CORS
// ========================================
//
// Pozwalamy frontendowi lokalnemu oraz Vercel.
// Backend API jest publiczne, więc nie potrzebujemy
// credentials/cookies cross-origin.
//

const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  "http://localhost:5173,https://plpe-control-center.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // curl / Postman / server-to-server
      if (!origin) {
        return callback(null, true);
      }

      // Lokalny frontend
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Wszystkie deploymenty Vercel projektu
      if (
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      console.warn(
        `CORS blocked origin: ${origin}`
      );

      return callback(
        new Error(`Blocked by CORS: ${origin}`)
      );
    },

    credentials: false,
  })
);

app.use(express.json());

// ========================================
// ROOT
// ========================================

app.get("/", (_, res) => {
  res.json({
    application: "PLPE OS Backend",
    version: "0.1.0-beta",
    status: "online",
    time: new Date().toISOString(),
  });
});

// ========================================
// API ROUTES
// ========================================

app.use(
  "/api/status",
  statusRoute
);

app.use(
  "/api/market",
  marketRoute
);

app.use(
  "/api/chart",
  chartRoute
);

app.use(
  "/api/trades",
  tradesRoute
);

app.use(
  "/api/holders",
  holdersRoute
);

app.use(
  "/api/live-trades",
  liveTradesRoute
);

app.use(
  "/api/wallet",
  walletRoute
);

app.use(
  "/api/challenge",
  challengeRoute
);

// ========================================
// 404
// ========================================

app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
  });
});

// ========================================
// ERROR HANDLER
// ========================================

app.use((err, req, res, next) => {
  console.error(
    "API ERROR:",
    err
  );

  res.status(500).json({
    error:
      err.message ||
      "Internal Server Error",
  });
});

// ========================================
// SERVER
// ========================================

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
      `🌍 Port: ${PORT}`
    );
    console.log(
      `📡 Environment: ${
        process.env.NODE_ENV ||
        "development"
      }`
    );
    console.log(
      "🏆 Challenge API: /api/challenge"
    );
    console.log(
      "📊 Market API: /api/market"
    );
    console.log(
      "📈 Chart API: /api/chart"
    );
    console.log(
      "💱 Trades API: /api/trades"
    );
    console.log(
      "🔥 Live Trades API: /api/live-trades"
    );
    console.log(
      "👛 Wallet API: /api/wallet"
    );
    console.log(
      "=================================="
    );
    console.log("");
  }
);

// ========================================
// SERVER CLOSE
// ========================================

server.on(
  "close",
  () => {
    console.log(
      "SERVER CLOSED"
    );
  }
);

// ========================================
// PROCESS HANDLERS
// ========================================

process.on(
  "SIGINT",
  () => {
    console.log("SIGINT");

    server.close(() => {
      process.exit(0);
    });
  }
);

process.on(
  "SIGTERM",
  () => {
    console.log("SIGTERM");

    server.close(() => {
      process.exit(0);
    });
  }
);

process.on(
  "uncaughtException",
  (err) => {
    console.error(
      "UNCAUGHT EXCEPTION"
    );

    console.error(err);
  }
);

process.on(
  "unhandledRejection",
  (err) => {
    console.error(
      "UNHANDLED REJECTION"
    );

    console.error(err);
  }
);