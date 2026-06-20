const express =
  require("express");

const router =
  express.Router();

const {
  register,
  login,
  setup2FA,
  verify2FASetup,
  verify2FALogin,
  disable2FA,
  verifyEmail,
  resendVerificationCode,
} = require(
  "../controllers/authController"
);

const {
  auth,
} = require(
  "../middleware/auth"
);

// =========================
// REGISTER
// =========================

router.post(
  "/register",

  register
);

// =========================
// LOGIN
// =========================

router.post(
  "/login",

  login
);

// =========================
// SETUP 2FA
// =========================

router.post(
  "/2fa/setup",

  auth,

  setup2FA
);

// =========================
// VERIFY 2FA SETUP
// =========================

router.post(
  "/2fa/verify",

  auth,

  verify2FASetup
);

// =========================
// VERIFY LOGIN 2FA
// =========================

router.post(
  "/2fa/login",

  verify2FALogin
);

// =========================
// DISABLE 2FA
// =========================

router.post(
  "/2fa/disable",

  auth,

  disable2FA
);

// =========================
// VERIFY EMAIL
// =========================

router.post(
  "/verify-email",
  verifyEmail
);

// =========================
// RESEND OTP
// =========================

router.post(
  "/resend-verification",
  resendVerificationCode
);

module.exports =
  router;