const express = require("express");

const router = express.Router();

const {
  auth,
  adminOnly,
} = require("../middleware/auth");

const Withdrawal =
  require("../models/Withdrawal");

const User =
  require("../models/User");

// ======================================================
// GET ALL WITHDRAWALS
// ======================================================

router.get(
  "/admin/withdrawals",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const withdrawals =
        await Withdrawal.find()
          .sort({ createdAt: -1 });

      return res.json(withdrawals);

    } catch (err) {
      console.error(
        "GET ADMIN WITHDRAWALS ERROR:",
        err
      );

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ======================================================
// APPROVE WITHDRAWAL
// ======================================================
//
// The withdrawal amount is already reserved when the
// user creates the withdrawal.
//
// Therefore approval:
//   1. Requires pending status.
//   2. Removes the amount from reservedBalance.
//   3. Deducts the amount from balance exactly once.
//   4. Changes status to approved.
//
// It does NOT mean that an external payment has completed.
// ======================================================

router.post(
  "/admin/withdrawals/:id/approve",
  auth,
  adminOnly,
  async (req, res) => {
    try {
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

      // Prevent duplicate approval.
      if (
        withdrawal.status !==
        "pending"
      ) {
        return res.status(400).json({
          message:
            `Withdrawal cannot be approved from ${withdrawal.status} status`,
          status:
            withdrawal.status,
        });
      }

      const user =
        await User.findById(
          withdrawal.userId
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      const amount =
        Number(
          withdrawal.amount || 0
        );

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid withdrawal amount",
        });
      }

      const reserved =
        Number(
          user.reservedBalance || 0
        );

      // The amount should already be reserved.
      if (reserved < amount) {
        return res.status(400).json({
          message:
            "Reserved balance is insufficient for this withdrawal",
          reservedBalance:
            reserved,
          withdrawalAmount:
            amount,
        });
      }

      const beforeBalance =
        Number(user.balance || 0);

      const beforeReserved =
        reserved;

      // The amount is finalized from the wallet.
      user.balance =
        beforeBalance - amount;

      user.reservedBalance =
        Math.max(
          0,
          beforeReserved - amount
        );

      user.totalWithdrawals =
        Number(
          user.totalWithdrawals || 0
        ) + amount;

      await user.save();

      withdrawal.status =
        "approved";

      withdrawal.processedBy =
        req.user.id;

      withdrawal.processedAt =
        new Date();

      withdrawal.auditTrail =
        withdrawal.auditTrail || [];

      withdrawal.auditTrail.push({
        action:
          "Withdrawal approved by admin",
        performedBy:
          req.user.email ||
          String(req.user.id),
        timestamp:
          new Date(),
      });

      await withdrawal.save();

      console.log(
        "WITHDRAWAL APPROVED:",
        String(withdrawal._id),
        "AMOUNT:",
        amount,
        "BALANCE:",
        beforeBalance,
        "->",
        user.balance,
        "RESERVED:",
        beforeReserved,
        "->",
        user.reservedBalance
      );

      return res.json({
        success: true,
        message:
          "Withdrawal approved",
        withdrawalId:
          withdrawal._id,
        status:
          withdrawal.status,
        balance:
          user.balance,
        reservedBalance:
          user.reservedBalance,
      });

    } catch (err) {
      console.error(
        "APPROVE WITHDRAWAL ERROR:",
        err
      );

      return res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

// ======================================================
// COMPLETE WITHDRAWAL
// ======================================================
//
// Completion is only a status transition here.
// External payment providers must confirm the payment
// before this endpoint should be used in production.
// ======================================================

router.post(
  "/admin/withdrawals/:id/complete",
  auth,
  adminOnly,
  async (req, res) => {
    try {
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
        "approved" &&
        withdrawal.status !==
        "processing"
      ) {
        return res.status(400).json({
          message:
            `Withdrawal cannot be completed from ${withdrawal.status} status`,
        });
      }

      withdrawal.status =
        "completed";

      withdrawal.processedBy =
        req.user.id;

      withdrawal.processedAt =
        new Date();

      withdrawal.auditTrail =
        withdrawal.auditTrail || [];

      withdrawal.auditTrail.push({
        action:
          "Withdrawal marked completed by admin",
        performedBy:
          req.user.email ||
          String(req.user.id),
        timestamp:
          new Date(),
      });

      await withdrawal.save();

      return res.json({
        success: true,
        message:
          "Withdrawal completed",
        withdrawalId:
          withdrawal._id,
        status:
          withdrawal.status,
      });

    } catch (err) {
      console.error(
        "COMPLETE WITHDRAWAL ERROR:",
        err
      );

      return res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

// ======================================================
// REJECT WITHDRAWAL
// ======================================================
//
// The amount was reserved, not removed from balance,
// when the withdrawal was created.
//
// Therefore rejection:
//   1. Requires pending status.
//   2. Releases reservedBalance.
//   3. Does NOT add the amount to balance again.
// ======================================================

router.post(
  "/admin/withdrawals/:id/reject",
  auth,
  adminOnly,
  async (req, res) => {
    try {
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
            `Withdrawal cannot be rejected from ${withdrawal.status} status`,
          status:
            withdrawal.status,
        });
      }

      const user =
        await User.findById(
          withdrawal.userId
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      const amount =
        Number(
          withdrawal.amount || 0
        );

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid withdrawal amount",
        });
      }

      const beforeReserved =
        Number(
          user.reservedBalance || 0
        );

      user.reservedBalance =
        Math.max(
          0,
          beforeReserved - amount
        );

      await user.save();

      withdrawal.status =
        "rejected";

      withdrawal.rejectionReason =
        req.body?.reason ||
        "Rejected by admin";

      withdrawal.processedBy =
        req.user.id;

      withdrawal.processedAt =
        new Date();

      withdrawal.auditTrail =
        withdrawal.auditTrail || [];

      withdrawal.auditTrail.push({
        action:
          "Withdrawal rejected and reserved funds released",
        performedBy:
          req.user.email ||
          String(req.user.id),
        timestamp:
          new Date(),
      });

      await withdrawal.save();

      console.log(
        "WITHDRAWAL REJECTED:",
        String(withdrawal._id),
        "AMOUNT:",
        amount,
        "RESERVED:",
        beforeReserved,
        "->",
        user.reservedBalance
      );

      return res.json({
        success: true,
        message:
          "Withdrawal rejected and reserved funds released",
        withdrawalId:
          withdrawal._id,
        status:
          withdrawal.status,
        balance:
          user.balance,
        reservedBalance:
          user.reservedBalance,
      });

    } catch (err) {
      console.error(
        "REJECT WITHDRAWAL ERROR:",
        err
      );

      return res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

module.exports = router;
