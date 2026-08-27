
const express = require("express");

const router = express.Router();

const {
  auth,
  adminOnly,
} = require("../middleware/auth");

const User = require("../models/User");

const AccountingEntry =
  require("../models/AccountingEntry");

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
          accountType: "treasury",
        }).select(
          "email balance revenue accountType accountStatus"
        );

      if (!treasury) {
        return res.status(404).json({
          message: "Treasury account not found",
        });
      }

      // =========================
      // PLATFORM REVENUE
      // =========================

      const revenueResult =
        await AccountingEntry.aggregate([
          {
            $match: {
              account: "platform_revenue",
              type: "credit",
            },
          },

          {
            $group: {
              _id: null,

              totalRevenue: {
                $sum: "$amount",
              },

              totalFees: {
                $sum: "$amount",
              },

              totalTransactions: {
                $sum: 1,
              },
            },
          },
        ]);

      const accounting =
        revenueResult[0] || {
          totalRevenue: 0,
          totalFees: 0,
          totalTransactions: 0,
        };

      // =========================
      // RESPONSE
      // =========================

      return res.json({
        treasury: {
          email: treasury.email,

          balance:
            Number(treasury.balance || 0),

          revenue:
            Number(treasury.revenue || 0),

          accountStatus:
            treasury.accountStatus || "active",
        },

        totalRevenue:
          Number(
            accounting.totalRevenue || 0
          ),

        totalFees:
          Number(
            accounting.totalFees || 0
          ),

        totalTransactions:
          Number(
            accounting.totalTransactions || 0
          ),

        status:
          treasury.accountStatus || "active",
      });
    } catch (err) {
      console.log(
        "TREASURY OVERVIEW ERROR:",
        err
      );

      return res.status(500).json({
        message: "Server error",
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
      // =========================
      // GET TREASURY
      // =========================

      const treasury =
        await User.findOne({
          accountType: "treasury",
        }).select(
          "email balance revenue accountType accountStatus"
        );

      if (!treasury) {
        return res.status(404).json({
          status: "error",
          treasury: "not_found",
        });
      }

      // =========================
      // TREASURY RESERVES
      // =========================

      const reserves =
        Number(treasury.balance || 0);

      // =========================
      // TOTAL USER LIABILITIES
      //
      // Exclude treasury account because
      // treasury funds are reserves, not
      // customer liabilities.
      // =========================

      const liabilityResult =
        await User.aggregate([
          {
            $match: {
              accountType: {
                $ne: "treasury",
              },
            },
          },

          {
            $group: {
              _id: null,

              total:
                {
                  $sum:
                    {
                      $toDouble:
                        {
                          $ifNull: [
                            "$balance",
                            0,
                          ],
                        },
                    },
                },
            },
          },
        ]);

      const liabilities =
        Number(
          liabilityResult[0]?.total || 0
        );

      // =========================
      // COVERAGE RATIO
      // =========================

      const coverageRatio =
        liabilities > 0
          ? (reserves / liabilities) * 100
          : 100;

      // =========================
      // TREASURY STATUS
      // =========================
      //
      // 100% or more = healthy
      // Below 100% = critical
      //

      let status = "critical";

      if (coverageRatio >= 100) {
        status = "healthy";
      }

      // =========================
      // ACCOUNT STATUS
      // =========================

      const accountStatus =
        treasury.accountStatus ||
        "active";

      // =========================
      // FINAL RESPONSE
      // =========================

      return res.json({
        status,

        treasury: "active",

        account:
          treasury.email,

        balance:
          reserves,

        revenue:
          Number(
            treasury.revenue || 0
          ),

        accountStatus,

        liabilities,

        reserves,

        coverageRatio:
          Number(
            coverageRatio.toFixed(4)
          ),
      });
    } catch (err) {
      console.log(
        "TREASURY HEALTH ERROR:",
        err
      );

      return res.status(500).json({
        status: "error",
        message: "Server error",
      });
    }
  }
);

// =========================
// EXPORT ROUTER
// =========================

module.exports = router;

