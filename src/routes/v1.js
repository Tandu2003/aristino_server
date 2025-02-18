const express = require("express");

const account = require("../controllers/accountContriller");

const router = express.Router();

// router account
router.get("/accounts", account.getAccounts);

module.exports = router;
