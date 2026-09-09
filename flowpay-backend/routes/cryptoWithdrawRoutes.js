const express =
  require("express");

  const mongoose =
  require("mongoose");

const router =
  express.Router();

const {
  auth,
  adminOnly,
} = require("../middleware/auth");

let user =
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
  "https://flowpay-backend-oak4.onrender.com/api/crypto-webhook";


// ======================================================
// CREATE CRYPTO WITHDRAWAL
// ======================================================

router.post(
  "/crypto-withdraw",
  auth,

  async (req, res) => {

let session = null;
let transactionCommitted = false;

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
      // NOWPAYMENTS / FLOWPAY SUPPORTED CRYPTO CURRENCIES
      // ==================================================

      if (
        ![
          "trx",
          "btc",
          "eth",
          "ltc",
          "doge",
          "xrp",
          "sol",
          "ada",
          "usdttrc20",
          "usdterc20",
          "usdtbsc",
          "usdtsol",
          "usdc",
        ].includes(normalizedCoin)
      ) {

        return res.status(400).json({
          message:
            "Unsupported cryptocurrency",
        });

      }

      // ==================================================
      // USER
      // ==================================================

let user =
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
      // AVAILABLE BALANCE CHECK
      // ==================================================

      const availableBalance =
        Number(user.balance || 0) -
        Number(user.reservedBalance || 0);

      if (
        availableBalance <
        numericAmount
      ) {

        return res.status(400).json({
          message:
            "Insufficient available balance",
        });

      }

      // ==================================================
      // USD أ¢â€ â€™ CRYPTO ESTIMATE
      // ==================================================
      //
      // IMPORTANT:
      // FlowPay balance remains USD.
      // NOWPayments receives the actual crypto amount.
      //
      // We calculate the crypto amount once when the
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

         currencyTo: normalizedCoin,

          });

      } catch (estimateError) {

       console.error(
  "NOWPAYMENTS USD TO CRYPTO ESTIMATE ERROR:",
  estimateError.response?.data ||
  estimateError.message
);

return res.status(502).json({
  message:
    "Unable to calculate crypto payout amount",
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
  normalizedCoin
      ) {

        console.error(
"Invalid USD to crypto conversion response",
          estimate
        );

        return res.status(502).json({
          message:
"Invalid USD to crypto conversion response",
        });

      }

      // ==================================================
      // CRYPTO PAYOUT AMOUNT
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
"Invalid crypto payout amount:",
          estimate
        );

        return res.status(502).json({
          message:
"Unable to calculate a valid crypto payout amount",
        });

      }

      // ==================================================
      // CRYPTO DECIMAL NORMALIZATION
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
"Invalid normalized crypto payout amount",
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
"Invalid crypto exchange rate",
        });

      }

      // ==================================================
      // FINAL PAYOUT DATA
      // ==================================================

   const payoutCurrency =
  normalizedCoin.toUpperCase();
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

payoutAmount:
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
// DATABASE TRANSACTION
// ==================================================

session =
  await mongoose.startSession();
session.startTransaction();

user =
  await User.findById(
    req.user.id
  ).session(session);

if (!user) {
  const error =
    new Error(
      "User not found"
    );

  error.statusCode = 404;

  throw error;
}
const currentAvailable =
  Number(user.balance || 0) -
  Number(user.reservedBalance || 0);

if (
  currentAvailable <
  numericAmount
) {
  const error =
    new Error(
      "Insufficient available balance"
    );

  error.statusCode = 400;

  throw error;
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

     user.reservedBalance =
  Number(user.reservedBalance || 0) +
  numericAmount;

user.totalWithdrawals =
  Number(
    user.totalWithdrawals || 0
  ) +
  numericAmount;

await user.save({
  session,
});


      // ==================================================
      // CREATE WITHDRAWAL
      // ==================================================

      let withdrawal;


      try {

       withdrawal =
  (
    await Withdrawal.create(
      [{

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
          payoutCurrency,

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

      }],
      {
        session,
      }
    )
  )[0];

          } catch (withdrawalError) {
        throw withdrawalError;
      }

// ==================================================
// TRANSACTION
// ==================================================

let transaction;

try {

  transaction =
    (
      await Transaction.create(
        [{
          withdrawalId: withdrawal._id,
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

        }],
        {
          session,
        }
      )
    )[0];

} catch (transactionError) {
  await Withdrawal.deleteOne(
    {
      _id:
        withdrawal._id,
    },
    {
      session,
    }
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

          session,

        });

      } catch (ledgerError) {

        console.error(
          "Crypto withdrawal ledger error:",
          ledgerError
        );
        throw ledgerError;

      }

      // ==================================================
      // COMMIT DATABASE TRANSACTION
      // ==================================================

      await session.commitTransaction();
transactionCommitted = true;

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

  payoutCurrency,

payoutAmount:

  normalizedPayoutAmount,

exchangeRate,

coin:
  payoutCurrency,

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

if (session && !transactionCommitted) {

    try {

      await session.abortTransaction();

    } catch (abortError) {

      console.error(
        "CRYPTO WITHDRAWAL ABORT ERROR:",
        abortError
      );

    }

  }

  return res.status(
    err.statusCode || 500
  ).json({

    message:
      err.message ||
      "Crypto withdrawal failed",

  });

} finally {

  if (session) {

    try {

      await session.endSession();

    } catch (sessionError) {

      console.error(
        "CRYPTO WITHDRAWAL SESSION ERROR:",
        sessionError
      );

    }

  }

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

      let withdrawal =
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
      // SUPPORTED CRYPTO PAYOUT CURRENCIES
      // ==================================================

      const payoutCurrency =
        String(
          withdrawal.payoutCurrency || ""
        )
          .trim()
          .toUpperCase();


     if (
  ![
    "TRX",
    "BTC",
    "ETH",
    "LTC",
    "DOGE",
    "XRP",
    "SOL",
    "ADA",
    "USDTTRC20",
    "USDTERC20",
    "USDTBSC",
    "USDTSOL",
    "USDC",
  ].includes(payoutCurrency)
) {
        return res.status(400).json({

          message:
"Unsupported cryptocurrency payout currency",
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
     // VALIDATE STORED CRYPTO PAYOUT AMOUNT
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
"Invalid crypto payout amount:",
        });

      }


      // ==================================================
      // VALIDATE STORED CRYPTO PAYOUT AMOUNT
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
"Invalid crypto payout amount",
          withdrawal.payoutAmount
        );

        return res.status(400).json({

          message:
"Invalid crypto payout amount",
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
"Stored crypto payout amount does not match the stored exchange rate",
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
"Stored crypto payout amount does not match the stored exchange rate",
        });

      }


      // ==================================================
     // VALIDATE CRYPTO ADDRESS WITH NOWPAYMENTS
      // ==================================================

      const validation =
        await validatePayoutAddress({

          address:
            destination,

        currency:
  payoutCurrency.toLowerCase(),
        });


      console.log(
"NOWPAYMENTS CRYPTO ADDRESS VALIDATION:",
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
// FLOWPAY SIMULATION MODE
// NEVER CREATE REAL NOWPAYMENTS PAYOUT
// ==================================================

if (
  process.env.FLOWPAY_SIMULATION ===
  "true"
) {

  console.log(
    "FLOWPAY SIMULATION: NOWPayments payout NOT created"
  );

  withdrawal.nowPaymentsStatus =
    "simulation";

  withdrawal.status =
    "awaiting_2fa";

  withdrawal.processedBy =
    req.user.id;

  withdrawal.processedAt =
    new Date();

  withdrawal.auditTrail =
    withdrawal.auditTrail || [];

  withdrawal.auditTrail.push({
    action:
      "Simulation payout created - external payout not executed",

    performedBy:
      req.user.email ||
      String(req.user.id),

    timestamp:
      new Date(),
  });

  await withdrawal.save();

  return res.json({
    success:
      true,

    simulation:
      true,

    message:
      "Simulation mode: payout was NOT sent to NOWPayments.",

    withdrawalId:
      withdrawal._id,

    status:
      withdrawal.status,

    nowPaymentsStatus:
      withdrawal.nowPaymentsStatus,
  });
}

      // ==================================================
      // ATOMIC PAYOUT ATTEMPT LOCK
      // Prevent duplicate NOWPayments payout creation

      const payoutAttemptClaim = await Withdrawal.findOneAndUpdate(
        {
          _id: withdrawal._id,
          method: "crypto",
          status: "pending",
          nowPaymentsWithdrawalId: null,
          nowPaymentsBatchId: null,
          payoutAttempted: { $ne: true },
        },
        {
          $set: {
            payoutAttempted: true,
            lastPayoutAttemptAt: new Date(),
            payoutError: null,
          },
          $inc: {
            payoutAttemptCount: 1,
          },
        },
        { new: true }
      );

      if (!payoutAttemptClaim) {
        return res.status(409).json({
          message: "This crypto withdrawal is already being processed or has already received a payout attempt.",
          withdrawalId: withdrawal._id,
        });
      }

      withdrawal = payoutAttemptClaim;

      // CREATE NOWPAYMENTS PAYOUT
      //
      // IMPORTANT:
      // amount is the selected crypto currency, NOT USD.
      // ==================================================

      const payout =
      await createPayout({
  address:
    destination,

  currency:
    payoutCurrency.toLowerCase(),

  amount:
    payoutAmount,

          uniqueExternalId,

          ipnCallbackUrl:
            NOWPAYMENTS_IPN_URL,

         description:
  `FlowPay ${payoutCurrency} withdrawal ${withdrawal._id}`,

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

  withdrawal.nowPaymentsExternalId =
    uniqueExternalId;


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
    req.user.id;


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
`Your ${payoutCurrency} withdrawal of $${Number(
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

      const nowPaymentsError =
        err.response?.data ||
        err.message ||
        "Unknown NOWPayments error";

      console.error(
        "NOWPAYMENTS ERROR:",
        nowPaymentsError
      );

      try {
        await Withdrawal.updateOne(
          {
            _id: withdrawal._id,
            method: "crypto",
          },
          { ["$set"]: {
              payoutAttempted: true,
              lastPayoutAttemptAt: new Date(),
              payoutError: String(
                typeof nowPaymentsError === "string"
                  ? nowPaymentsError
                  : JSON.stringify(nowPaymentsError)
              ),
            }
          }
        );
      } catch (updateError) {
        console.error(
          "FAILED TO SAVE NOWPAYMENTS PAYOUT ERROR:",
          updateError
        );
      }

      return res.status(502).json({
        message:
          "NOWPayments crypto payout creation failed. Manual review required.",
        error:
          nowPaymentsError,
        withdrawalId:
          withdrawal._id,
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
//      أ¢â€ â€œ
// NOWPayments verify
//      أ¢â€ â€œ
// processing / waiting
//      أ¢â€ â€œ
// status endpoint / webhook
//      أ¢â€ â€œ
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

      let withdrawal =
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
      // ==================================================
      // REQUIRED NOWPAYMENTS IDS
      // ==================================================

      if (
        !withdrawal.nowPaymentsWithdrawalId ||
        !withdrawal.nowPaymentsBatchId
      ) {

        return res.status(400).json({

          message:
            "NOWPayments payout IDs are missing",

        });

      }

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

      // ==================================================
      // ATOMIC 2FA VERIFICATION LOCK
      // ==================================================

      const verificationClaim = await Withdrawal.findOneAndUpdate(
        {
          _id: withdrawal._id,
          method: "crypto",
          status: "awaiting_2fa",
          $or: [
            { verificationInProgress: { $ne: true } },
            {
              verificationInProgress: true,
              verificationStartedAt: {
                $lt: new Date(Date.now() - 10 * 60 * 1000),
              },
            },
          ],
        },
        {
          $set: {
            verificationInProgress: true,
            verificationStartedAt: new Date(),
          },
        },
        { new: true }
      );

      if (!verificationClaim) {
        return res.status(409).json({
          message: "This crypto withdrawal is already being verified or is no longer awaiting 2FA.",
          withdrawalId: withdrawal._id,
        });
      }

      withdrawal = verificationClaim;

      const verification =
        await verifyPayout({

          batchWithdrawalId: verificationClaim.nowPaymentsBatchId,

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

        try {
          await Withdrawal.updateOne(
            {
              _id:
                withdrawal._id,
              method:
                "crypto",
              status:
                "awaiting_2fa",
            },
            {
              $set: {
                verificationInProgress:
                  false,
                verificationStartedAt:
                  null,
              },
            }
          );
        } catch (lockReleaseError) {
          console.error(
            "FAILED TO RELEASE 2FA LOCK AFTER EMPTY VERIFICATION RESPONSE:",
            lockReleaseError
          );
        }

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
          "failed", "error", "rejected", "cancelled", "canceled"
        ].includes(nowPaymentsStatus)
      ) {
        const refund = await refundCryptoWithdrawal(withdrawal._id, nowPaymentsStatus);
        if (refund.alreadyProcessed) {
          return res.status(409).json({ message: "Withdrawal funds have already been refunded", withdrawalId: withdrawal._id });
        }
        withdrawal = refund.withdrawal;
        const refundAmount = Number(withdrawal.amount || 0);
      // ==================================================
      // ==================================================
      // REFUND NOTIFICATION
      // ==================================================

      try {

        await createNotification({

          email:
            withdrawal.email,

          title:
            "Crypto Withdrawal Failed",

          message:
            `Your crypto withdrawal of $${refundAmount.toFixed(2)} failed after 2FA verification and the reserved USD funds were released.`,

        });

      } catch (
        notificationError
      ) {

        console.error(
          "Crypto 2FA refund notification error:",
          notificationError
        );

      }

      return res.status(502).json({

        message:
          "NOWPayments rejected the payout after 2FA verification and the reserved USD funds were released",

        nowPaymentsStatus,

        refundedAmount:
          refundAmount,

        withdrawalId:
          withdrawal._id,

      });

      }

// UPDATE WITHDRAWAL
      // ==================================================

      const successAuditEntry = {
        action:
          "NOWPayments payout 2FA verification accepted; payout is processing",

        performedBy:
          req.user.email ||
          String(
            req.user.id
          ),

        timestamp:
          new Date(),
      };

      const successClaim = await Withdrawal.findOneAndUpdate(
        {
          _id:
            withdrawal._id,

          method:
            "crypto",

          status:
            "awaiting_2fa",

          verificationInProgress:
            true,
        },

        {
          $set: {
            status:
              internalStatus,

            verificationInProgress:
              false,

            verificationStartedAt:
              null,

            nowPaymentsStatus:
              nowPaymentsStatus,

            processedBy:
              req.user.id,

            processedAt:
              new Date(),
          },

          $push: {
            auditTrail:
              successAuditEntry,
          },
        },

        {
          new:
            true,
        }
      );

      if (!successClaim) {
        return res.status(409).json({
          message:
            "Crypto withdrawal verification state changed before FlowPay could finalize the 2FA result",
          withdrawalId:
            withdrawal._id,
        });
      }

      withdrawal =
        successClaim;


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
`Your ${payoutCurrency} withdrawal of $${Number(
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

      try {
        await Withdrawal.updateOne(
          {
            _id: withdrawal._id,
            method: "crypto",
            status: "awaiting_2fa",
          },
          {
            $set: {
              verificationInProgress: false,
              verificationStartedAt: null,
            },
          }
        );
      } catch (lockReleaseError) {
        console.error(
          "FAILED TO RELEASE 2FA VERIFICATION LOCK:",
          lockReleaseError
        );
      }


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
//        أ¢â€ â€œ
//     processing
//
// finished / completed / confirmed
//        أ¢â€ â€œ
//     completed
//
// failed / rejected / cancelled
//        أ¢â€ â€œ
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

      let withdrawal =
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
      // ==================================================
      // TERMINAL NOWPAYMENTS STATUS
      // ==================================================

      if (
        [
          "finished",
          "completed",
          "confirmed",
          "success",
          "successful",
        ].includes(
          nowStatus
        )
      ) {

        try {

          const settlement =
            await settleCryptoWithdrawal(
              withdrawal._id,
              nowStatus
            );

          console.log(
            "CRYPTO STATUS SETTLEMENT RESULT:",
            {
              withdrawalId:
                String(withdrawal._id),
              status:
                settlement.status,
              alreadyProcessed:
                settlement.alreadyProcessed,
            }
          );

          withdrawal =
            settlement.withdrawal;

          if (
            settlement.user &&
            settlement.amount
          ) {

            try {

              await createNotification({

                email:
                  settlement.user.email,

                title:
                  "Crypto Withdrawal Completed",

                message:
                  `Your ${withdrawal.payoutCurrency || "crypto"} crypto withdrawal of $${Number(
                    settlement.amount
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

          }

          return res.json({

            success:
              true,

            message:
              settlement.alreadyProcessed
                ? "Crypto payout was already settled"
                : "Crypto payout completed successfully",

            flowpayStatus:
              "completed",

            nowPaymentsStatus:
              status.status,

            withdrawal,

            alreadyProcessed:
              settlement.alreadyProcessed,

          });

        } catch (settlementError) {

          console.error(
            "CHECK CRYPTO PAYOUT SETTLEMENT ERROR:",
            settlementError
          );

          return res.status(500).json({

            success:
              false,

            message:
              "NOWPayments payout completed but FlowPay settlement failed",

            error:
              settlementError.message,

            withdrawalId:
              withdrawal._id,

          });

        }

      }


      // ==================================================
      // FAILED / REJECTED / CANCELLED
      // ==================================================

      if (
        [
          "failed",
          "rejected",
          "cancelled",
          "canceled",
        ].includes(
          nowStatus
        )
      ) {

        try {

          const refund =
            await refundCryptoWithdrawal(
              withdrawal._id,
              nowStatus
            );

          console.log(
            "CRYPTO STATUS REFUND RESULT:",
            {
              withdrawalId:
                String(withdrawal._id),
              status:
                refund.status,
              alreadyProcessed:
                refund.alreadyProcessed,
            }
          );

          withdrawal =
            refund.withdrawal;

          if (
            refund.user &&
            refund.amount
          ) {

            try {

              await createNotification({

                email:
                  refund.user.email,

                title:
                  "Crypto Withdrawal Failed",

                message:
                  `Your crypto withdrawal of $${Number(
                    refund.amount
                  ).toFixed(
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

          }

          return res.json({

            success:
              true,

            message:
              refund.alreadyProcessed
                ? "Payout failed; funds were already refunded"
                : "Crypto payout failed and USD funds were refunded",

            flowpayStatus:
              "rejected",

            nowPaymentsStatus:
              status.status,

            refundedAmount:
              refund.amount || 0,

            withdrawal,

            alreadyProcessed:
              refund.alreadyProcessed,

          });

        } catch (refundError) {

          console.error(
            "CHECK CRYPTO PAYOUT REFUND ERROR:",
            refundError
          );

          return res.status(500).json({

            success:
              false,

            message:
              "NOWPayments payout failed but FlowPay refund failed",

            error:
              refundError.message,

            withdrawalId:
              withdrawal._id,

          });

        }

      }

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
 // ======================================================
 // ADMIN REJECT CRYPTO WITHDRAWAL
 // ======================================================

 router.post(
   "/admin/crypto-withdrawals/:id/reject",
   auth,
   adminOnly,
   async (req, res) => {
     let session = null;
     let transactionCommitted = false;

     try {
       session = await mongoose.startSession();
       session.startTransaction();

       const withdrawal =
         await Withdrawal.findOne({
           _id: req.params.id,
           method: "crypto",
         }).session(session);

       if (!withdrawal) {
         await session.abortTransaction();
         return res.status(404).json({
           message: "Crypto withdrawal not found",
         });
       }

       if (withdrawal.status !== "pending") {
         await session.abortTransaction();
         return res.status(400).json({
           message:
             `Withdrawal cannot be rejected from ${withdrawal.status} status`,
         });
       }

       if (withdrawal.fundsRefunded === true) {
         await session.abortTransaction();
         return res.status(400).json({
           message:
             "Withdrawal funds have already been refunded",
         });
       }

       if (withdrawal.fundsSettled === true) {
         await session.abortTransaction();
         return res.status(400).json({
           message:
             "Withdrawal funds have already been settled",
         });
       }

       const user =
         await User.findById(
           withdrawal.userId
         ).session(session);

       if (!user) {
         await session.abortTransaction();
         return res.status(404).json({
           message: "User not found",
         });
       }

       const refundAmount =
         Number(withdrawal.amount || 0);

       if (
         !Number.isFinite(refundAmount) ||
         refundAmount <= 0
       ) {
         await session.abortTransaction();
         return res.status(400).json({
           message: "Invalid withdrawal amount",
         });
       }

       const balanceBeforeRefund =
         Number(user.balance || 0);

       const reservedBalanceBeforeRefund =
         Number(user.reservedBalance || 0);

       if (
         !Number.isFinite(balanceBeforeRefund) ||
         !Number.isFinite(reservedBalanceBeforeRefund) ||
         reservedBalanceBeforeRefund < refundAmount
       ) {
         await session.abortTransaction();
         return res.status(409).json({
           message:
             "Insufficient reserved balance for crypto withdrawal refund",
         });
       }

       user.reservedBalance =
         reservedBalanceBeforeRefund -
           refundAmount;
       await user.save({
         session,
       });

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

       await withdrawal.save({
         session,
       });

       const originalWithdrawalTransaction =
         await Transaction.findOneAndUpdate(
           {
             withdrawalId:
               withdrawal._id,
             type:
               "Crypto Withdrawal",
           },
           {
             status:
               "rejected",
           },
           {
             session,
             new:
               true,
           }
         );

       if (!originalWithdrawalTransaction) {
         throw new Error(
           "Original crypto withdrawal transaction not found during admin rejection"
         );
       }

       await createLedgerEntry({
         userId: user._id,
         email: user.email,
         type: "Crypto Withdrawal Refund",
         amount: refundAmount,
         balanceBefore: balanceBeforeRefund,
         balanceAfter: user.balance,
         reference: String(withdrawal._id),
         description: "Crypto withdrawal rejected - USD funds refunded",
         session,
       });

       await Transaction.create(
         [{
           withdrawalId: withdrawal._id,

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
         }],
         {
           session,
         }
       );

       await session.commitTransaction();
       transactionCommitted = true;

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

       if (
         session &&
         !transactionCommitted
       ) {
         try {
           await session.abortTransaction();
         } catch (
           abortError
         ) {
           console.error(
             "REJECT CRYPTO WITHDRAWAL ABORT ERROR:",
             abortError
           );
         }
       }

       return res.status(500).json({
         message:
           "Server error",

         error:
           err.message,
       });

     } finally {
       if (session) {
         try {
           await session.endSession();
         } catch (
           sessionError
         ) {
           console.error(
             "REJECT CRYPTO WITHDRAWAL SESSION ERROR:",
             sessionError
           );
         }
       }
     }
   }
 );
// EXPORT
// ======================================================

module.exports =
  router;








































































