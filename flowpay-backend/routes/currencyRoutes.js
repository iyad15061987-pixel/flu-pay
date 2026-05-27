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
// GET CURRENCIES
// =========================

router.get(
  "/currencies",

  auth,

  async (req, res) => {
    try {

      const currencies = [
        "USD",
        "EUR",
        "GBP",
        "ILS",
        "AED",
      ];

      return res.json(
        currencies
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
// ADMIN UPDATE RATES
// =========================

router.post(
  "/currencies/update",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      return res.json({
        message:
          "Currency rates updated",
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