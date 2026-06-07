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
// MERCHANT ANALYTICS
// =========================

router.get(
  "/merchant/analytics",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      return res.json({
        totalSales: 0,

        totalTransactions: 0,

        conversionRate: 0,
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
// MERCHANT REPORTS
// =========================

router.get(
  "/merchant/reports",

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