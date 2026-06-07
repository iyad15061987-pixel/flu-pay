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

      user.balance -=
        numericAmount;

      await user.save();

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

      await createNotification({
        email:
          user.email,

        title:
          "Withdrawal Submitted",

        message:
          `Withdrawal request for $${numericAmount} submitted`,
      });

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

      res.json({
        success: true,

        message:
          "Withdrawal submitted",

        withdrawal,
      });

    } catch (err) {

      console.log(err);

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

      console.log(err);

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

      console.log(err);

      res.status(500).json({
        message:
          "Server error",
      });

    }

  };