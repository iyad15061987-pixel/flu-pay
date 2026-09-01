const mongoose =
  require("mongoose");

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

const {
  calculateFee,
} = require(
  "../utils/fees"
);

// =========================
// CREATE WITHDRAWAL
// =========================

exports.createWithdrawal =
  async (req, res) => {

    const {
      amount,
      destination,
      method,
      payoutCurrency,
    } = req.body;

    console.log(
      "WITHDRAW REQUEST BODY:",
      {
        amount,
        destination,
        method,
        payoutCurrency,
      }
    );

    try {

      // =========================
      // BASIC USER VALIDATION
      // =========================

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

      // =========================
      // KYC
      // =========================

      if (!user.verified) {
        return res.status(403).json({
          message:
            "KYC verification required",
        });
      }

      // =========================
      // ACCOUNT STATUS
      // =========================

      if (user.frozen) {
        return res.status(403).json({
          message:
            "Account frozen",
        });
      }

      // =========================
      // AMOUNT
      // =========================

      const numericAmount =
        Number(amount);

      if (
        !Number.isFinite(
          numericAmount
        ) ||
        numericAmount < 1
      ) {
        return res.status(400).json({
          message:
            "Minimum withdrawal amount is $1",
        });
      }

      // =========================
      // METHOD
      // =========================

      const normalizedMethod =
        String(method || "paypal")
          .toLowerCase()
          .trim();

      const normalizedPayoutCurrency =
        String(
          payoutCurrency || ""
        )
          .toUpperCase()
          .trim();

      // =========================
      // CRYPTO VALIDATION
      // =========================

      if (
        normalizedMethod === "crypto" &&
        ![
          "BTC",
          "USDT TRC20",
          "ETH",
        ].includes(
          normalizedPayoutCurrency
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid cryptocurrency",
        });
      }

      // =========================
      // BALANCE CHECK
      // =========================

      const availableBalance =
        Number(user.balance || 0) -
        Number(
          user.reservedBalance || 0
        );

      if (
        availableBalance <
        numericAmount
      ) {
        return res.status(400).json({
          message:
            "Insufficient available balance",
        });
      }

      // =========================
      // FEE
      // =========================

      const fee =
        calculateFee(
          numericAmount,
          normalizedMethod
        );

      const netAmount =
        numericAmount - fee;

      // =========================
      // AML
      // =========================

      await amlEngine({
        user,
        amount:
          numericAmount,
      });

      // =========================
      // RISK
      // =========================

      const risk =
        await riskEngine({
          user,
          amount:
            numericAmount,
        });

      // =========================
      // DATABASE TRANSACTION
      // =========================

      const session =
        await mongoose.startSession();

      let withdrawal;

      try {

        session.startTransaction();

        // =========================
        // RELOAD USER INSIDE SESSION
        // =========================

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

        // =========================
        // FINAL BALANCE CHECK
        // =========================

        const currentAvailable =
          Number(
            user.balance || 0
          ) -
          Number(
            user.reservedBalance || 0
          );

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

        // =========================
        // RESERVE FUNDS
        // =========================

        const beforeBalance =
          Number(
            user.balance || 0
          );

        user.reservedBalance =
          Number(
            user.reservedBalance || 0
          ) +
          numericAmount;

        await user.save({
          session,
        });

        console.log(
          "FUNDS RESERVED:",
          numericAmount
        );

        // =========================
        // WITHDRAWAL RECORD
        // =========================

        const withdrawalDocs =
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

              method:
                normalizedMethod,

              payoutCurrency:
                normalizedMethod ===
                "crypto"
                  ? normalizedPayoutCurrency
                  : null,

              destination,

              riskLevel:
                risk.level,

              requiresManualReview:
                risk.level ===
                "high",

              ipAddress:
                req.ip,
            }],
            {
              session,
            }
          );

        withdrawal =
          withdrawalDocs[0];

        console.log(
          "WITHDRAWAL CREATED:",
          withdrawal._id
        );

        // =========================
        // TRANSACTION RECORD
        // =========================

        await Transaction.create(
          [{
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
              normalizedMethod,

            reference:
              destination,

            status:
              "pending",
          }],
          {
            session,
          }
        );

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

          session,
        });

        console.log(
          "LEDGER CREATED"
        );

        // =========================
        // COMMIT
        // =========================

        await session.commitTransaction();

        console.log(
          "WITHDRAWAL TRANSACTION COMMITTED"
        );

      } catch (transactionError) {

        try {
          await session.abortTransaction();
        } catch (abortError) {
          console.error(
            "WITHDRAWAL ABORT ERROR:",
            abortError
          );
        }

        throw transactionError;

      } finally {

        await session.endSession();

      }

      // =========================
      // NOTIFICATION
      // AFTER COMMIT
      // =========================

      try {

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

      } catch (notificationError) {

        console.error(
          "NOTIFICATION ERROR:",
          notificationError
        );

      }

      // =========================
      // REALTIME EVENTS
      // AFTER COMMIT
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

      return res.json({
        success:
          true,

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

      return res.status(
        err.statusCode || 500
      ).json({
        message:
          err.statusCode
            ? err.message
            : "Withdrawal failed",
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

// =========================
// APPROVE WITHDRAWAL
// =========================

exports.approveWithdrawal =
  async (req, res) => {

    try {

      const withdrawal =
        await Withdrawal.findById(
          req.params.id
        );

      if (!withdrawal) {

        return res.status(404).json({
          message:
            "Withdrawal not found",
        });

      }

      const user =
        await User.findById(
          withdrawal.userId
        );

        console.log(
  "APPROVING WITHDRAWAL",
  withdrawal._id
);

console.log(
  "USER FOUND:",
  user ? user.email : "NO USER"
);

      if (!user) {

        return res.status(404).json({
          message:
            "User not found",
        });

      }

      console.log(
  "BALANCE BEFORE:",
  user.balance
);
// ظ…ظ†ط¹ ط§ظ„ظ…ظˆط§ظپظ‚ط© ط§ظ„ظ…ظƒط±ط±ط©
if (
  withdrawal.status !== "pending"
) {

  return res.status(400).json({
    message:
      "Withdrawal already processed",
  });

}


// ط®طµظ… ط§ظ„ط±طµظٹط¯ ط§ظ„ظ†ظ‡ط§ط¦ظٹ
user.balance -=
  withdrawal.amount;


// طھط­ط±ظٹط± ط§ظ„ظ…ط¨ظ„ط؛ ط§ظ„ظ…ط­ط¬ظˆط²
user.reservedBalance =
  Math.max(
    0,
    (user.reservedBalance || 0) -
    withdrawal.amount
  );


user.totalWithdrawals =
  (user.totalWithdrawals || 0) +
  withdrawal.amount;


await user.save();

await createLedgerEntry({

  userId:
    user._id,

  email:
    user.email,

  type:
    "Withdrawal Completed",

  amount:
    withdrawal.amount,

  balanceBefore:
    user.balance + withdrawal.amount,

  balanceAfter:
    user.balance,

  reference:
    String(withdrawal._id),

  description:
    "Withdrawal approved and funds released",

});

      console.log(
  "BALANCE AFTER:",
  user.balance
);

      withdrawal.status =
        "approved";

      await withdrawal.save();

      await createNotification({
        email:
          withdrawal.email,

        title:
          "Withdrawal Approved",

        message:
          `Your withdrawal of $${withdrawal.amount} has been approved`,
      });

      res.json({
        success: true,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Server error",
      });

    }

  };

  // =========================
// REJECT WITHDRAWAL
// =========================

exports.rejectWithdrawal =
  async (req, res) => {

    try {

      console.log(
        "REJECT API CALLED"
      );

      const withdrawal =
        await Withdrawal.findById(
          req.params.id
        );

      if (!withdrawal) {

        return res.status(404).json({
          message:
            "Withdrawal not found",
        });

      }

      if (
        withdrawal.status ===
        "rejected"
      ) {

        return res.json({
          success: true,
        });

      }

      const user =
        await User.findById(
          withdrawal.userId
        );

     if (user) {

  console.log(
    "RELEASING RESERVED BALANCE",
    withdrawal.amount,
    "FROM",
    user.email

  );

  user.reservedBalance =
    Math.max(
      0,
      Number(user.reservedBalance || 0) -
      Number(withdrawal.amount || 0)
    );

  await user.save();

}

      withdrawal.status =
        "rejected";

      await withdrawal.save();

      await createNotification({
        email:
          withdrawal.email,

        title:
          "Withdrawal Rejected",

        message:
          `Your withdrawal of $${withdrawal.amount} has been rejected and funds returned`,
      });

      res.json({
        success: true,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Server error",
      });

    }

  };