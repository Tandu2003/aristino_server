const express = require("express");

const router = express.Router();

const auth = require("../controllers/authController");

// router auth
router.get("/login", auth.check);
router.post("/login", auth.login);
router.post("/register", auth.register);
router.post("/logout", auth.logout);
// router.post("/forgot-password", auth.forgotPassword);
// router.post("/reset-password", auth.resetPassword);

module.exports = router;
