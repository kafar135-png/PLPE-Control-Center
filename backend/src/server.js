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

const allowedOrigins = (
  process.env.CORS_ORIGIN || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      // Pozwala np. Postmanowi lub curl
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`Blocked by CORS: ${origin}`)
      );
    },

    credentials: true,
  })
);

app.use(express.json());

app.get("/", (_, res) => {
  res.json({
    application: "PLPE OS Backend",
    version: "0.1.0-beta",
    status: "online",
  });
});

// ================================
// API ROUTES
// ================================

app.use("/api/status", statusRoute);

app.use("/api/market", marketRoute);

app.use("/api/chart", chartRoute);

app.use("/api/trades", tradesRoute);

app.use("/api/holders", holdersRoute);

app.use("/api/live-trades", liveTradesRoute);

app.use("/api/wallet", walletRoute);

// PLPE Monthly Trading Challenge
app.use("/api/challenge", challengeRoute);

// ================================
// 404
// ================================

app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
  });
});

// ================================
// ERROR HANDLER
// ================================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error: "Internal Server Error",
  });
});

// ================================
// SERVER
// ================================

const server = app.listen(PORT, () => {
  console.log("");
  console.log("==================================");
  console.log("🚀 PLPE Backend Started");
  console.log(`🌍 Port: ${PORT}`);
  console.log(
    `📡 Environment: ${
      process.env.NODE_ENV || "development"
    }`
  );
  console.log("🏆 Challenge API: /api/challenge");
  console.log("==================================");
  console.log("");
});

// ================================
// SERVER CLOSE
// ================================

server.on("close", () => {
  console.log("SERVER CLOSED");
});

// ================================
// PROCESS HANDLERS
// ================================

process.on("SIGINT", () => {
  console.log("SIGINT");

  server.close(() => {
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM");

  server.close(() => {
    process.exit(0);
  });
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION");
  console.error(err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION");
  console.error(err);
});