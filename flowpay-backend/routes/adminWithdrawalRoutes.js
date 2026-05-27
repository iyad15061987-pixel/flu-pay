const express =
  require("express");

const router =
  express.Router();

const {
  auth,
} = require(
  "../middleware/auth"
);

const Withdrawal =
  require(
    "../models/Withdrawal"
  );

const User =
  require(
    "../models/User"
  );

// =========================
// LIST ALL WITHDRAWALS
// =========================

router.get(
  "/admin/withdrawals",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const admin =
        await User.findById(
          req.user.id
        );

      if (
        !admin ||
        admin.role !==
          "admin"
      ) {
        return res.status(403).json({
          message:
            "Access denied",
        });
      }

      const withdrawals =
        await Withdrawal.find()
          .sort({
            createdAt: -1,
          });

      res.json(
        withdrawals
      );

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

// =========================
// APPROVE WITHDRAWAL
// =========================

router.post(
  "/admin/withdrawals/:id/approve",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const admin =
        await User.findById(
          req.user.id
        );

      if (
        !admin ||
        admin.role !==
          "admin"
      ) {
        return res.status(403).json({
          message:
            "Access denied",
        });
      }

      const withdrawal =
        await Withdrawal.findById(
          req.params.id
        );

      if (!withdrawal) {
        return res.status(404).json({
          message:
            "Withdrawal not found",
        });
      }

      withdrawal.status =
        "approved";

      withdrawal.processedAt =
        new Date();

      await withdrawal.save();

      // REALTIME EVENT

      if (global.io) {
        global.io.emit(
          "withdrawal_approved",

          withdrawal
        );
      }

      res.json({
        message:
          "Withdrawal approved",
      });

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Approval failed",
      });
    }
  }
);

// =========================
// REJECT WITHDRAWAL
// =========================

router.post(
  "/admin/withdrawals/:id/reject",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const admin =
        await User.findById(
          req.user.id
        );

      if (
        !admin ||
        admin.role !==
          "admin"
      ) {
        return res.status(403).json({
          message:
            "Access denied",
        });
      }

      const withdrawal =
        await Withdrawal.findById(
          req.params.id
        );

      if (!withdrawal) {
        return res.status(404).json({
          message:
            "Withdrawal not found",
        });
      }

      if (
        withdrawal.status !==
        "pending"
      ) {
        return res.status(400).json({
          message:
            "Already processed",
        });
      }

      // =========================
      // REFUND BALANCE
      // =========================

      const user =
        await User.findById(
          withdrawal.userId
        );

      if (user) {
        user.balance +=
          withdrawal.amount;

        await user.save();
      }

      withdrawal.status =
        "rejected";

      withdrawal.processedAt =
        new Date();

      await withdrawal.save();

      // REALTIME EVENT

      if (global.io) {
        global.io.emit(
          "withdrawal_rejected",

          withdrawal
        );
      }

      res.json({
        message:
          "Withdrawal rejected",
      });

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Rejection failed",
      });
    }
  }
);

module.exports =
  router;