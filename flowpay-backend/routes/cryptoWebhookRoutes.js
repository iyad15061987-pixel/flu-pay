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
  calculateCryptoFee,
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


      // =========================
      // WEBHOOK SIGNATURE
      // =========================

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


      const secret =
        process.env
          .NOWPAYMENTS_IPN_SECRET;


      if (!secret) {

        console.error(
          "NOWPAYMENTS_IPN_SECRET is missing"
        );

        return res.status(500).json({
          message:
            "Webhook configuration error",
        });

      }


      const hmac =
        crypto
          .createHmac(
            "sha512",
            secret
          )
          .update(
            JSON.stringify(data)
          )
          .digest("hex");


      if (
        !crypto.timingSafeEqual(
          Buffer.from(hmac),
          Buffer.from(signature)
        )
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
        "Crypto webhook received:",
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
      // PAYMENT
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

// =========================
// UPDATE PAYMENT STATUS
// =========================

payment.status =
  data.payment_status;

payment.paymentStatus =
  data.payment_status;


payment.cryptoReceived =
  Number(
    data.actually_paid || 0
  );


payment.transactionHash =
  data.payin_hash ||
  data.txid ||
  null;


payment.confirmations =
  Number(
    data.confirmations || 0
  );

      // =========================
      // USER
      // =========================

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


      // =========================
      // DUPLICATE CHECK
      // =========================

      const existingTransaction =
        await Transaction.findOne({

          reference:
            String(
              data.payment_id
            ),

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

payment.priceAmount =
  amount;

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {

        return res.status(400).json({
          message:
            "Invalid crypto payment amount",
        });

      }


      // =========================
      // CRYPTO FEE
      // =========================
      //
      // Crypto:
      // 1%
      // Minimum fee = $1
      //
      // $50  -> $1
      // $100 -> $1
      // $200 -> $2
      // $1000 -> $10
      //
      // =========================

      const fee =
        calculateCryptoFee(
          amount
        );


      const netAmount =
        amount -
        fee;


      if (
        netAmount <= 0
      ) {

        return res.status(400).json({
          message:
            "Amount is too small after crypto fee",
        });

      }


      // =========================
      // BALANCE BEFORE
      // =========================

      const before =
        Number(
          user.balance || 0
        );


      // =========================
      // TREASURY
      // =========================

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


      // =========================
      // UPDATE BALANCES
      // =========================

      user.balance =
        before +
        netAmount;


      user.totalDeposits =
        (user.totalDeposits || 0) +
        amount;


      treasury.balance =
        (treasury.balance || 0) +
        fee;


      treasury.revenue =
        (treasury.revenue || 0) +
        fee;


      await user.save();

      await treasury.save();


      // =========================
      // TRANSACTION
      // =========================

      const transaction =
        await Transaction.create({

          fromEmail:
            "Blockchain",

          toEmail:
            user.email,

          amount:

            amount,

          fee:

            fee,

          netAmount:

            netAmount,

          type:

            "Crypto Deposit",

          method:

            "crypto",

          reference:

            String(
              data.payment_id
            ),

          status:

            "completed",

        });


      // =========================
      // MARK PAYMENT CREDITED
      // =========================

     payment.credited =
  true;

payment.creditedAt =
  new Date();

payment.status =
  "finished";

payment.paymentStatus =
  "finished";

await payment.save();

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
          String(
            data.payment_id
          ),

        description:
          `Automatic blockchain deposit - ${fee.toFixed(4)} USD crypto fee`,

      });


      // =========================
      // NOTIFICATION
      // =========================

      await Notification.create({

        email:
          user.email,

        title:
          "Crypto Deposit",

        message:
          `Your crypto deposit of $${amount.toFixed(2)} was credited. Crypto fee: $${fee.toFixed(2)}. Net amount: $${netAmount.toFixed(2)}.`,

      });


      // =========================
      // LIVE WALLET UPDATE
      // =========================

      if (
        global.io
      ) {

        global.io.emit(
          "wallet_update",
          {

            email:
              user.email,

            balance:
              user.balance,

          }
        );


        global.io.emit(
          "new_transaction",
          transaction
        );

      }


      // =========================
      // RESPONSE
      // =========================

      return res.json({

        success:
          true,

        message:
          "Crypto deposit credited",

        amount:
          amount,

        fee:
          fee,

        netAmount:
          netAmount,

        balance:
          user.balance,

        transactionId:
          transaction._id,

      });


    } catch (err) {

      console.error(
        "CRYPTO WEBHOOK ERROR:",
        err
      );

      return res.status(500).json({

        message:
          "Webhook error",

        error:
          err.message,

      });

    }

  }
);


// =========================
// EXPORT
// =========================

module.exports =
  router;