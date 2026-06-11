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

const emit =
  require(
    "../socket/emitter"
  );

const EVENTS =
  require(
    "../socket/events"
  );

const User =
  require(
    "../models/User"
  );

const Transaction =
  require(
    "../models/Transaction"
  );

const createLedgerEntry =
  require(
    "../utils/ledger"
  );

const createNotification =
  require(
    "../utils/createNotification"
  );

const riskEngine =
  require(
    "../utils/riskEngine"
  );

const amlEngine =
  require(
    "../utils/amlEngine"
  );

// =========================
// CREATE DEPOSIT
// =========================

router.post(
  "/deposits",

  auth,

  async (req, res) => {

    try {

      console.log(
  "BODY =",
  req.body
);

console.log(
  "USER ID =",
  req.user.id
);

      const {
        amount,
        method,
        reference,
      } = req.body;

      // =========================
      // USER
      // =========================

      const user =
        await User.findById(
          req.user.id
        );

        console.log(
  "USER =",
  user
);

      if (!user) {

        return res.status(404).json({
          message:
            "User not found",
        });

      }

      if (
        user.frozen
      ) {

        return res.status(403).json({
          message:
            "Account frozen",
        });

      }

      // =========================
      // VALIDATION
      // =========================

      const numericAmount =
        Number(amount);

      if (
        isNaN(
          numericAmount
        ) ||
        numericAmount <= 0
      ) {

        return res.status(400).json({
          message:
            "Invalid amount",
        });

      }

      // =========================
      // AML CHECK
      // =========================

      await amlEngine({
        user,
        amount:
          numericAmount,
      });

      // =========================
      // RISK ENGINE
      // =========================

      const risk =
        await riskEngine({
          user,
          amount:
            numericAmount,
        });

      // =========================
      // BALANCE BEFORE
      // =========================

      const beforeBalance =
        user.balance;

      // =========================
      // UPDATE BALANCE
      // =========================

      user.balance +=
        numericAmount;

      user.totalDeposits +=
        numericAmount;

      await user.save();

      console.log(
  "USER SAVED"
);

      // =========================
      // TRANSACTION
      // =========================

      const transaction =
        await Transaction.create({
          fromEmail:
            "SYSTEM",

          toEmail:
            user.email,

          amount:
            numericAmount,

          fee: 0,

          netAmount:
            numericAmount,

          type:
            "Deposit",

          reference:
            reference ||
            "Wallet funding",

          method:
            method ||
            "paypal",
        });

        console.log(
  "TRANSACTION CREATED"
);

    // =========================
// LEDGER
// =========================

console.log(
  "BEFORE LEDGER"
);

await createLedgerEntry({
  userId:
    user._id,

  email:
    user.email,

  type:
    "Deposit",

  amount:
    numericAmount,

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

console.log(
  "AFTER LEDGER"
);

// =========================
// NOTIFICATION
// =========================

console.log(
  "BEFORE NOTIFICATION"
);

console.log(
  "NOTIFICATION DISABLED TEMPORARILY"
);

console.log(
  "AFTER NOTIFICATION"
);

      // =========================
      // REALTIME EVENTS
      // =========================

      emit(
        EVENTS.WALLET_UPDATE,
        {
          email:
            user.email,

          balance:
            user.balance,
        }
      );

      emit(
        EVENTS.NEW_TRANSACTION,
        transaction
      );

      emit(
        "deposit_created",
        {
          email:
            user.email,

          amount:
            numericAmount,

          method:
            method ||
            "paypal",

          risk:
            risk.level,

          timestamp:
            new Date(),
        }
      );

      // =========================
      // HIGH RISK ALERT
      // =========================

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

      // =========================
      // RESPONSE
      // =========================

      res.json({
        success: true,

        message:
          "Deposit completed successfully",

        balance:
          user.balance,

        transaction,
      });
} catch (err) {

  console.error(
    "DEPOSIT ERROR:",
    err
  );

  res.status(500).json({
    message:
      "Deposit failed",
    error:
      err.message,
  });

}

  }

);

// =========================
// ADMIN DEPOSITS
// =========================

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
          createdAt: -1,
        });

      res.json(
        deposits
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

// =========================
// USER DEPOSITS
// =========================

router.get(
  "/deposits",

  auth,

  async (req, res) => {

    try {

      let user;

try {

  user =
    await User.findById(
      req.user.id
    );

  console.log(
    "USER =",
    user
  );

} catch (err) {

  console.error(
    "USER FIND ERROR =",
    err
  );

  throw err;

}

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
          createdAt: -1,
        });

      res.json(
        deposits
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