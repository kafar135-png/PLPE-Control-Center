const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {

    res.json({

        project: "PLPE OS",

        version: "0.1.0",

        status: "ONLINE",

        time: new Date()

    });

});

module.exports = router;