const emit =
  require(
    "../socket/emitter"
  );

const EVENTS =
  require(
    "../socket/events"
  );

const Notification =
  require(
    "../models/Notification"
  );

const limitEngine =
  require(
    "../utils/limitEngine"
  );

const amlEngine =
  require(
    "../utils/amlEngine"
  );

const riskEngine =
  require(
    "../utils/riskEngine"
  );

  const createAuditLog =
 require("../utils/audit");

const mongoose =
  require("mongoose");

const analyzeBehavior =
  require(
    "../utils/behavioralEngine"
  );

  const AuditLog = require("../models/AuditLog");

const logActivity =
  require(
    "../utils/activityLogger"
  );

const sendPush =
  require(
    "../utils/sendPush"
  );

const detectFraud =
  require(
    "../utils/fraudDetection"
  );

const createNotification =
  require(
    "../utils/createNotification"
  );

const User =
  require(
    "../models/User"
  );

const Transaction =
  require(
    "../models/Transaction"
  );

const {
  calculateInternalFee,
} = require(
  "../utils/fees"
);

const createLedgerEntry =
  require(
    "../utils/ledger"
  );
const {
  createAccountingEntries
} = require(
  "../utils/accounting"
);

// =========================
// TRANSFER
// =========================

exports.transfer =
  async (req, res) => {

    const session =
      await mongoose.startSession();

    session.startTransaction();

    try {

      // =========================
      // REQUEST DATA
      // =========================

      const {
        toEmail,
        amount,
      } = req.body;

      // =========================
      // AUTH USER
      // =========================

      const fromEmail =
        req.user.email;

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

        await session.abortTransaction();

        session.endSession();

        return res.status(400).json({
          message:
            "Invalid amount",
        });

      }

      if (
        fromEmail ===
        toEmail
      ) {

        await session.abortTransaction();

        session.endSession();

        return res.status(400).json({
          message:
            "Cannot transfer to yourself",
        });

      }

      // =========================
      // USERS
      // =========================

      const sender =
        await User.findOne({
          email:
            fromEmail,
        }).session(session);

      const receiver =
        await User.findOne({
          email:
            toEmail,
        }).session(session);

      if (
        !sender ||
        !receiver
      ) {

        await session.abortTransaction();

        session.endSession();

        return res.status(404).json({
          message:
            "User not found",
        });

      }

      // =========================
      // ACCOUNT STATUS
      // =========================

      if (
        sender.frozen
      ) {

        await session.abortTransaction();

        session.endSession();

        return res.status(403).json({
          message:
            "Account frozen",
        });

      }

      // =========================
// KYC REQUIRED
// =========================

if (
  !sender.verified
) {

  await session.abortTransaction();

  session.endSession();

  return res.status(403).json({
    message:
      "KYC verification required",
  });

}

      // =========================
      // FRAUD ANALYSIS
      // =========================

      await analyzeBehavior({
        user:
          sender,

        amount:
          numericAmount,

        ip:
          req.ip,
      });

      const fraud =
        await detectFraud({
          user:
            sender,

          amount:
            numericAmount,

          target:
            receiver.email,
        });

      // =========================
      // FRAUD FREEZE
      // =========================

      if (
        fraud.action ===
        "Frozen"
      ) {

        sender.frozen =
          true;

        await sender.save({
          session,
        });

        await session.commitTransaction();

        session.endSession();

        // =========================
        // REALTIME FRAUD ALERT
        // =========================

        emit(
          EVENTS.FRAUD_ALERT,
          {
            type:
              "ACCOUNT_FROZEN",

            severity:
              "critical",

            user:
              sender.email,

            amount:
              numericAmount,

            timestamp:
              new Date(),
          }
        );

        return res.status(403).json({
          message:
            "Account frozen due to suspicious activity",
        });

      }

      // =========================
      // RISK ENGINE
      // =========================

      const risk =
        await riskEngine({
          user:
            sender,

          amount:
            numericAmount,
        });

      if (
        risk.level ===
        "high"
      ) {

        await createNotification({
          email:
            sender.email,

          title:
            "High Risk Activity",

          message:
            "Suspicious activity detected on your account",
        });

        // =========================
        // REALTIME FRAUD ALERT
        // =========================

        emit(
          EVENTS.FRAUD_ALERT,
          {
            type:
              "HIGH_RISK_TRANSFER",

            severity:
              "high",

            user:
              sender.email,

            amount:
              numericAmount,

            timestamp:
              new Date(),
          }
        );

      }

      // =========================
      // AML
      // =========================

      await amlEngine({
        user:
          sender,

        amount:
          numericAmount,
      });

      // =========================
      // LIMITS
      // =========================

      const limitCheck =
        await limitEngine({
          user:
            sender,

          amount:
            numericAmount,
        });

      if (
        !limitCheck.allowed
      ) {

        await session.abortTransaction();

        session.endSession();

        return res.status(403).json({
          message:
            limitCheck.message,
        });

      }

      // =========================
      // FEES
      // =========================

      const fee =
        calculateInternalFee(
          numericAmount
        );

      const netAmount =
        numericAmount -
        fee;

      // =========================
      // BALANCE CHECK
      // =========================

      if (
        sender.balance <
        numericAmount
      ) {

        await session.abortTransaction();

        session.endSession();

        return res.status(400).json({
          message:
            "Insufficient balance",
        });

      }

      // =========================
      // BALANCES BEFORE
      // =========================

      const senderBefore =
        sender.balance;

      const receiverBefore =
        receiver.balance;
        
const treasury =
  await User.findOne({
    accountType:
      "treasury",
  }).session(session);

if (!treasury) {
  throw new Error(
    "Treasury account not found"
  );
}

const treasuryBefore =
  treasury.balance;

      // =========================
      // UPDATE BALANCES
      // =========================

     sender.balance -=
  numericAmount;

sender.dailyUsed +=
  numericAmount;

sender.monthlyUsed +=
  numericAmount;

sender.totalTransfersSent =
  (sender.totalTransfersSent || 0) +
  numericAmount;

receiver.balance +=
  netAmount;

  treasury.balance +=
  fee;

treasury.revenue +=
  fee;

receiver.totalTransfersReceived =
  (receiver.totalTransfersReceived || 0) +
  netAmount;

      await sender.save({
        session,
      });

      await receiver.save({
        session,
      });

      await treasury.save({
  session,
});

      // =========================
      // TRANSACTION RECORD
      // =========================

     const transaction =
  await Transaction.create(
    [
      {
        fromEmail,

        toEmail,

        amount:
          numericAmount,

        fee,

        netAmount,

        type:
          "Transfer",

        method:
          "internal",

        status:
          "completed",

        reference:
          `${fromEmail}-${toEmail}-${Date.now()}`,
      },
    ],
    {
      session,
    }
  );

// =========================
// LEDGER ENTRIES
// =========================

await createLedgerEntry({

  userId:
    sender._id,

  email:
    sender.email,

  type:
    "Transfer Sent",

  amount:
    numericAmount,

  balanceBefore:
    senderBefore,

  balanceAfter:
    sender.balance,

  reference:
    receiver.email,

  description:
    "Internal transfer sent",

  session,

});

await createLedgerEntry({

  userId:
    receiver._id,

  email:
    receiver.email,

  type:
    "Transfer Received",

  amount:
    netAmount,

  balanceBefore:
    receiverBefore,

  balanceAfter:
    receiver.balance,

  reference:
    sender.email,

  description:
    "Internal transfer received",

  session,

});

// =========================
// PLATFORM REVENUE
// =========================
await createLedgerEntry({

  userId:
    treasury._id,

  email:
    treasury.email,

  type:
    "Platform Fee Revenue",

  amount:
    fee,

  balanceBefore:
    treasuryBefore,

  balanceAfter:
    treasury.balance,

  reference:
    sender.email,

  description:
    "Internal transfer fee revenue",

  session,

});

// =========================
// ACCOUNTING ENTRIES
// =========================

await createAccountingEntries({

  transactionId:
    transaction[0]._id,

  sender,

  receiver,

  amount:
    numericAmount,

  fee,

  netAmount,

  session,

});

      // =========================
      // COMMIT
      // =========================

      await session.commitTransaction();

      session.endSession();

      // =========================
      // PUSH NOTIFICATION
      // =========================

      if (
        receiver.fcmToken
      ) {

        await sendPush(
          receiver.fcmToken,

          "Money Received",

          `You received $${netAmount}`
        );

      }

      // =========================
      // IN-APP NOTIFICATIONS
      // =========================

      await createNotification({
        email:
          sender.email,

        title:
          "Transfer Sent",

        message:
          `You sent $${numericAmount} to ${receiver.email}`,
      });

      await createNotification({
        email:
          receiver.email,

        title:
          "Money Received",

        message:
          `You received $${netAmount} from ${sender.email}`,
      });

      // =========================
      // REALTIME EVENTS
      // =========================

      emit(
        EVENTS.NEW_TRANSACTION,
        {
          transactionId:
            transaction[0]._id,

          fromEmail,

          toEmail,

          amount:
            numericAmount,

          fee,

          netAmount,

          timestamp:
            new Date(),
        }
      );

      emit(
        EVENTS.WALLET_UPDATE,
        {
          sender: {
            email:
              sender.email,

            balance:
              sender.balance,
          },

          receiver: {
            email:
              receiver.email,

            balance:
              receiver.balance,
          },
        }
      );

      // =========================
      // ACTIVITY LOG
      // =========================

      try {

        await logActivity({
          email:
            sender.email,

          action:
            "TRANSFER",

          role:
            sender.role ||
            "user",

          ip:
            req.ip,

          metadata: {
            to:
              receiver.email,

            amount:
              numericAmount,

            fee,

            netAmount,

            transactionId:
              transaction[0]._id,
          },
        });

      } catch (logErr) {

        console.error(
          "Activity log failed:",
          logErr
        );

      }
// =========================
// AUDIT LOG
// =========================

await createAuditLog({

  userId:
    req.user.id,

  email:
    req.user.email,

  action:
    "TRANSFER",

  description:
    `Sent ${amount} USD to ${toEmail}`,

  ip:
    req.ip,

  metadata:{
    transactionId:
      transaction[0]._id,

    amount,

    receiver:
      toEmail,

    fee,

    netAmount,
  }

});


// =========================
// RESPONSE
// =========================

await AuditLog.create({

  userId: req.user.id,

  email: req.user.email,

  action: "TRANSFER",

  description:
    `Sent ${amount} USD to ${toEmail}`,

  status:
    "success",

  ip:
    req.ip,

  userAgent:
    req.headers["user-agent"]

});

res.json({

  message:
    "Transfer completed successfully",

  transactionId:
    transaction[0]._id,

  fee,

  netAmount,

});

    } catch (err) {

      console.log(err);

      await session.abortTransaction();

      session.endSession();

      res.status(500).json({
        message:
          "Transfer failed",
      });

    }

  };
