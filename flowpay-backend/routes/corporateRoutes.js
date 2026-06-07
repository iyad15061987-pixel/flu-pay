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
// CORPORATE ACCOUNTS
// =========================

router.get(
  "/corporate/accounts",

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

// =========================
// CREATE CORPORATE ACCOUNT
// =========================

router.post(
  "/corporate/create",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      const {
        companyName,
      } = req.body;

      return res.json({
        message:
          "Corporate account created",

        companyName,
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