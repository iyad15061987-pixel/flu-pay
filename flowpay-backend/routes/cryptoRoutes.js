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
// GET CRYPTO STATUS
// =========================

router.get(
  "/crypto/status",

  auth,

  async (req, res) => {
    try {

      return res.json({
        enabled: true,

        supportedCoins: [
          "BTC",
          "ETH",
          "USDT",
        ],
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
// ADMIN CRYPTO SETTINGS
// =========================

router.post(
  "/crypto/settings",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      return res.json({
        message:
          "Crypto settings updated",
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