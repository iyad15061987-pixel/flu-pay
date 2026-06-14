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
  getAllUsers,
  freezeUser,
  unfreezeUser,
  updateBalance,
  updateRole,
} = require(
  "../controllers/adminUserController"
);

// =========================
// GET ALL USERS
// =========================

router.get(
  "/admin/users",

  auth,

  adminOnly,

  getAllUsers
);

// =========================
// FREEZE USER
// =========================

router.put(
  "/admin/users/:id/freeze",

  auth,

  adminOnly,

  freezeUser
);

// =========================
// UNFREEZE USER
// =========================

router.put(
  "/admin/users/:id/unfreeze",

  auth,

  adminOnly,

  unfreezeUser
);

// =========================
// UPDATE BALANCE
// =========================

router.put(
  "/admin/users/:id/balance",

  auth,

  adminOnly,

  updateBalance
);

// =========================
// UPDATE ROLE
// =========================

router.put(
  "/admin/users/:id/role",

  auth,

  adminOnly,

  updateRole
);

module.exports =
  router;