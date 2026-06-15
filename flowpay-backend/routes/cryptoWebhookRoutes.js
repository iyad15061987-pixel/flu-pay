const express =
  require("express");

const router =
  express.Router();

const User =
  require(
    "../models/User"
  );

const Transaction =
  require(
    "../models/Transaction"
  );

const Notification =
  require(
    "../models/Notification"
  );

const createLedgerEntry =
  require(
    "../utils/ledger"
  );

const {
  calculateExternalFee,
} = require(
  "../utils/fees"
  );

// =========================
// NOWPAYMENTS WEBHOOK
// =========================

router.post(
  "/crypto-webhook",

  async (req, res) => {
    try {
      const data =
        req.body;

      console.log(
        "Webhook received:",
        data
      );

      // =========================
      // SUCCESS ONLY
      // =========================

      if (
        data.payment_status !==
        "finished"
      ) {
        return res.json({
          message:
            "Ignored",
        });
      }

      // =========================
      // USER EMAIL
      // =========================

      const email =
        data.order_id;

      const user =
        await User.findOne({
          email,
        });

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      // =========================
// DUPLICATE CHECK
// =========================

const existingTransaction =
  await Transaction.findOne({
    reference:
      data.payment_id,
  });

if (existingTransaction) {

  return res.json({
    message:
      "Already processed",
  });

}

      // =========================
      // AMOUNT
      // =========================

      const amount =
        Number(
          data.price_amount
        );

      const fee =
        calculateExternalFee(
          amount
        );

      const netAmount =
        amount - fee;

      const before =
        user.balance;

      // =========================
      // UPDATE BALANCE
      // =========================

      user.balance +=
        netAmount;

      user.revenue +=
        fee;

      await user.save();

      // =========================
      // TRANSACTION
      // =========================

      await Transaction.create({
        fromEmail:
          "Blockchain",

        toEmail:
          email,

        amount,

        fee,

        netAmount,

        type:
          "Crypto Deposit",

          reference:
  data.payment_id,
  
      });

      // =========================
      // LEDGER
      // =========================

      await createLedgerEntry({
        userId:
          user._id,

        email:
          user.email,

        type:
          "Crypto Deposit",

        amount:
          netAmount,

        balanceBefore:
          before,

        balanceAfter:
          user.balance,

        reference:
          data.payment_id,

        description:
          "Automatic blockchain deposit",
      });

      // =========================
      // NOTIFICATION
      // =========================

      await Notification.create({
        email:
          user.email,

        title:
          "Crypto Deposit",

        message: `Your crypto deposit of $${amount} has been credited.`,
      });

      // =========================
      // LIVE UPDATE
      // =========================

      if (
        global.io
      ) {
        global.io.emit(
          "wallet_update",
          {
            email:
              user.email,
          }
        );
      }

      res.json({
        message:
          "Deposit credited",
      });

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Webhook error",
      });
    }
  }
);

module.exports =
  router;