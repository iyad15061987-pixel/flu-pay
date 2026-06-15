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

const Withdrawal =
  require(
    "../models/Withdrawal"
  );

// =========================
// GET ALL WITHDRAWALS
// =========================

router.get(
  "/admin/withdrawals",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      const withdrawals =
        await Withdrawal.find()
          .sort({
            createdAt: -1,
          });

      return res.json(
        withdrawals
      );

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
// APPROVE WITHDRAWAL
// =========================

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

      withdrawal.status =
        "approved";

      withdrawal.processedAt =
        new Date();

      await withdrawal.save();

      return res.json({
        message:
          "Withdrawal approved",
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
// REJECT WITHDRAWAL
// =========================
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

      withdrawal.status =
        "rejected";

      withdrawal.processedAt =
        new Date();

      await withdrawal.save();

      return res.json({
        success: true,
        message:
          "Withdrawal rejected",
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