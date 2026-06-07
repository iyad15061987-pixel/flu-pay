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

const Transaction =
  require(
    "../models/Transaction"
  );

// =========================
// USER TRANSACTIONS
// =========================

router.get(
  "/transactions/:email",

  auth,

  async (req, res) => {
    try {

      // =========================
      // SECURITY CHECK
      // =========================

      if (
        req.user.email !==
          req.params.email &&
        req.user.role !==
          "admin"
      ) {
        return res.status(403).json({
          message:
            "Access denied",
        });
      }

      const txs =
        await Transaction.find({
          $or: [
            {
              fromEmail:
                req.params
                  .email,
            },

            {
              toEmail:
                req.params
                  .email,
            },
          ],
        }).sort({
          createdAt: -1,
        });

      return res.json(
        txs
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
// ADMIN LIVE TRANSACTIONS
// =========================

router.get(
  "/admin/transactions",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      const txs =
        await Transaction.find()
          .sort({
            createdAt: -1,
          })
          .limit(200);

      return res.json(
        txs
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

module.exports =
  router;