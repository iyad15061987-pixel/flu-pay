const express =
  require("express");

const router =
  express.Router();

const {
  auth,
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

const User =
  require(
    "../models/User"
  );

// =========================
// ACCOUNTING DASHBOARD
// =========================

router.get(
  "/admin/accounting",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.id
        );

      if (
        !user ||
        user.role !==
          "admin"
      ) {
        return res.status(403).json({
          message:
            "Access denied",
        });
      }

      const entries =
        await AccountingEntry.find()
          .sort({
            createdAt: -1,
          })
          .limit(100);

      const transactions =
        await Transaction.find();

      let totalVolume = 0;

      let totalFees = 0;

      transactions.forEach(
        (tx) => {
          totalVolume +=
            tx.amount || 0;

          totalFees +=
            tx.fee || 0;
        }
      );

      res.json({
        totalTransactions:
          transactions.length,

        totalVolume,

        totalFees,

        entries,
      });

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

module.exports =
  router;