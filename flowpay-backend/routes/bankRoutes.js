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

const BankAccount =
  require(
    "../models/BankAccount"
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
// GET VERIFIED BANK ACCOUNT
// =========================

router.get(
  "/bank/account",

  auth,

  async (req, res) => {
    try {

      const account =
        await BankAccount.findOne({
          verified: true,
        }).sort({ createdAt: -1 });

      if (!account) {
        return res.status(404).json({
          message:
            "No verified bank account available",
        });
      }

      return res.json({
        success: true,
        account: {
          bankName: account.bankName,
          accountHolder: account.accountHolder,
          iban: account.iban,
          swift: account.swift,
          country: account.country,
          currency: account.currency,
        },
      });

    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
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
