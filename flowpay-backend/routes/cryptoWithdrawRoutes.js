const express =
  require("express");

const axios =
  require("axios");

const router =
  express.Router();

const {
  auth,
} = require(
  "../middleware/auth"
);

const User =
  require(
    "../models/User"
  );

const Notification =
  require(
    "../models/Notification"
  );

const Transaction =
  require(
    "../models/Transaction"
  );

const WithdrawalRequest =
  require(
    "../models/WithdrawalRequest"
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
// CREATE CRYPTO WITHDRAW
// =========================

router.post(
  "/crypto-withdraw",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const {
        currency,
        address,
        amount,
      } = req.body;

      const user =
        await User.findById(
          req.user.id
        );

      const numericAmount =
        Number(amount);

      if (
        numericAmount <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid amount",
        });
      }

      // =========================
      // FEES
      // =========================

      const fee =
        calculateExternalFee(
          numericAmount
        );

      if (
        user.balance <
        numericAmount
      ) {
        return res.status(400).json({
          message:
            "Insufficient balance",
        });
      }

      const before =
        user.balance;

      let payout = null;

      // =========================
      // LARGE WITHDRAWALS
      // =========================

      if (
        numericAmount >=
        3000
      ) {
        await WithdrawalRequest.create({
          userId:
            user._id,

          email:
            user.email,

          currency,

          address,

          amount:
            numericAmount,

          fee,
        });

      } else {
        payout =
          await axios.post(
            "https://api.nowpayments.io/v1/payout",

            {
              withdrawals: [
                {
                  address,

                  currency,

                  amount:
                    numericAmount -
                    fee,

                  userData:
                    user.email,
                },
              ],
            },

            {
              headers: {
                "x-api-key":
                  process
                    .env
                    .NOWPAYMENTS_API_KEY,

                "Content-Type":
                  "application/json",
              },
            }
          );
      }

      // =========================
      // UPDATE BALANCE
      // =========================

      user.balance -=
        numericAmount;

      user.revenue +=
        fee;

      await user.save();

      // =========================
      // TRANSACTION
      // =========================

      await Transaction.create({
        fromEmail:
          user.email,

        toEmail:
          address,

        amount:
          numericAmount,

        fee,

        netAmount:
          numericAmount -
          fee,

        type:
          "Crypto Withdraw",
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
          "Crypto Withdraw",

        amount:
          numericAmount,

        balanceBefore:
          before,

        balanceAfter:
          user.balance,

        reference:
          address,

        description:
          "Automatic crypto withdrawal",
      });

      // =========================
      // NOTIFICATION
      // =========================

      await Notification.create({
        email:
          user.email,

        title:
          "Crypto Withdraw",

        message:
          numericAmount >=
          3000
            ? "Your withdrawal is pending admin approval."
            : `Your withdrawal of $${numericAmount} has been processed.`,
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
          numericAmount >=
          3000
            ? "Withdrawal pending admin approval"
            : "Withdrawal sent",

        payout:
          payout
            ? payout.data
            : null,
      });

    } catch (err) {
      console.log(
        err.response?.data ||
          err
      );

      res.status(500).json({
        message:
          "Withdraw error",
      });
    }
  }
);

module.exports =
  router;