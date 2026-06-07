const express =
  require("express");

const router =
  express.Router();

const {
  auth,
  adminOnly,
} = require(
  "../middleware/auth"
);

const {
  createWithdrawal,
  getUserWithdrawals,
  getAllWithdrawals,
} = require(
  "../controllers/withdrawalController"
);

// =========================
// CREATE WITHDRAWAL
// =========================

router.post(
  "/withdrawals",

  auth,

  createWithdrawal
);

// =========================
// USER WITHDRAWALS
// =========================

router.get(
  "/withdrawals",

  auth,

  getUserWithdrawals
);

// =========================
// ADMIN WITHDRAWALS
// =========================

router.get(
  "/admin/withdrawals",

  auth,

  adminOnly,

  getAllWithdrawals
);

module.exports =
  router;