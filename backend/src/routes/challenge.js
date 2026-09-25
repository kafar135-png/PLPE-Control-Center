const express = require("express");
const router = express.Router();
const { challenge, refreshChallenge, challengeDiagnostics, clearCache } = require("../controllers/challengeController");
const { nonce, register, registrationStatus } = require("../controllers/challengeRegistrationController");

router.get("/", challenge);
router.get("/diagnostics", challengeDiagnostics);
router.get("/refresh", refreshChallenge);
router.post("/clear-cache", clearCache);
router.post("/registration/nonce", nonce);
router.post("/registration/register", register);
router.get("/registration/status/:wallet", registrationStatus);

module.exports = router;
