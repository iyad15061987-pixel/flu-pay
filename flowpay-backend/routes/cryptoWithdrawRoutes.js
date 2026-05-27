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

// =========================
// CREATE CRYPTO WITHDRAWAL
// =========================

router.post(
  "/crypto-withdraw",

  auth,

  async (req, res) => {
    try {

      const {
        amount,
        walletAddress,
        coin,
      } = req.body;

      return res.json({
        message:
          "Crypto withdrawal request submitted",

        data: {
          amount,
          walletAddress,
          coin,
          status:
            "pending",
        },
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
// ADMIN CRYPTO WITHDRAWALS
// =========================

router.get(
  "/admin/crypto-withdrawals",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      return res.json([]);

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