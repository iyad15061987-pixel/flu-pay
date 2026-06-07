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
// ACCOUNTING OVERVIEW
// =========================

router.get(
  "/accounting/overview",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      return res.json({
        totalRevenue: 0,

        totalTransactions: 0,

        status:
          "active",
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
// ACCOUNTING REPORTS
// =========================

router.get(
  "/accounting/reports",

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