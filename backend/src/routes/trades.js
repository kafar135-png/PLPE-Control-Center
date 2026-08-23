const express = require("express");

const router = express.Router();

const {
    trades,
} = require("../controllers/tradesController");

router.get("/", trades);

module.exports = router;