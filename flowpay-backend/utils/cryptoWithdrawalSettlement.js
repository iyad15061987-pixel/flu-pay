const mongoose = require("mongoose");

const User = require("../models/User");
const Withdrawal = require("../models/Withdrawal");
const Transaction = require("../models/Transaction");
const createLedgerEntry = require("./ledger");

async function settleCryptoWithdrawal(withdrawalId, nowPaymentsStatus) {
  let session = null;
  let committed = false;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const withdrawal = await Withdrawal.findOne({
      _id: withdrawalId,
      method: "crypto",
    }).session(session);

    if (!withdrawal) {
      throw new Error(
        "Crypto withdrawal not found during settlement"
      );
    }

    if (withdrawal.fundsSettled === true) {
      await session.abortTransaction();

      return {
        alreadyProcessed: true,
        status: "completed",
        withdrawal,
      };
    }

    if (withdrawal.fundsRefunded === true) {
      await session.abortTransaction();

      return {
        alreadyProcessed: true,
        status: "rejected",
        withdrawal,
      };
    }

    const user = await User.findById(
      withdrawal.userId
    ).session(session);

    if (!user) {
      throw new Error(
        "User not found during crypto withdrawal settlement"
      );
    }

    const amount = Number(
      withdrawal.amount || 0
    );

    const balanceBefore = Number(
      user.balance || 0
    );

    const reservedBefore = Number(
      user.reservedBalance || 0
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new Error(
        "Invalid crypto withdrawal amount during settlement"
      );
    }

    if (
      !Number.isFinite(balanceBefore) ||
      !Number.isFinite(reservedBefore)
    ) {
      throw new Error(
        "Invalid user balance during crypto withdrawal settlement"
      );
    }

    if (balanceBefore < amount) {
      throw new Error(
        "Insufficient user balance during crypto withdrawal settlement"
      );
    }

    if (reservedBefore < amount) {
      throw new Error(
        "Insufficient reserved balance during crypto withdrawal settlement"
      );
    }

    user.balance =
      balanceBefore - amount;

    user.reservedBalance =
      reservedBefore - amount;

    await user.save({
      session,
    });

    withdrawal.fundsSettled = true;
    withdrawal.status = "completed";
    withdrawal.processedAt = new Date();
    withdrawal.verificationInProgress = false;
    withdrawal.verificationStartedAt = null;
    withdrawal.nowPaymentsStatus =
      String(nowPaymentsStatus || "").toLowerCase();

    withdrawal.auditTrail =
      withdrawal.auditTrail || [];

    withdrawal.auditTrail.push({
      action:
        `NOWPayments payout completed: ${withdrawal.nowPaymentsStatus}`,
      performedBy:
        "NOWPAYMENTS_WEBHOOK",
      timestamp: new Date(),
    });

    await withdrawal.save({
      session,
    });

    const transaction =
      await Transaction.findOneAndUpdate(
        {
          withdrawalId: withdrawal._id,
          type: "Crypto Withdrawal",
        },
        {
          status: "completed",
        },
        {
          session,
          new: true,
        }
      );

    if (!transaction) {
      throw new Error(
        "Original crypto withdrawal transaction not found during settlement"
      );
    }

    await createLedgerEntry({
      userId: user._id,
      email: user.email,
      type: "Crypto Withdrawal",
      amount,
      balanceBefore,
      balanceAfter: user.balance,
      reference: String(withdrawal._id),
      description:
        "NOWPayments crypto withdrawal completed",
      session,
    });

    await session.commitTransaction();
    committed = true;

    return {
      alreadyProcessed: false,
      status: "completed",
      withdrawal,
      user,
      transaction,
      amount,
    };

  } catch (error) {

    if (session && !committed) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error(
          "CRYPTO SETTLEMENT ABORT ERROR:",
          abortError
        );
      }
    }

    throw error;

  } finally {

    if (session) {
      try {
        await session.endSession();
      } catch (error) {
        console.error(
          "CRYPTO SETTLEMENT SESSION ERROR:",
          error
        );
      }
    }

  }
}


async function refundCryptoWithdrawal(
  withdrawalId,
  nowPaymentsStatus
) {
  let session = null;
  let committed = false;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const withdrawal = await Withdrawal.findOne({
      _id: withdrawalId,
      method: "crypto",
    }).session(session);

    if (!withdrawal) {
      throw new Error(
        "Crypto withdrawal not found during refund"
      );
    }

    if (withdrawal.fundsRefunded === true) {
      await session.abortTransaction();

      return {
        alreadyProcessed: true,
        status: "rejected",
        withdrawal,
      };
    }

    if (withdrawal.fundsSettled === true) {
      await session.abortTransaction();

      return {
        alreadyProcessed: true,
        status: "completed",
        withdrawal,
      };
    }

    const user = await User.findById(
      withdrawal.userId
    ).session(session);

    if (!user) {
      throw new Error(
        "User not found during crypto withdrawal refund"
      );
    }

    const amount = Number(
      withdrawal.amount || 0
    );

    const balanceBefore = Number(
      user.balance || 0
    );

    const reservedBefore = Number(
      user.reservedBalance || 0
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new Error(
        "Invalid crypto withdrawal refund amount"
      );
    }

    if (
      !Number.isFinite(balanceBefore) ||
      !Number.isFinite(reservedBefore)
    ) {
      throw new Error(
        "Invalid user balance during crypto withdrawal refund"
      );
    }

    if (reservedBefore < amount) {
      throw new Error(
        "Insufficient reserved balance during crypto withdrawal refund"
      );
    }

    user.reservedBalance =
      reservedBefore - amount;

    await user.save({
      session,
    });

    const normalizedStatus =
      String(
        nowPaymentsStatus || ""
      ).toLowerCase();

    withdrawal.fundsRefunded = true;
    withdrawal.refundedAt = new Date();
    withdrawal.status = "rejected";
    withdrawal.processedAt = new Date();
    withdrawal.verificationInProgress = false;
    withdrawal.verificationStartedAt = null;
    withdrawal.nowPaymentsStatus =
      normalizedStatus;

    withdrawal.rejectionReason =
      `NOWPayments payout status: ${normalizedStatus}`;

    withdrawal.auditTrail =
      withdrawal.auditTrail || [];

    withdrawal.auditTrail.push({
      action:
        `NOWPayments payout failed: ${normalizedStatus}; USD funds refunded`,
      performedBy:
        "NOWPAYMENTS_WEBHOOK",
      timestamp: new Date(),
    });

    await withdrawal.save({
      session,
    });

    const originalTransaction =
      await Transaction.findOneAndUpdate(
        {
          withdrawalId: withdrawal._id,
          type: "Crypto Withdrawal",
        },
        {
          status: "rejected",
        },
        {
          session,
          new: true,
        }
      );

    if (!originalTransaction) {
      throw new Error(
        "Original crypto withdrawal transaction not found during refund"
      );
    }

    await createLedgerEntry({
      userId: user._id,
      email: user.email,
      type: "Crypto Withdrawal Refund",
      amount,
      balanceBefore,
      balanceAfter: user.balance,
      reference: String(withdrawal._id),
      description:
        "NOWPayments crypto withdrawal failed - USD funds refunded",
      session,
    });

    const refundTransactions =
      await Transaction.create(
        [{
          withdrawalId: withdrawal._id,
          fromEmail: "BLOCKCHAIN",
          toEmail: user.email,
          amount,
          fee: 0,
          netAmount: amount,
          type: "Crypto Withdrawal Refund",
          method: "crypto",
          reference: String(withdrawal._id),
          status: "completed",
        }],
        {
          session,
        }
      );

    const refundTransaction =
      refundTransactions[0];

    if (!refundTransaction) {
      throw new Error(
        "Crypto withdrawal refund transaction was not created"
      );
    }

    await session.commitTransaction();
    committed = true;

    return {
      alreadyProcessed: false,
      status: "rejected",
      withdrawal,
      user,
      transaction: refundTransaction,
      amount,
    };

  } catch (error) {

    if (session && !committed) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error(
          "CRYPTO REFUND ABORT ERROR:",
          abortError
        );
      }
    }

    throw error;

  } finally {

    if (session) {
      try {
        await session.endSession();
      } catch (error) {
        console.error(
          "CRYPTO REFUND SESSION ERROR:",
          error
        );
      }
    }

  }
}


module.exports = {
  settleCryptoWithdrawal,
  refundCryptoWithdrawal,
};
