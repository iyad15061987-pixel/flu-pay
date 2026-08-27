const express =
  require("express");

const router =
  express.Router();

const {
  auth,
  adminOnly,
} = require("../middleware/auth");

const User =
  require("../models/User");

const Withdrawal =
  require("../models/Withdrawal");

const Transaction =
  require("../models/Transaction");

const createLedgerEntry =
  require("../utils/ledger");

const createNotification =
  require("../utils/createNotification");

const {
  calculateCryptoFee,
} = require("../utils/fees");

const {
  validatePayoutAddress,
  createPayout,
  verifyPayout,
  getPayoutStatus,
  estimateCryptoAmount,
} = require("../utils/nowPaymentsPayout");

// ======================================================
// NOWPAYMENTS IPN CALLBACK
// ======================================================

const NOWPAYMENTS_IPN_URL =
  process.env.NOWPAYMENTS_IPN_URL ||
  "https://flu-pay.onrender.com/api/crypto-webhook";


// ======================================================
// CREATE CRYPTO WITHDRAWAL
// ======================================================

router.post(
  "/crypto-withdraw",
  auth,

  async (req, res) => {

    try {

      const {
        amount,
        walletAddress,
        coin,
      } = req.body;


      // ==================================================
      // VALIDATION
      // ==================================================

      const numericAmount =
        Number(amount);

      if (
        !Number.isFinite(
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
        !walletAddress ||
        typeof walletAddress !==
          "string"
      ) {

        return res.status(400).json({
          message:
            "Crypto wallet address is required",
        });

      }


      if (
        !coin ||
        typeof coin !==
          "string"
      ) {

        return res.status(400).json({
          message:
            "Crypto coin is required",
        });

      }


      const normalizedCoin =
        String(coin)
          .trim()
          .toLowerCase();


      // ==================================================
      // NOWPAYMENTS / FLOWPAY CURRENTLY SUPPORTS TRX
      // ==================================================

      if (
        normalizedCoin !==
        "trx"
      ) {

        return res.status(400).json({
          message:
            "Only TRX crypto withdrawals are currently supported",
        });

      }


      // ==================================================
      // USER
      // ==================================================

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


      // ==================================================
      // ACCOUNT STATUS
      // ==================================================

      if (
        user.frozen
      ) {

        return res.status(403).json({
          message:
            "Account frozen",
        });

      }


      if (
        user.active === false
      ) {

        return res.status(403).json({
          message:
            "Account inactive",
        });

      }


      // ==================================================
      // KYC
      // ==================================================

      if (
        !user.verified
      ) {

        return res.status(403).json({
          message:
            "KYC verification required",
        });

      }

      // ==================================================
      // CRYPTO FEE
      // ==================================================

      const fee =
        Number(
          calculateCryptoFee(
            numericAmount
          )
        );

      // ==================================================
      // VALIDATE FEE
      // ==================================================

      if (
        !Number.isFinite(fee) ||
        fee < 0
      ) {

        return res.status(500).json({
          message:
            "Invalid crypto withdrawal fee",
        });

      }

      // ==================================================
      // NET USD AMOUNT
      // ==================================================

      const netAmount =
        Number(
          (
            numericAmount -
            fee
          ).toFixed(8)
        );

      // ==================================================
      // VALIDATE NET USD AMOUNT
      // ==================================================

      if (
        !Number.isFinite(
          netAmount
        ) ||
        netAmount <= 0
      ) {

        return res.status(400).json({
          message:
            "Amount is too small after crypto fee",
          amount:
            numericAmount,
          fee,
          netAmount,
        });

      }

      // ==================================================
      // BALANCE CHECK
      // ==================================================

      if (
        Number(user.balance || 0) <
        numericAmount
      ) {

        return res.status(400).json({
          message:
            "Insufficient balance",
        });

      }

      // ==================================================
      // USD → TRX ESTIMATE
      // ==================================================
      //
      // IMPORTANT:
      // FlowPay balance remains USD.
      // NOWPayments receives the actual TRX amount.
      //
      // We calculate the TRX amount once when the
      // withdrawal request is created and store it.
      //
      // ==================================================

      let estimate;

      try {

        estimate =
          await estimateCryptoAmount({

            amount:
              netAmount,

            currencyFrom:
              "usd",

            currencyTo:
              "trx",

          });

      } catch (estimateError) {

        console.error(
          "NOWPAYMENTS USD TO TRX ESTIMATE ERROR:",
          estimateError.response?.data ||
          estimateError.message
        );

        return res.status(502).json({
          message:
            "Unable to calculate TRX payout amount",
        });

      }

      // ==================================================
      // VALIDATE ESTIMATE RESPONSE
      // ==================================================

      if (
        !estimate ||
        String(
          estimate.currency_from ||
          ""
        ).toLowerCase() !==
          "usd" ||
        String(
          estimate.currency_to ||
          ""
        ).toLowerCase() !==
          "trx"
      ) {

        console.error(
          "Invalid NOWPayments estimate response:",
          estimate
        );

        return res.status(502).json({
          message:
            "Invalid USD to TRX conversion response",
        });

      }

      // ==================================================
      // TRX PAYOUT AMOUNT
      // ==================================================

      const payoutAmount =
        Number(
          estimate.estimated_amount
        );

      // ==================================================
      // PAYOUT AMOUNT PROTECTION
      // ==================================================

      if (
        !Number.isFinite(
          payoutAmount
        ) ||
        payoutAmount <= 0
      ) {

        console.error(
          "Invalid TRX payout amount:",
          estimate
        );

        return res.status(502).json({
          message:
            "Unable to calculate a valid TRX payout amount",
        });

      }

      // ==================================================
      // TRX DECIMAL NORMALIZATION
      // ==================================================
      //
      // NOWPayments payout currently uses up to 6
      // decimal places in our integration.
      //
      // ==================================================

      const normalizedPayoutAmount =
        Number(
          payoutAmount.toFixed(6)
        );

      if (
        !Number.isFinite(
          normalizedPayoutAmount
        ) ||
        normalizedPayoutAmount <= 0
      ) {

        return res.status(502).json({
          message:
            "Invalid normalized TRX payout amount",
        });

      }

      // ==================================================
      // EXCHANGE RATE PROTECTION
      // ==================================================

      const exchangeRate =
        Number(
          (
            normalizedPayoutAmount /
            netAmount
          ).toFixed(12)
        );

      if (
        !Number.isFinite(
          exchangeRate
        ) ||
        exchangeRate <= 0
      ) {

        return res.status(502).json({
          message:
            "Invalid USD to TRX exchange rate",
        });

      }

      // ==================================================
      // FINAL PAYOUT DATA
      // ==================================================

      const payoutCurrency =
        "TRX";

      if (
        payoutCurrency !==
        normalizedCoin.toUpperCase()
      ) {

        return res.status(400).json({
          message:
            "Payout currency mismatch",
        });

      }

      console.log(
        "FLOWPAY CRYPTO WITHDRAWAL CALCULATION:",
        JSON.stringify(
          {
            amountUSD:
              numericAmount,

            feeUSD:
              fee,

            netAmountUSD:
              netAmount,

            payoutCurrency,

            payoutAmountTRX:
              normalizedPayoutAmount,

            exchangeRate,

            walletAddress,

          },
          null,
          2
        )
      );
// ==================================================
// BALANCE
// ==================================================

if (
  Number(user.balance || 0) <
  numericAmount
) {

  return res.status(400).json({
    message:
      "Insufficient balance",
  });

}

      // ==================================================
      // BALANCE
      // ==================================================

      if (
        Number(user.balance || 0) <
        numericAmount
      ) {

        return res.status(400).json({
          message:
            "Insufficient balance",
        });

      }


      // ==================================================
      // DUPLICATE WITHDRAWAL PROTECTION
      // ==================================================

      const existingWithdrawal =
        await Withdrawal.findOne({

          userId:
            user._id,

          method:
            "crypto",

          status: {
            $in: [
              "pending",
              "awaiting_2fa",
              "processing",
            ],
          },

          destination:
            walletAddress,

        });


      if (
        existingWithdrawal
      ) {

        return res.status(409).json({
          message:
            "A crypto withdrawal to this wallet is already pending",
        });

      }


      // ==================================================
      // BALANCE BEFORE
      // ==================================================

      const beforeBalance =
        Number(
          user.balance || 0
        );


      // ==================================================
      // RESERVE FUNDS
      // ==================================================

      user.balance =
  Number(
    (beforeBalance - numericAmount).toFixed(8)
  );

      user.totalWithdrawals =
        Number(
          user.totalWithdrawals || 0
        ) +
        numericAmount;


      await user.save();


      // ==================================================
      // CREATE WITHDRAWAL
      // ==================================================

      let withdrawal;


      try {

        withdrawal =
          await Withdrawal.create({

            userId:
              user._id,

            email:
              user.email,

            amount:
              numericAmount,

            fee,

            netAmount,

            currency:
              "USD",

              payoutCurrency:
  "TRX",

payoutAmount:
  normalizedPayoutAmount,

exchangeRate:
  exchangeRate,

            method:
              "crypto",

            destination:
              walletAddress,

            status:
              "pending",

            riskLevel:
              "low",

            requiresManualReview:
              true,

            ipAddress:
              req.ip,

            auditTrail: [
              {
                action:
                  "Crypto withdrawal requested",

                performedBy:
                  user.email,

                timestamp:
                  new Date(),
              },
            ],

          });

      } catch (withdrawalError) {

        user.balance =
          beforeBalance;

        user.totalWithdrawals =
          Math.max(
            0,
            Number(
              user.totalWithdrawals || 0
            ) -
            numericAmount
          );

        await user.save();

        throw withdrawalError;
      }


      // ==================================================
      // TRANSACTION
      // ==================================================

      let transaction;


      try {

        transaction =
          await Transaction.create({

            fromEmail:
              user.email,

            toEmail:
              "BLOCKCHAIN",

            amount:
              numericAmount,

            fee,

            netAmount,

            type:
              "Crypto Withdrawal",

            method:
              "crypto",

            reference:
              walletAddress,

            status:
              "pending",

          });

      } catch (transactionError) {

        user.balance =
          beforeBalance;

        user.totalWithdrawals =
          Math.max(
            0,
            Number(
              user.totalWithdrawals || 0
            ) -
            numericAmount
          );

        await user.save();

        await Withdrawal.findByIdAndDelete(
          withdrawal._id
        );

        throw transactionError;
      }


      // ==================================================
      // LEDGER
      // ==================================================

      try {

        await createLedgerEntry({

          userId:
            user._id,

          email:
            user.email,

          type:
            "Crypto Withdrawal",

          amount:
            numericAmount,

          balanceBefore:
            beforeBalance,

          balanceAfter:
            user.balance,

          reference:
            walletAddress,

          description:
            `Crypto withdrawal request - ${normalizedCoin.toUpperCase()}`,

        });

      } catch (ledgerError) {

        console.error(
          "Crypto withdrawal ledger error:",
          ledgerError
        );

      }


      // ==================================================
      // NOTIFICATION
      // ==================================================

      try {

        await createNotification({

          email:
            user.email,

          title:
            "Crypto Withdrawal Submitted",

          message:
            `Your ${normalizedCoin.toUpperCase()} withdrawal of $${numericAmount.toFixed(
              2
            )} has been submitted for review.`,

        });

      } catch (notificationError) {

        console.error(
          "Crypto withdrawal notification error:",
          notificationError
        );

      }


      // ==================================================
      // RESPONSE
      // ==================================================

      return res.status(201).json({

        success:
          true,

        message:
          "Crypto withdrawal request submitted",

      withdrawal: {

  id:
    withdrawal._id,

  amount:
    numericAmount,

  currency:
    "USD",

  fee,

  netAmount,

  payoutCurrency:
    "TRX",

payoutAmount:
  normalizedPayoutAmount,

  exchangeRate,

  coin:
    "TRX",

  walletAddress,

  status:
    "pending",

},

        transactionId:
          transaction._id,

        balance:
          user.balance,

      });


    } catch (err) {

      console.error(
        "CRYPTO WITHDRAWAL ERROR:",
        err
      );

      return res.status(500).json({

        message:
          "Crypto withdrawal failed",

        error:
          err.message,

      });

    }

  }
);


// ======================================================
// USER CRYPTO WITHDRAWALS
// ======================================================

router.get(
  "/crypto-withdrawals",

  auth,

  async (req, res) => {

    try {

      const withdrawals =
        await Withdrawal.find({

          userId:
            req.user.id,

          method:
            "crypto",

        }).sort({

          createdAt:
            -1,

        });


      return res.json(
        withdrawals
      );


    } catch (err) {

      console.error(
        "USER CRYPTO WITHDRAWALS ERROR:",
        err
      );

      return res.status(500).json({

        message:
          "Server error",

      });

    }

  }
);


// ======================================================
// ADMIN CRYPTO WITHDRAWALS
// ======================================================

router.get(
  "/admin/crypto-withdrawals",

  auth,

  adminOnly,

  async (req, res) => {

    try {

      const withdrawals =
        await Withdrawal.find({

          method:
            "crypto",

        }).sort({

          createdAt:
            -1,

        });


      return res.json(
        withdrawals
      );


    } catch (err) {

      console.error(
        "ADMIN CRYPTO WITHDRAWALS ERROR:",
        err
      );

      return res.status(500).json({

        message:
          "Server error",

      });

    }

  }
);


// ======================================================
// ADMIN APPROVE CRYPTO WITHDRAWAL
// ======================================================
//
// IMPORTANT:
//
// This creates the NOWPayments payout request.
//
// It DOES NOT submit the 2FA verification code.
//
// The withdrawal becomes:
//
// awaiting_2fa
//
// ======================================================
// ======================================================
// ADMIN APPROVE CRYPTO WITHDRAWAL
// ======================================================
//
// Creates the NOWPayments payout request.
// Does NOT submit the 2FA verification code.
//
// Flow:
// pending -> awaiting_2fa
//
// IMPORTANT:
// The user's USD balance was already reserved
// when the withdrawal was created.
// This route MUST NOT deduct the user's balance again.
// ======================================================

router.post(
  "/admin/crypto-withdrawals/:id/approve",

  auth,

  adminOnly,

  async (req, res) => {

    try {

      // ==================================================
      // FIND WITHDRAWAL
      // ==================================================

      const withdrawal =
        await Withdrawal.findOne({

          _id:
            req.params.id,

          method:
            "crypto",

        });


      if (!withdrawal) {

        return res.status(404).json({

          message:
            "Crypto withdrawal not found",

        });

      }


      // ==================================================
      // PREVENT DUPLICATE PAYOUT
      // ==================================================

      if (
        withdrawal.nowPaymentsWithdrawalId ||
        withdrawal.nowPaymentsBatchId
      ) {

        return res.status(409).json({

          message:
            "NOWPayments payout has already been created for this withdrawal",

          nowPaymentsBatchId:
            withdrawal.nowPaymentsBatchId,

          nowPaymentsWithdrawalId:
            withdrawal.nowPaymentsWithdrawalId,

          status:
            withdrawal.status,

        });

      }


      // ==================================================
      // STATUS MUST BE PENDING
      // ==================================================

      if (
        withdrawal.status !==
        "pending"
      ) {

        return res.status(400).json({

          message:
            `Withdrawal cannot be approved from ${withdrawal.status} status`,

        });

      }


      // ==================================================
      // ONLY TRX IS CURRENTLY SUPPORTED
      // ==================================================

      const payoutCurrency =
        String(
          withdrawal.payoutCurrency || ""
        )
          .trim()
          .toUpperCase();


      if (
        payoutCurrency !==
        "TRX"
      ) {

        return res.status(400).json({

          message:
            "Only TRX payout currency is currently supported",

        });

      }


      // ==================================================
      // VALIDATE DESTINATION
      // ==================================================

      const destination =
        String(
          withdrawal.destination || ""
        )
          .trim();


      if (
        !destination
      ) {

        return res.status(400).json({

          message:
            "Crypto destination address is missing",

        });

      }


      // ==================================================
      // VALIDATE FLOWPAY USD AMOUNT
      // ==================================================

      const netAmount =
        Number(
          withdrawal.netAmount
        );


      if (
        !Number.isFinite(
          netAmount
        ) ||
        netAmount <= 0
      ) {

        return res.status(400).json({

          message:
            "Invalid withdrawal net amount",

        });

      }


      // ==================================================
      // VALIDATE STORED TRX PAYOUT AMOUNT
      // ==================================================

      const payoutAmount =
        Number(
          withdrawal.payoutAmount
        );


      if (
        !Number.isFinite(
          payoutAmount
        ) ||
        payoutAmount <= 0
      ) {

        console.error(
          "Invalid TRX payout amount:",
          withdrawal.payoutAmount
        );

        return res.status(400).json({

          message:
            "Invalid TRX payout amount",

        });

      }


      // ==================================================
      // VALIDATE EXCHANGE RATE
      // ==================================================

      const exchangeRate =
        Number(
          withdrawal.exchangeRate
        );


      if (
        !Number.isFinite(
          exchangeRate
        ) ||
        exchangeRate <= 0
      ) {

        console.error(
          "Invalid stored exchange rate:",
          withdrawal.exchangeRate
        );

        return res.status(400).json({

          message:
            "Invalid stored exchange rate",

        });

      }


      // ==================================================
      // PAYOUT AMOUNT PROTECTION
      //
      // payoutAmount must approximately equal:
      //
      // netAmount * exchangeRate
      //
      // We allow a very small rounding difference only.
      // ==================================================

      const calculatedPayoutAmount =
        netAmount *
        exchangeRate;


      const payoutDifference =
        Math.abs(
          payoutAmount -
          calculatedPayoutAmount
        );


      const payoutTolerance =
        Math.max(
          0.000001,
          calculatedPayoutAmount *
            0.0001
        );


      if (
        payoutDifference >
        payoutTolerance
      ) {

        console.error(
          "PAYOUT AMOUNT MISMATCH:",
          {
            payoutAmount,
            calculatedPayoutAmount,
            exchangeRate,
            netAmount,
            payoutDifference,
            payoutTolerance,
          }
        );

        return res.status(409).json({

          message:
            "Stored TRX payout amount does not match the stored exchange rate",

        });

      }


      // ==================================================
      // VALIDATE TRX ADDRESS WITH NOWPAYMENTS
      // ==================================================

      const validation =
        await validatePayoutAddress({

          address:
            destination,

          currency:
            "trx",

        });


      console.log(
        "NOWPAYMENTS TRX ADDRESS VALIDATION:",
        validation
      );


      // ==================================================
      // CREATE UNIQUE EXTERNAL ID
      // ==================================================

      const uniqueExternalId =
        `flowpay-withdrawal-${String(
          withdrawal._id
        )}`;


      // ==================================================
      // CREATE NOWPAYMENTS PAYOUT
      //
      // IMPORTANT:
      // amount is TRX, NOT USD.
      // ==================================================

      const payout =
        await createPayout({

          address:
            destination,

          amount:
            payoutAmount,

          uniqueExternalId,

          ipnCallbackUrl:
            NOWPAYMENTS_IPN_URL,

          description:
            `FlowPay TRX withdrawal ${withdrawal._id}`,

        });


      console.log(
        "NOWPAYMENTS PAYOUT CREATED:",
        JSON.stringify(
          payout,
          null,
          2
        )
      );


      // ==================================================
      // EXTRACT BATCH ID
      // ==================================================

      const batchId =
        payout.id ||
        payout.batch_id ||
        null;


      // ==================================================
      // EXTRACT WITHDRAWAL ID
      // ==================================================

      const payoutWithdrawal =
        Array.isArray(
          payout.withdrawals
        )
          ? payout.withdrawals[0]
          : null;


      const payoutWithdrawalId =
        payoutWithdrawal?.id ||
        payoutWithdrawal?.withdrawal_id ||
        null;


      // ==================================================
      // VERIFY NOWPAYMENTS RESPONSE
      // ==================================================

      if (
        !batchId ||
        !payoutWithdrawalId
      ) {

        console.error(
          "Unexpected NOWPayments payout response:",
          payout
        );

        return res.status(502).json({

          message:
            "NOWPayments payout was created but required payout identifiers were not returned",

        });

      }

// ==================================================
// SAVE NOWPAYMENTS DATA SAFELY
// ==================================================

try {

  withdrawal.nowPaymentsBatchId =
    String(batchId);


  withdrawal.nowPaymentsWithdrawalId =
    String(payoutWithdrawalId);


  withdrawal.externalTransactionId =
    String(payoutWithdrawalId);


  withdrawal.nowPaymentsStatus =
    payoutWithdrawal?.status ||
    payout.status ||
    "waiting";


  // ===============================
  // STATUS FLOW
  // pending
  // ->
  // awaiting_2fa
  // ===============================

  withdrawal.status =
    "awaiting_2fa";


  withdrawal.processedBy =
    req.user.email ||
    String(req.user.id);


  withdrawal.processedAt =
    new Date();


  if (
    !Array.isArray(
      withdrawal.auditTrail
    )
  ) {

    withdrawal.auditTrail = [];

  }


  withdrawal.auditTrail.push({

    action:
      "NOWPayments payout created - waiting for 2FA verification",

    performedBy:
      req.user.email ||
      String(req.user.id),

    timestamp:
      new Date(),

  });


  await withdrawal.save();


} catch (saveError) {


  console.error(
    "SAVE NOWPAYMENTS WITHDRAWAL ERROR:",
    saveError
  );


  return res.status(500).json({

    message:
      "Payout created but failed to update FlowPay withdrawal record. Manual review required.",

    payoutId:
      String(
        payoutWithdrawalId
      ),

  });

}

      // ==================================================
      // NOTIFICATION
      // ==================================================

      try {

        await createNotification({

          email:
            withdrawal.email,

          title:
            "Crypto Withdrawal Awaiting 2FA",

          message:
            `Your TRX withdrawal of $${Number(
              withdrawal.amount
            ).toFixed(
              2
            )} has been approved and is awaiting payout verification.`,

        });

      } catch (
        notificationError
      ) {

        console.error(
          "Crypto approval notification error:",
          notificationError
        );

      }


      // ==================================================
      // RESPONSE
      // ==================================================

      return res.json({

        success:
          true,

        message:
          "NOWPayments payout created and is awaiting 2FA verification",

        withdrawalId:
          withdrawal._id,

        nowPaymentsBatchId:
          withdrawal.nowPaymentsBatchId,

        nowPaymentsWithdrawalId:
          withdrawal.nowPaymentsWithdrawalId,

        payoutCurrency:
          withdrawal.payoutCurrency,

        payoutAmount:
          withdrawal.payoutAmount,

        exchangeRate:
          withdrawal.exchangeRate,

        status:
          withdrawal.status,

      });


    } catch (err) {

      console.error(
        "APPROVE CRYPTO WITHDRAWAL ERROR:",
        err
      );


      console.error(
        "NOWPAYMENTS ERROR:",
        err.response?.data ||
        err.message
      );


      return res.status(502).json({

        message:
          "NOWPayments crypto payout creation failed",

        error:
          err.response?.data ||
          err.message,

      });

    }

  }
);
// ======================================================
// ADMIN VERIFY CRYPTO PAYOUT - 2FA
// ======================================================
//
// This submits the NOWPayments 2FA verification code.
//
// IMPORTANT:
//
// 2FA verification does NOT mean the payout is completed.
//
// Flow:
//
// awaiting_2fa
//      ↓
// NOWPayments verify
//      ↓
// processing / waiting
//      ↓
// status endpoint / webhook
//      ↓
// completed
//
// ======================================================

router.post(
  "/admin/crypto-withdrawals/:id/verify",

  auth,

  adminOnly,

  async (req, res) => {

    try {

      // ==================================================
      // VALIDATE VERIFICATION CODE
      // ==================================================

      const verificationCode =
        String(
          req.body?.verificationCode || ""
        ).trim();


      if (
        !verificationCode
      ) {

        return res.status(400).json({

          message:
            "2FA verification code is required",

        });

      }


      // ==================================================
      // FIND WITHDRAWAL
      // ==================================================

      const withdrawal =
        await Withdrawal.findOne({

          _id:
            req.params.id,

          method:
            "crypto",

        });


      if (!withdrawal) {

        return res.status(404).json({

          message:
            "Crypto withdrawal not found",

        });

      }


      // ==================================================
      // STATUS MUST BE AWAITING 2FA
      // ==================================================

      if (
        withdrawal.status !==
        "awaiting_2fa"
      ) {

        return res.status(400).json({

          message:
            `Withdrawal cannot be verified from ${withdrawal.status} status`,

        });

      }


      // ==================================================
      // REQUIRED NOWPAYMENTS IDS
      // ==================================================

      if (
        !withdrawal.nowPaymentsWithdrawalId
      ) {

        return res.status(400).json({

          message:
            "NOWPayments withdrawal ID is missing",

        });

      }


      // ==================================================
      // PREVENT INVALID PAYOUT STATE
      // ==================================================

      if (
        withdrawal.nowPaymentsStatus ===
        "finished" ||
        withdrawal.nowPaymentsStatus ===
        "completed"
      ) {

        return res.status(409).json({

          message:
            "NOWPayments payout is already completed",

          status:
            withdrawal.status,

          nowPaymentsStatus:
            withdrawal.nowPaymentsStatus,

        });

      }


      // ==================================================
      // VERIFY NOWPAYMENTS 2FA
      // ==================================================

      const verification =
        await verifyPayout({

          batchWithdrawalId:
            withdrawal.nowPaymentsWithdrawalId,

          verificationCode,

        });


      console.log(
        "NOWPAYMENTS VERIFY RESPONSE:",
        JSON.stringify(
          verification,
          null,
          2
        )
      );


      // ==================================================
      // VERIFY RESPONSE
      // ==================================================

      if (
        !verification
      ) {

        return res.status(502).json({

          message:
            "NOWPayments returned an empty verification response",

        });

      }


      // ==================================================
      // EXTRACT STATUS
      // ==================================================

      const nowPaymentsStatus =
        String(
          verification.status ||
          verification.withdrawal_status ||
          "processing"
        )
          .trim()
          .toLowerCase();


      // ==================================================
      // MAP NOWPAYMENTS STATUS
      //
      // IMPORTANT:
      // Verification success does NOT mean completed.
      // ==================================================

      let internalStatus =
        "processing";


      if (
        [
          "finished",
          "completed",
          "confirmed",
        ].includes(
          nowPaymentsStatus
        )
      ) {

        internalStatus =
          "processing";

      }

if (
  [
    "failed",
    "error",
    "rejected",
    "cancelled",
  ].includes(
    nowPaymentsStatus
  )
) {


  withdrawal.status =
    "failed";


  withdrawal.nowPaymentsStatus =
    nowPaymentsStatus;


  withdrawal.processedBy =
    req.user.id;


  withdrawal.processedAt =
    new Date();


  withdrawal.auditTrail =
    withdrawal.auditTrail || [];


  withdrawal.auditTrail.push({

    action:
      "NOWPayments rejected payout after 2FA verification",

    performedBy:
      req.user.email ||
      String(req.user.id),

    timestamp:
      new Date(),

  });


  await withdrawal.save();


  return res.status(502).json({

    message:
      "NOWPayments rejected the payout after 2FA verification",

    nowPaymentsStatus,

    withdrawalId:
      withdrawal._id,

  });

}

      // ==================================================
      // UPDATE WITHDRAWAL
      // ==================================================

      withdrawal.status =
        internalStatus;


      withdrawal.nowPaymentsStatus =
        nowPaymentsStatus;


      withdrawal.processedBy =
        req.user.id;


      withdrawal.processedAt =
        new Date();


      withdrawal.auditTrail =
        withdrawal.auditTrail || [];


      withdrawal.auditTrail.push({

        action:
          "NOWPayments payout 2FA verification accepted; payout is processing",

        performedBy:
          req.user.email ||
          String(
            req.user.id
          ),

        timestamp:
          new Date(),

      });


      await withdrawal.save();


      // ==================================================
      // NOTIFICATION
      // ==================================================

      try {

        await createNotification({

          email:
            withdrawal.email,

          title:
            "Crypto Withdrawal Processing",

          message:
            `Your TRX withdrawal of $${Number(
              withdrawal.amount
            ).toFixed(
              2
            )} has passed payout verification and is now processing.`,

        });

      } catch (
        notificationError
      ) {

        console.error(
          "Crypto verification notification error:",
          notificationError
        );

      }


      // ==================================================
      // RESPONSE
      // ==================================================

      return res.json({

        success:
          true,

        message:
          "Payout 2FA verification accepted; payout is processing",

        withdrawalId:
          withdrawal._id,

        status:
          withdrawal.status,

        nowPaymentsStatus:
          withdrawal.nowPaymentsStatus,

        nowPaymentsWithdrawalId:
          withdrawal.nowPaymentsWithdrawalId,

      });


    } catch (err) {

      console.error(
        "VERIFY CRYPTO PAYOUT ERROR:",
        err
      );


      console.error(
        "NOWPAYMENTS VERIFY ERROR:",
        err.response?.data ||
        err.message
      );


      return res.status(502).json({

        message:
          "NOWPayments payout verification failed",

        error:
          err.response?.data ||
          err.message,

      });

    }

  }
);
// ======================================================
// ADMIN CHECK NOWPAYMENTS PAYOUT STATUS
// ======================================================
//
// NOWPayments status flow:
//
// waiting / pending / processing
//        ↓
//     processing
//
// finished / completed / confirmed
//        ↓
//     completed
//
// failed / rejected / cancelled
//        ↓
//     rejected + USD refund
//
// IMPORTANT:
// - 2FA verification does NOT mean completed.
// - USD balance was already reserved at withdrawal creation.
// - Failed payout refunds the original USD withdrawal amount.
// - fundsRefunded protects against normal duplicate refunds.
// ======================================================

router.get(
  "/admin/crypto-withdrawals/:id/status",

  auth,

  adminOnly,

  async (req, res) => {

    try {

      // ==================================================
      // FIND WITHDRAWAL
      // ==================================================

      const withdrawal =
        await Withdrawal.findOne({

          _id:
            req.params.id,

          method:
            "crypto",

        });


      if (!withdrawal) {

        return res.status(404).json({

          message:
            "Crypto withdrawal not found",

        });

      }


      // ==================================================
      // ALREADY COMPLETED
      // ==================================================

      if (
        withdrawal.status ===
        "completed"
      ) {

        return res.json({

          success:
            true,

          message:
            "Withdrawal is already completed",

          flowpayStatus:
            "completed",

          nowPaymentsStatus:
            withdrawal.nowPaymentsStatus,

          withdrawal,

        });

      }


      // ==================================================
      // ALREADY REFUNDED
      // ==================================================

      if (
        withdrawal.fundsRefunded ===
        true
      ) {

        return res.json({

          success:
            true,

          message:
            "Withdrawal was already refunded",

          flowpayStatus:
            withdrawal.status,

          nowPaymentsStatus:
            withdrawal.nowPaymentsStatus,

          withdrawal,

        });

      }


      // ==================================================
      // NOWPAYMENTS ID CHECK
      // ==================================================

      if (
        !withdrawal.nowPaymentsWithdrawalId
      ) {

        return res.status(400).json({

          message:
            "NOWPayments withdrawal ID is missing",

        });

      }


      // ==================================================
      // GET NOWPAYMENTS STATUS
      // ==================================================

      const status =
        await getPayoutStatus(

          withdrawal.nowPaymentsWithdrawalId

        );


      console.log(
        "NOWPAYMENTS PAYOUT STATUS:",
        JSON.stringify(
          status,
          null,
          2
        )
      );


      // ==================================================
      // VALIDATE RESPONSE
      // ==================================================

      if (
        !status
      ) {

        return res.status(502).json({

          message:
            "NOWPayments returned an empty payout status",

        });

      }


      // ==================================================
      // NORMALIZE STATUS
      // ==================================================

      const nowStatus =
        String(
          status.status ||
          ""
        )
          .trim()
          .toLowerCase();


      // ==================================================
      // SAVE NOWPAYMENTS STATUS
      // ==================================================

      withdrawal.nowPaymentsStatus =
        status.status ||
        withdrawal.nowPaymentsStatus;


      // ==================================================
      // COMPLETED
      // ==================================================

      if (
        [
          "finished",
          "completed",
          "confirmed",
        ].includes(
          nowStatus
        )
      ) {

        withdrawal.status =
          "completed";

// ==================================================
// UPDATE TRANSACTION STATUS
// ==================================================

await Transaction.findOneAndUpdate(

  {
    reference:
      withdrawal.destination,

    type:
      "Crypto Withdrawal",
  },

  {
    status:
      "completed",
  }

);

        withdrawal.processedAt =
          new Date();


        withdrawal.auditTrail =
          withdrawal.auditTrail || [];


        withdrawal.auditTrail.push({

          action:
            `NOWPayments payout completed successfully: ${status.status}`,

          performedBy:
            req.user.email ||
            String(
              req.user.id
            ),

          timestamp:
            new Date(),

        });


        await withdrawal.save();


        // ==============================================
        // NOTIFICATION
        // ==============================================

        try {

          await createNotification({

            email:
              withdrawal.email,

            title:
              "Crypto Withdrawal Completed",

            message:
              `Your TRX crypto withdrawal of $${Number(
                withdrawal.amount || 0
              ).toFixed(
                2
              )} has been completed successfully.`,

          });

        } catch (
          notificationError
        ) {

          console.error(
            "Crypto completion notification error:",
            notificationError
          );

        }


        return res.json({

          success:
            true,

          message:
            "Crypto payout completed successfully",

          flowpayStatus:
            "completed",

          nowPaymentsStatus:
            status.status,

          withdrawal,

        });

      }


      // ==================================================
      // FAILED / REJECTED / CANCELLED
      // ==================================================

      if (
        [
          "failed",
          "rejected",
          "cancelled",
        ].includes(
          nowStatus
        )
      ) {

        // ==============================================
        // FIND USER
        // ==============================================

        const user =
          await User.findById(
            withdrawal.userId
          );


        if (!user) {

          return res.status(404).json({

            message:
              "User not found for refund",

          });

        }


        // ==============================================
        // DOUBLE REFUND PROTECTION
        // ==============================================

        if (
          withdrawal.fundsRefunded ===
          true
        ) {

          withdrawal.status =
            "rejected";


          withdrawal.nowPaymentsStatus =
            status.status;


          await withdrawal.save();


          return res.json({

            success:
              true,

            message:
              "Payout failed; funds were already refunded",

            flowpayStatus:
              "rejected",

            nowPaymentsStatus:
              status.status,

            withdrawal,

          });

        }


        // ==============================================
        // REFUND ORIGINAL USD AMOUNT
        // ==============================================

        const refundAmount =
          Number(
            withdrawal.amount || 0
          );


        if (
          !Number.isFinite(
            refundAmount
          ) ||
          refundAmount <= 0
        ) {

          return res.status(500).json({

            message:
              "Invalid withdrawal amount; refund was not processed",

          });

        }


        // ==============================================
        // CURRENT BALANCE
        // ==============================================

        const balanceBeforeRefund =
          Number(
            user.balance || 0
          );


        if (
          !Number.isFinite(
            balanceBeforeRefund
          )
        ) {

          return res.status(500).json({

            message:
              "Invalid user balance; refund was not processed",

          });

        }


        // ==============================================
        // ADD USD BACK
        // ==============================================

        user.balance =
          balanceBeforeRefund +
          refundAmount;


        user.totalWithdrawals =
          Math.max(

            0,

            Number(
              user.totalWithdrawals || 0
            ) -
            refundAmount

          );


        await user.save();

// ==============================================
// REFUND LEDGER ENTRY
// ==============================================

await createLedgerEntry({

  userId:
    user._id,

  email:
    user.email,

  type:
    "Crypto Withdrawal Refund",

  amount:
    refundAmount,

  balanceBefore:
    balanceBeforeRefund,

  balanceAfter:
    user.balance,

  reference:
    String(withdrawal._id),

  description:
    "Crypto withdrawal failed - USD funds refunded",

});

        // ==============================================
        // MARK REFUNDED
        // ==============================================

        withdrawal.fundsRefunded =
          true;


        withdrawal.refundedAt =
          new Date();


        withdrawal.status =
          "rejected";


        withdrawal.rejectionReason =
          `NOWPayments payout status: ${status.status}`;


        withdrawal.processedBy =
          req.user.id;


        withdrawal.processedAt =
          new Date();


        withdrawal.nowPaymentsStatus =
          status.status;


        withdrawal.auditTrail =
          withdrawal.auditTrail || [];


        withdrawal.auditTrail.push({

          action:
            `NOWPayments payout failed: ${status.status}; USD funds refunded`,

          performedBy:
            req.user.email ||
            String(
              req.user.id
            ),

          timestamp:
            new Date(),

        });


        await withdrawal.save();


        // ==============================================
        // REFUND TRANSACTION
        // ==============================================

        await Transaction.create({

          fromEmail:
            "BLOCKCHAIN",

          toEmail:
            user.email,

          amount:
            refundAmount,

          fee:
            0,

          netAmount:
            refundAmount,

          type:
            "Crypto Withdrawal Refund",

          method:
            "crypto",

          reference:
            withdrawal.destination,

          status:
            "completed",

        });


        // ==============================================
        // NOTIFICATION
        // ==============================================

        try {

          await createNotification({

            email:
              user.email,

            title:
              "Crypto Withdrawal Failed",

            message:
              `Your crypto withdrawal of $${refundAmount.toFixed(
                2
              )} failed and the full USD amount has been returned to your FlowPay balance.`,

          });

        } catch (
          notificationError
        ) {

          console.error(
            "Crypto payout refund notification error:",
            notificationError
          );

        }


        // ==============================================
        // RESPONSE
        // ==============================================

        return res.json({

          success:
            true,

          message:
            "Crypto payout failed and USD funds were refunded",

          flowpayStatus:
            "rejected",

          nowPaymentsStatus:
            status.status,

          refundedAmount:
            refundAmount,

          balance:
            user.balance,

          withdrawal,

        });

      }


      // ==================================================
      // STILL PROCESSING
      // ==================================================

      withdrawal.status =
        "processing";


      await withdrawal.save();


      return res.json({

        success:
          true,

        message:
          "Crypto payout is still processing",

        flowpayStatus:
          "processing",

        nowPaymentsStatus:
          status.status,

        withdrawal,

      });


    } catch (err) {

      console.error(
        "CHECK CRYPTO PAYOUT STATUS ERROR:",
        err
      );


      console.error(
        "NOWPAYMENTS STATUS ERROR:",
        err.response?.data ||
        err.message
      );


      return res.status(502).json({

        message:
          "Failed to retrieve NOWPayments payout status",

        error:
          err.response?.data ||
          err.message,

      });

    }

  }
);


// ======================================================
// ADMIN REJECT CRYPTO WITHDRAWAL
// ======================================================

router.post(
  "/admin/crypto-withdrawals/:id/reject",

  auth,

  adminOnly,

  async (req, res) => {

    try {

      // ==================================================
      // FIND WITHDRAWAL
      // ==================================================

      const withdrawal =
        await Withdrawal.findOne({

          _id:
            req.params.id,

          method:
            "crypto",

        });


      if (!withdrawal) {

        return res.status(404).json({

          message:
            "Crypto withdrawal not found",

        });

      }


      // ==================================================
      // ONLY PENDING CAN BE REJECTED
      // ==================================================

      if (
        withdrawal.status !==
        "pending"
      ) {

        return res.status(400).json({

          message:
            `Withdrawal cannot be rejected from ${withdrawal.status} status`,

        });

      }


      // ==================================================
      // FIND USER
      // ==================================================

      const user =
        await User.findById(
          withdrawal.userId
        );


      if (!user) {

        return res.status(404).json({

          message:
            "User not found",

        });

      }


      // ==================================================
      // PROTECT AGAINST DOUBLE REFUND
      // ==================================================

      if (
        withdrawal.fundsRefunded ===
        true
      ) {

        return res.status(400).json({

          message:
            "Withdrawal funds have already been refunded",

        });

      }


      // ==================================================
      // REFUND RESERVED USD
      // ==================================================

      const refundAmount =
        Number(
          withdrawal.amount || 0
        );

const balanceBeforeRefund =
  Number(
    user.balance || 0
  );

      if (
        !Number.isFinite(
          refundAmount
        ) ||
        refundAmount <= 0
      ) {

        return res.status(400).json({

          message:
            "Invalid withdrawal amount",

        });

      }


      user.balance =
        Number(
          user.balance || 0
        ) +
        refundAmount;


      user.totalWithdrawals =
        Math.max(

          0,

          Number(
            user.totalWithdrawals || 0
          ) -
          refundAmount

        );


      await user.save();

// ==================================================
// REFUND LEDGER ENTRY
// ==================================================

await createLedgerEntry({

  userId:
    user._id,

  email:
    user.email,

  type:
    "Crypto Withdrawal Refund",

  amount:
    refundAmount,

  balanceBefore:
    balanceBeforeRefund,

  balanceAfter:
    user.balance,

  reference:
    String(withdrawal._id),

  description:
    "Admin rejected crypto withdrawal - USD funds refunded",

});

      // ==================================================
      // UPDATE WITHDRAWAL
      // ==================================================

      withdrawal.status =
        "rejected";

      withdrawal.fundsRefunded =
        true;

      withdrawal.refundedAt =
        new Date();

      withdrawal.rejectionReason =
        req.body?.reason ||
        "Crypto withdrawal rejected";

      withdrawal.processedBy =
        req.user.id;

      withdrawal.processedAt =
        new Date();

      withdrawal.auditTrail =
        withdrawal.auditTrail || [];


      withdrawal.auditTrail.push({

        action:
          "Crypto withdrawal rejected and USD funds refunded",

        performedBy:
          req.user.email ||
          String(req.user.id),

        timestamp:
          new Date(),

      });


      await withdrawal.save();


      // ==================================================
      // REFUND TRANSACTION
      // ==================================================

      await Transaction.create({

        fromEmail:
          "BLOCKCHAIN",

        toEmail:
          user.email,

        amount:
          refundAmount,

        fee:
          0,

        netAmount:
          refundAmount,

        type:
          "Crypto Withdrawal Refund",

        method:
          "crypto",

        reference:
          withdrawal.destination,

        status:
          "completed",

      });


      // ==================================================
      // NOTIFICATION
      // ==================================================

      try {

        await createNotification({

          email:
            user.email,

          title:
            "Crypto Withdrawal Rejected",

          message:
            `Your crypto withdrawal of $${refundAmount.toFixed(
              2
            )} was rejected and the funds were returned to your FlowPay balance.`,

        });

      } catch (
        notificationError
      ) {

        console.error(
          "Crypto rejection notification error:",
          notificationError
        );

      }


      // ==================================================
      // RESPONSE
      // ==================================================

      return res.json({

        success:
          true,

        message:
          "Crypto withdrawal rejected and funds refunded",

        balance:
          user.balance,

        withdrawal,

      });


    } catch (err) {

      console.error(
        "REJECT CRYPTO WITHDRAWAL ERROR:",
        err
      );


      return res.status(500).json({

        message:
          "Server error",

        error:
          err.message,

      });

    }

  }
);


// ======================================================
// EXPORT
// ======================================================

module.exports =
  router;