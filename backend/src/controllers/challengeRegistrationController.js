const { createRegistrationChallenge, registerWallet, getRegistrationStatus } = require("../services/challengeRegistration");
const { clearChallengeCache } = require("../services/challenge");

async function nonce(req, res) {
  try { return res.json({ status: "1", ...(await createRegistrationChallenge(req.body?.wallet)) }); }
  catch (err) { return res.status(400).json({ status: "0", error: err.message }); }
}
async function register(req, res) {
  try { const registration = await registerWallet(req.body || {}); clearChallengeCache("03"); return res.json({ status: "1", registration }); }
  catch (err) { return res.status(400).json({ status: "0", error: err.message }); }
}
async function registrationStatus(req, res) {
  try { return res.json({ status: "1", ...(await getRegistrationStatus(req.params.wallet)) }); }
  catch (err) { return res.status(400).json({ status: "0", error: err.message }); }
}
module.exports = { nonce, register, registrationStatus };
