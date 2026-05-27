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

const User =
  require(
    "../models/User"
  );

const {
  getUsers,
  createDepositRequest,
  createWithdrawRequest,
  getDepositRequests,
  getWithdrawRequests,
  approveDeposit,
  approveWithdraw,
} = require(
  "../controllers/adminController"
);

// =========================
// GET ALL USERS
// =========================

router.get(
  "/admin/users",

  auth,

  adminOnly,

  getUsers
);

// =========================
// CREATE DEPOSIT REQUEST
// =========================

router.post(
  "/create-deposit-request",

  auth,

  createDepositRequest
);

// =========================
// CREATE WITHDRAW REQUEST
// =========================

router.post(
  "/create-withdraw-request",

  auth,

  createWithdrawRequest
);

// =========================
// GET DEPOSIT REQUESTS
// =========================

router.get(
  "/admin/deposit-requests",

  auth,

  adminOnly,

  getDepositRequests
);

// =========================
// GET WITHDRAW REQUESTS
// =========================

router.get(
  "/admin/withdraw-requests",

  auth,

  adminOnly,

  getWithdrawRequests
);

// =========================
// APPROVE DEPOSIT
// =========================

router.post(
  "/approve-deposit",

  auth,

  adminOnly,

  approveDeposit
);

// =========================
// APPROVE WITHDRAW
// =========================

router.post(
  "/approve-withdraw",

  auth,

  adminOnly,

  approveWithdraw
);

// =========================
// FREEZE USER
// =========================

router.post(
  "/freeze-user",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      const { userId } =
        req.body;

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      user.frozen = true;

      await user.save();

      return res.json({
        message:
          "User frozen successfully",
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

// =========================
// UNFREEZE USER
// =========================

router.post(
  "/unfreeze-user",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      const { userId } =
        req.body;

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      user.frozen = false;

      await user.save();

      return res.json({
        message:
          "User unfrozen successfully",
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

// =========================
// DELETE USER
// =========================

router.post(
  "/delete-user",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      const { userId } =
        req.body;

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      await User.findByIdAndDelete(
        userId
      );

      return res.json({
        message:
          "User deleted successfully",
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

module.exports =
  router;