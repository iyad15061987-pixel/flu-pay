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
// GET BANK STATUS
// =========================

router.get(
  "/bank/status",

  auth,

  async (req, res) => {
    try {

      return res.json({
        bankConnected:
          true,

        provider:
          "FlowPay Internal Banking",
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
// ADMIN BANK SETTINGS
// =========================

router.post(
  "/bank/settings",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      return res.json({
        message:
          "Bank settings updated",
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