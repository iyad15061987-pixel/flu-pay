const express =
  require("express");

const router =
  express.Router();

const {
  auth,
} = require(
  "../middleware/auth"
);

const BankAccount =
  require(
    "../models/BankAccount"
  );

const Notification =
  require(
    "../models/Notification"
  );

// =========================
// ADD BANK ACCOUNT
// =========================

router.post(
  "/add-bank-account",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const {
        bankName,
        accountHolder,
        iban,
        swift,
        country,
        currency,
      } = req.body;

      const exists =
        await BankAccount.findOne(
          {
            iban,
          }
        );

      if (
        exists
      ) {
        return res.status(400).json({
          message:
            "IBAN already exists",
        });
      }

      const account =
        await BankAccount.create({
          userId:
            req.user.id,

          email:
            req.user.email,

          bankName,

          accountHolder,

          iban,

          swift,

          country,

          currency,
        });

      await Notification.create({
        email:
          req.user.email,

        title:
          "Bank Account Added",

        message:
          "Your bank account has been added successfully.",
      });

      res.json({
        message:
          "Bank account added",

        account,
      });

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

// =========================
// GET USER BANK ACCOUNTS
// =========================

router.get(
  "/bank-accounts",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const accounts =
        await BankAccount.find(
          {
            userId:
              req.user.id,
          }
        ).sort({
          createdAt: -1,
        });

      res.json(
        accounts
      );

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

module.exports =
  router;