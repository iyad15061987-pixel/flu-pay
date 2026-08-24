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

const AccountingEntry =
  require(
    "../models/AccountingEntry"
  );

const Transaction =
  require(
    "../models/Transaction"
  );

// =========================
// ACCOUNTING OVERVIEW
// =========================

router.get(
  "/accounting/overview",

  auth,

  adminOnly,

  async (req, res) => {
    try {

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
              _id: null,

              totalRevenue: {
                $sum:
                  "$amount",
              },
            },
          },
        ]);

      const totalRevenue =
        revenueResult[0]
          ?.totalRevenue || 0;

      // =========================
      // TRANSACTIONS
      // =========================

      const totalTransactions =
        await Transaction.countDocuments({
          status:
            "completed",
        });

      // =========================
      // TOTAL FEES
      // =========================

      const feeResult =
        await Transaction.aggregate([
          {
            $match: {
              status:
                "completed",
            },
          },

          {
            $group: {
              _id: null,

              totalFees: {
                $sum:
                  "$fee",
              },
            },
          },
        ]);

      const totalFees =
        feeResult[0]
          ?.totalFees || 0;

      // =========================
      // RESPONSE
      // =========================

      return res.json({
        totalRevenue,

        totalTransactions,

        totalFees,

        status:
          "active",
      });

    } catch (err) {

      console.error(
        "Accounting overview error:",
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
            createdAt:
              -1,
          })
          .limit(100);

      return res.json(
        entries
      );

    } catch (err) {

      console.error(
        "Accounting reports error:",
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