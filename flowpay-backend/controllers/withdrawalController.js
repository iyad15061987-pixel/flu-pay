const emit =
  require(
    "../socket/emitter"
  );

const EVENTS =
  require(
    "../socket/events"
  );

const Withdrawal =
  require(
    "../models/Withdrawal"
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
// CREATE WITHDRAWAL
// =========================

exports.createWithdrawal =
  async (req, res) => {

    try {

      const {
        amount,
        destination,
        method,
      } = req.body;

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

      if (
        user.frozen
      ) {

        return res.status(403).json({
          message:
            "Account frozen",
        });

      }

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

      if (
        user.balance <
        numericAmount
      ) {

        return res.status(400).json({
          message:
            "Insufficient balance",
        });

      }

      const fee =
        numericAmount *
        0.01;

      const netAmount =
        numericAmount -
        fee;

      await amlEngine({
        user,
        amount:
          numericAmount,
      });

      const risk =
        await riskEngine({
          user,
          amount:
            numericAmount,
        });

      const beforeBalance =
        user.balance;

      // =========================
      // UPDATE USER
      // =========================

      user.balance -=
        numericAmount;

      user.totalWithdrawals =
        (user.totalWithdrawals || 0) +
        numericAmount;

      await user.save();

      // =========================
      // WITHDRAWAL RECORD
      // =========================

      const withdrawal =
        await Withdrawal.create({
          userId:
            user._id,

          email:
            user.email,

          amount:
            numericAmount,

          fee,

          netAmount,

          method:
            method ||
            "paypal",

          destination,

          riskLevel:
            risk.level,

          requiresManualReview:
            risk.level ===
            "high",

          ipAddress:
            req.ip,
        });

        console.log(
  "WITHDRAWAL CREATED",
  withdrawal._id
);

      // =========================
      // TRANSACTION RECORD
      // =========================

      await Transaction.create({
        fromEmail:
          user.email,

        toEmail:
          "SYSTEM",

        amount:
          numericAmount,

        fee,

        netAmount,

        type:
          "Withdrawal",

        method:
          method ||
          "paypal",

        reference:
          destination,

        status:
          "completed",
      });

      console.log(
  "TRANSACTION CREATED"
);

      // =========================
      // LEDGER
      // =========================

      await createLedgerEntry({
        userId:
          user._id,

        email:
          user.email,

        type:
          "Withdrawal Request",

        amount:
          numericAmount,

        balanceBefore:
          beforeBalance,

        balanceAfter:
          user.balance,

        reference:
          destination,

        description:
          "Withdrawal submitted",
      });

      console.log(
  "LEDGER CREATED"
);

      // =========================
      // NOTIFICATION
      // =========================

      await createNotification({
        email:
          user.email,

        title:
          "Withdrawal Submitted",

        message:
          `Withdrawal request for $${numericAmount} submitted`,
      });

      console.log(
  "NOTIFICATION CREATED"
);

      // =========================
      // REALTIME EVENTS
      // =========================

      emit(
        "withdrawal_created",
        withdrawal
      );

      emit(
        EVENTS.FRAUD_ALERT,
        {
          type:
            "WITHDRAWAL_REQUEST",

          severity:
            risk.level,

          user:
            user.email,

          amount:
            numericAmount,

          timestamp:
            new Date(),
        }
      );

      // =========================
      // RESPONSE
      // =========================

      res.json({
        success: true,

        message:
          "Withdrawal submitted",

        withdrawal,
      });

    } catch (err) {

      console.error(
  "WITHDRAWAL ERROR:"
);

console.error(err);

console.error(
  err.stack
);

      res.status(500).json({
        message:
          "Withdrawal failed",
      });

    }

  };

// =========================
// USER WITHDRAWALS
// =========================

exports.getUserWithdrawals =
  async (req, res) => {

    try {

      const withdrawals =
        await Withdrawal.find({
          userId:
            req.user.id,
        }).sort({
          createdAt: -1,
        });

      res.json(
        withdrawals
      );

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Server error",
      });

    }

  };

// =========================
// ADMIN WITHDRAWALS
// =========================

exports.getAllWithdrawals =
  async (req, res) => {

    try {

      const withdrawals =
        await Withdrawal.find()
          .sort({
            createdAt: -1,
          });

      res.json(
        withdrawals
      );

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Server error",
      });

    }

  };