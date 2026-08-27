const express = require("express");

const router = express.Router();

const {
  auth,
  adminOnly,
} = require("../middleware/auth");

const AccountingEntry =
  require("../models/AccountingEntry");

const Transaction =
  require("../models/Transaction");

const User =
  require("../models/User");


// =========================
// ACCOUNTING OVERVIEW
// =========================

router.get(
  "/accounting/overview",

  auth,
  adminOnly,

  async (req, res) => {

    try {

      const revenueResult =
        await AccountingEntry.aggregate([
          {
            $match: {
              account: "platform_revenue",
              type: "credit"
            }
          },

          {
            $group: {
              _id: null,

              totalRevenue: {
                $sum: "$amount"
              }
            }
          }
        ]);


      const totalRevenue =
        Number(
          revenueResult[0]?.totalRevenue || 0
        );


      const totalTransactions =
        await Transaction.countDocuments({
          status: "completed"
        });


      const feeResult =
        await Transaction.aggregate([
          {
            $match: {
              status: "completed"
            }
          },

          {
            $group: {
              _id: null,

              totalFees: {
                $sum: "$fee"
              }
            }
          }
        ]);


      const totalFees =
        Number(
          feeResult[0]?.totalFees || 0
        );


      const treasury =
        await User.findOne({
          accountType: "treasury"
        });


      res.json({

        totalRevenue,

        totalTransactions,

        treasuryBalance:
          Number(
            treasury?.balance || 0
          ),

        treasuryRevenue:
          Number(
            treasury?.revenue || 0
          ),

        totalFees,

        status: "active"

      });

    }

    catch (err) {

      console.log(
        "Accounting overview error:",
        err
      );

      res.status(500).json({
        message: "Server error"
      });

    }

  }
);


// =========================
// ACCOUNTING REPORTS
// =========================

router.get(
  "/accounting/reports",

  auth,
  adminOnly,

  async (req, res) => {

    try {

      const entries =
        await AccountingEntry
          .find()
          .sort({
            createdAt: -1
          })
          .limit(100);


      res.json(entries);

    }

    catch (err) {

      console.log(
        "Accounting reports error:",
        err
      );

      res.status(500).json({
        message: "Server error"
      });

    }

  }
);


// =========================
// FINANCIAL DASHBOARD
// =========================

router.get(
  "/accounting/dashboard",

  auth,
  adminOnly,

  async (req, res) => {

    try {

      // =========================
      // CUSTOMER WALLET LIABILITIES
      // =========================

      const balanceResult =
        await User.aggregate([

          {
            $match: {
              role: "user",
              accountType: {
                $ne: "treasury"
              }
            }
          },

          {
            $group: {
              _id: null,

              totalBalance: {
                $sum: "$balance"
              }
            }
          }

        ]);


      const totalWalletBalance =
        Number(
          balanceResult[0]?.totalBalance || 0
        );


      // =========================
      // TOTAL VOLUME
      // =========================

      const volumeResult =
        await Transaction.aggregate([

          {
            $match: {
              status: "completed"
            }
          },

          {
            $group: {
              _id: null,

              volume: {
                $sum: "$amount"
              }
            }
          }

        ]);


      const totalVolume =
        Number(
          volumeResult[0]?.volume || 0
        );


      // =========================
      // CUSTOMER USERS
      // =========================

      const totalUsers =
        await User.countDocuments({
          role: "user"
        });


      // =========================
      // TODAY TRANSFERS
      // =========================

      const start =
        new Date();

      start.setHours(
        0,
        0,
        0,
        0
      );


      const todayTransfers =
        await Transaction.countDocuments({

          status: "completed",

          createdAt: {
            $gte: start
          }

        });


      // =========================
      // TREASURY
      // =========================

      const treasury =
        await User.findOne({
          accountType: "treasury"
        });


      const treasuryBalance =
        Number(
          treasury?.balance || 0
        );


      const treasuryRevenue =
        Number(
          treasury?.revenue || 0
        );


      // =========================
      // PLATFORM REVENUE
      // =========================

      const platformRevenue =
        await AccountingEntry.aggregate([

          {
            $match: {

              account:
                "platform_revenue",

              type:
                "credit"

            }
          },

          {
            $group: {

              _id: null,

              total: {
                $sum: "$amount"
              }

            }
          }

        ]);


      const totalPlatformRevenue =
        Number(
          platformRevenue[0]?.total || 0
        );


      // =========================
      // FINANCIAL HEALTH
      // =========================

      const liabilities =
        totalWalletBalance;


      const reserves =
        treasuryBalance;


      const coverageRatio =
        liabilities > 0
          ? (
              reserves /
              liabilities
            ) * 100
          : 0;


      const treasuryStatus =
        coverageRatio >= 100
          ? "healthy"
          : "critical";


      // =========================
      // LATEST ACCOUNTING
      // =========================

      const latest =
        await AccountingEntry
          .find()
          .sort({
            createdAt: -1
          })
          .limit(10);


      // =========================
      // RESPONSE
      // =========================

      return res.json({

        totalWalletBalance,

        totalVolume,

        totalUsers,

        todayTransfers,

        treasuryBalance,

        treasuryRevenue,

        platformRevenue:
          totalPlatformRevenue,

        liabilities,

        reserves,

        coverageRatio,

        treasuryStatus,

        latest

      });

    }

    catch (err) {

      console.log(
        "Dashboard error:",
        err
      );

      return res.status(500).json({
        message: "Dashboard error"
      });

    }

  }
);


// =========================
// EXPORT
// =========================

module.exports = router;
