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
// AML CHECK
// =========================

router.get(
  "/aml/check",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      return res.json({
        status:
          "clean",

        flaggedTransactions: 0,
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
// AML REPORTS
// =========================

router.get(
  "/aml/reports",

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