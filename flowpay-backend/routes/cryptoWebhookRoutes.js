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

  const CryptoPayment =
  require(
    "../models/CryptoPayment"
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

  const crypto =
  require("crypto");

// =========================
// NOWPAYMENTS WEBHOOK
// =========================

router.post(
  "/crypto-webhook",

  async (req, res) => {
    try {
      const data =
        req.body;

        const signature =
  req.headers[
    "x-nowpayments-sig"
  ];

if (!signature) {

  return res.status(401).json({
    message:
      "Missing signature",
  });

}

const hmac =
  crypto
    .createHmac(
      "sha512",
      process.env
        .NOWPAYMENTS_IPN_SECRET
    )
    .update(
      JSON.stringify(data)
    )
    .digest("hex");

if (
  hmac !== signature
) {

  console.log(
    "INVALID WEBHOOK SIGNATURE"
  );

  return res.status(401).json({
    message:
      "Invalid signature",
  });

}

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

      const payment =
  await CryptoPayment.findOne({

    paymentId:
      String(
        data.payment_id
      ),

  });

if (!payment) {

  return res.status(404).json({
    message:
      "Payment not found",
  });

}

const user =
  await User.findById(
    payment.userId
  );

if (!user) {

  return res.status(404).json({
    message:
      "User not found",
  });

}

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

if (
  payment.credited
) {

  return res.json({
    message:
      "Already credited",
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

      payment.credited =
  true;

payment.status =
  data.payment_status;

await payment.save();

      // =========================
      // TRANSACTION
      // =========================

      await Transaction.create({
        fromEmail:
          "Blockchain",

       toEmail:
  user.email,

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