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

const AccountingEntry =
  require(
    "../models/AccountingEntry"
  );

// =========================
// TREASURY OVERVIEW
// =========================

router.get(
  "/treasury/overview",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      // =========================
      // TREASURY ACCOUNT
      // =========================

      const treasury =
        await User.findOne({
          accountType:
            "treasury",
        }).select(
          "email balance revenue accountType"
        );

      if (!treasury) {
        return res.status(404).json({
          message:
            "Treasury account not found",
        });
      }

      // =========================
      // PLATFORM REVENUE
      // =========================

      const revenueResult =
        await AccountingEntry.aggregate([
          {
            $match: {
              account:
                "platform_revenue",

              type:
                "credit",
            },
          },

          {
            $group: {
              _id:
                null,

              totalRevenue: {
                $sum:
                  "$amount",
              },

              totalFees: {
                $sum:
                  "$amount",
              },

              totalTransactions: {
                $sum:
                  1,
              },
            },
          },
        ]);

      const accounting =
        revenueResult[0] || {
          totalRevenue:
            0,

          totalFees:
            0,

          totalTransactions:
            0,
        };

      // =========================
      // RESPONSE
      // =========================

      return res.json({

        treasury: {
          email:
            treasury.email,

          balance:
            treasury.balance || 0,

          revenue:
            treasury.revenue || 0,
        },

        totalRevenue:
          accounting.totalRevenue || 0,

        totalFees:
          accounting.totalFees || 0,

        totalTransactions:
          accounting.totalTransactions || 0,

        status:
          "active",
      });

    } catch (err) {

      console.log(
        "TREASURY OVERVIEW ERROR:",
        err
      );

      return res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

// =========================
// TREASURY HEALTH
// =========================

router.get(
  "/treasury/health",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      const treasury =
        await User.findOne({
          accountType:
            "treasury",
        }).select(
          "email balance revenue accountType accountStatus"
        );

      if (!treasury) {
        return res.status(404).json({
          status:
            "error",

          treasury:
            "not_found",
        });
      }

      return res.json({

        status:
          "healthy",

        treasury:
          "active",

        account:
          treasury.email,

        balance:
          treasury.balance || 0,

        revenue:
          treasury.revenue || 0,

        accountStatus:
          treasury.accountStatus,
      });

    } catch (err) {

      console.log(
        "TREASURY HEALTH ERROR:",
        err
      );

      return res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

module.exports =
  router;