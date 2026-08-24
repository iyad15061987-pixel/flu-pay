const express = require("express");

const router = express.Router();

const {
  auth,
  adminOnly,
} = require("../middleware/auth");

const emit = require("../socket/emitter");

const EVENTS = require("../socket/events");

const User = require("../models/User");

const Transaction = require("../models/Transaction");

const createLedgerEntry = require("../utils/ledger");

const createNotification = require("../utils/createNotification");

const riskEngine = require("../utils/riskEngine");

const amlEngine = require("../utils/amlEngine");

// ======================================================
// CREATE DEPOSIT
// ======================================================

router.post(
  "/deposits",
  auth,
  async (req, res) => {

    try {

      const {
        amount,
        method,
        reference,
      } = req.body;

      // ==================================================
      // USER
      // ==================================================

      const user = await User.findById(
        req.user.id
      );

      if (!user) {

        return res.status(404).json({
          message: "User not found",
        });

      }

      // ==================================================
      // ACCOUNT STATUS
      // ==================================================

      if (user.frozen) {

        return res.status(403).json({
          message: "Account frozen",
        });

      }

      if (!user.active) {

        return res.status(403).json({
          message: "Account inactive",
        });

      }

      // ==================================================
      // VALIDATION
      // ==================================================

      const numericAmount = Number(amount);

      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {

        return res.status(400).json({
          message: "Invalid amount",
        });

      }

      // ==================================================
      // AML CHECK
      // ==================================================

      await amlEngine({
        user,
        amount: numericAmount,
      });

      // ==================================================
      // RISK ENGINE
      // ==================================================

      const risk = await riskEngine({
        user,
        amount: numericAmount,
      });

      // ==================================================
      // FEE
      // ==================================================

      const fee =
        numericAmount * 0.035;

      const netAmount =
        numericAmount - fee;

      // ==================================================
      // BALANCE BEFORE
      // ==================================================
const beforeBalance =
  user.balance;

// ==================================================
// TREASURY
// ==================================================

const treasury =
  await User.findOne({
    accountType:
      "treasury",
  });

if (!treasury) {
  throw new Error(
    "Treasury account not found"
  );
}

const treasuryBefore =
  treasury.balance;

// ==================================================
// UPDATE BALANCES
// ==================================================

user.balance +=
  netAmount;

user.totalDeposits =
  (user.totalDeposits || 0) +
  numericAmount;

treasury.balance +=
  fee;

treasury.revenue =
  (treasury.revenue || 0) +
  fee;

await user.save();

await treasury.save();

      // ==================================================
      // TRANSACTION
      // ==================================================

      const transaction =
        await Transaction.create({

          fromEmail:
            "SYSTEM",

          toEmail:
            user.email,

          amount:
            numericAmount,

          fee,

          netAmount,

          type:
            "Deposit",

          reference:
            reference ||
            "Wallet funding",

          method:
            method ||
            "manual",

          status:
            "completed",

        });

      // ==================================================
      // LEDGER
      // ==================================================

      await createLedgerEntry({

        userId:
          user._id,

        email:
          user.email,

        type:
          "Deposit",

        amount:
          netAmount,

        balanceBefore:
          beforeBalance,

        balanceAfter:
          user.balance,

        reference:
          reference ||
          "Wallet Funding",

        description:
          "Wallet deposit completed",

      });

      // ==================================================
      // NOTIFICATION
      // ==================================================

      await createNotification({

        email:
          user.email,

        title:
          "Deposit Completed",

        message:
          `Your wallet was funded with $${numericAmount}`,

      });

      // ==================================================
      // REALTIME WALLET UPDATE
      // ==================================================

      emit(
        EVENTS.WALLET_UPDATE,
        {
          email:
            user.email,

          balance:
            user.balance,
        }
      );

      // ==================================================
      // NEW TRANSACTION EVENT
      // ==================================================

      emit(
        EVENTS.NEW_TRANSACTION,
        transaction
      );

      // ==================================================
      // DEPOSIT EVENT
      // ==================================================

      emit(
        "deposit_created",
        {
          email:
            user.email,

          amount:
            numericAmount,

          method:
            method ||
            "manual",

          risk:
            risk.level,

          timestamp:
            new Date(),
        }
      );

      // ==================================================
      // HIGH RISK ALERT
      // ==================================================

      if (
        risk.level ===
        "high"
      ) {

        emit(
          EVENTS.FRAUD_ALERT,
          {
            type:
              "HIGH_RISK_DEPOSIT",

            severity:
              "high",

            user:
              user.email,

            amount:
              numericAmount,

            timestamp:
              new Date(),
          }
        );

      }

      // ==================================================
      // RESPONSE
      // ==================================================

      return res.json({

        success:
          true,

        message:
          "Deposit completed successfully",

        amount:
          numericAmount,

        fee,

        netAmount,

        balance:
          user.balance,

        transaction,

      });

    } catch (err) {

      console.error(
        "DEPOSIT ERROR:",
        err
      );

      return res.status(500).json({

        message:
          "Deposit failed",

        error:
          err.message,

      });

    }

  }
);

// ======================================================
// ADMIN DEPOSITS
// ======================================================

router.get(
  "/admin/deposits",

  auth,

  adminOnly,

  async (req, res) => {

    try {

      const deposits =
        await Transaction.find({
          type:
            "Deposit",
        }).sort({
          createdAt:
            -1,
        });

      return res.json(
        deposits
      );

    } catch (err) {

      console.error(err);

      return res.status(500).json({
        message:
          "Server error",
      });

    }

  }
);

// ======================================================
// USER DEPOSITS
// ======================================================

router.get(
  "/deposits",

  auth,

  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.user.id
        );

      if (!user) {

        return res.status(404).json({
          message:
            "User not found",
        });

      }

      const deposits =
        await Transaction.find({

          toEmail:
            user.email,

          type:
            "Deposit",

        }).sort({

          createdAt:
            -1,

        });

      return res.json(
        deposits
      );

    } catch (err) {

      console.error(err);

      return res.status(500).json({
        message:
          "Server error",
      });

    }

  }
);

module.exports =
  router;