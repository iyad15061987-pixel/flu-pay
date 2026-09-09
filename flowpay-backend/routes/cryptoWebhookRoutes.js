function sortObject(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sortObject(item));
  }

  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = sortObject(obj[key]);
      return result;
    }, {});
}

const express =
  require("express");

const mongoose =
  require("mongoose");

const router =
  express.Router();

const User =
  require(
    "../models/User"
  );

const Withdrawal =
  require(
    "../models/Withdrawal"
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

const {
  settleCryptoWithdrawal,
  refundCryptoWithdrawal,
} = require(
  "../utils/cryptoWithdrawalSettlement"
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
            JSON.stringify(sortObject(data))
          )
          .digest("hex");


      if (
        !signature ||
        signature.length !== hmac.length ||
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
      // =========================
      // =========================
      // NOWPAYMENTS PAYOUT WEBHOOK
      // =========================

      if (data.payout_status) {

        console.log(
          "NOWPAYMENTS PAYOUT WEBHOOK:",
          data
        );

        const payoutStatus =
          String(
            data.payout_status ||
            data.status ||
            ""
          ).toLowerCase();

        const payoutId =
          data.id ||
          data.payout_id ||
          null;

        const batchId =
          data.batchId ||
          data.batch_id ||
          null;

        const uniqueExternalId =
          data.uniqueExternalId ||
          data.unique_external_id ||
          null;

        if (
          !payoutId &&
          !batchId &&
          !uniqueExternalId
        ) {
          return res.status(400).json({
            success: false,
            message:
              "NOWPayments payout webhook identifiers are missing",
          });
        }

        const payoutWithdrawal =
          await Withdrawal.findOne({
            method: "crypto",
            $or: [
              ...(payoutId
                ? [{
                    nowPaymentsWithdrawalId:
                      String(payoutId),
                  }]
                : []),

              ...(batchId
                ? [{
                    nowPaymentsBatchId:
                      String(batchId),
                  }]
                : []),

              ...(uniqueExternalId
                ? [{
                    nowPaymentsExternalId:
                      String(uniqueExternalId),
                  }]
                : []),
            ],
          });

        if (!payoutWithdrawal) {

          console.error(
            "NOWPAYMENTS PAYOUT WITHDRAWAL NOT FOUND:",
            {
              payoutId,
              batchId,
              uniqueExternalId,
              payoutStatus,
            }
          );

          return res.status(404).json({
            success: false,
            message:
              "FlowPay crypto withdrawal not found",
          });
        }

        console.log(
          "NOWPAYMENTS PAYOUT MATCHED:",
          {
            withdrawalId:
              String(payoutWithdrawal._id),
            payoutId,
            batchId,
            uniqueExternalId,
            payoutStatus,
          }
        );

        if (payoutId) {
          payoutWithdrawal.nowPaymentsWithdrawalId =
            String(payoutId);
        }

        if (batchId) {
          payoutWithdrawal.nowPaymentsBatchId =
            String(batchId);
        }

        if (uniqueExternalId) {
          payoutWithdrawal.nowPaymentsExternalId =
            String(uniqueExternalId);
        }

        payoutWithdrawal.nowPaymentsStatus =
          payoutStatus;

        await payoutWithdrawal.save();


        // =========================
        // SUCCESSFUL PAYOUT
        // =========================

        if (
          payoutStatus === "finished" ||
          payoutStatus === "completed" ||
          payoutStatus === "success" ||
          payoutStatus === "successful"
        ) {

          try {

            const settlement =
              await settleCryptoWithdrawal(
                payoutWithdrawal._id,
                payoutStatus
              );

            console.log(
              "NOWPAYMENTS PAYOUT SETTLEMENT RESULT:",
              {
                withdrawalId:
                  String(
                    payoutWithdrawal._id
                  ),
                status:
                  settlement.status,
                alreadyProcessed:
                  settlement.alreadyProcessed,
              }
            );

            if (
              settlement.user &&
              settlement.amount
            ) {

              try {

                await Notification.create({
                  userId:
                    settlement.user._id,
                  type:
                    "withdrawal",
                  title:
                    "Crypto withdrawal completed",
                  message:
                    `Your crypto withdrawal of $${Number(
                      settlement.amount
                    ).toFixed(2)} has been completed.`,
                  read:
                    false,
                });

              } catch (notificationError) {

                console.error(
                  "CRYPTO WEBHOOK NOTIFICATION ERROR:",
                  notificationError
                );

              }

            }

            return res.json({
              success: true,
              message:
                "NOWPayments payout completed and FlowPay withdrawal settled",
              payoutStatus,
              withdrawalId:
                payoutWithdrawal._id,
              nowPaymentsWithdrawalId:
                payoutWithdrawal.nowPaymentsWithdrawalId,
              nowPaymentsBatchId:
                payoutWithdrawal.nowPaymentsBatchId,
              nowPaymentsExternalId:
                payoutWithdrawal.nowPaymentsExternalId,
              alreadyProcessed:
                settlement.alreadyProcessed,
            });

          } catch (settlementError) {

            console.error(
              "NOWPAYMENTS PAYOUT SETTLEMENT ERROR:",
              settlementError
            );

            return res.status(500).json({
              success: false,
              message:
                "NOWPayments payout completed but FlowPay settlement failed",
              error:
                settlementError.message,
              withdrawalId:
                payoutWithdrawal._id,
            });

          }

        }


        // =========================
        // FAILED PAYOUT
        // =========================

        if (
          payoutStatus === "failed" ||
          payoutStatus === "rejected" ||
          payoutStatus === "cancelled" ||
          payoutStatus === "canceled"
        ) {

          try {

            const refund =
              await refundCryptoWithdrawal(
                payoutWithdrawal._id,
                payoutStatus
              );

            console.log(
              "NOWPAYMENTS PAYOUT REFUND RESULT:",
              {
                withdrawalId:
                  String(
                    payoutWithdrawal._id
                  ),
                status:
                  refund.status,
                alreadyProcessed:
                  refund.alreadyProcessed,
              }
            );

            if (
              refund.user &&
              refund.amount
            ) {

              try {

                await Notification.create({
                  userId:
                    refund.user._id,
                  type:
                    "withdrawal",
                  title:
                    "Crypto withdrawal refunded",
                  message:
                    `Your crypto withdrawal of $${Number(
                      refund.amount
                    ).toFixed(2)} was rejected and the USD funds were released.`,
                  read:
                    false,
                });

              } catch (notificationError) {

                console.error(
                  "CRYPTO WEBHOOK REFUND NOTIFICATION ERROR:",
                  notificationError
                );

              }

            }

            return res.json({
              success: true,
              message:
                "NOWPayments payout failed and FlowPay funds were refunded",
              payoutStatus,
              withdrawalId:
                payoutWithdrawal._id,
              nowPaymentsWithdrawalId:
                payoutWithdrawal.nowPaymentsWithdrawalId,
              nowPaymentsBatchId:
                payoutWithdrawal.nowPaymentsBatchId,
              nowPaymentsExternalId:
                payoutWithdrawal.nowPaymentsExternalId,
              alreadyProcessed:
                refund.alreadyProcessed,
            });

          } catch (refundError) {

            console.error(
              "NOWPAYMENTS PAYOUT REFUND ERROR:",
              refundError
            );

            return res.status(500).json({
              success: false,
              message:
                "NOWPayments payout failed but FlowPay refund failed",
              error:
                refundError.message,
              withdrawalId:
                payoutWithdrawal._id,
            });

          }

        }


        // =========================
        // NON-TERMINAL STATUS
        // =========================

        return res.json({
          success: true,
          message:
            "NOWPayments payout status recorded",
          payoutStatus,
          withdrawalId:
            payoutWithdrawal._id,
          nowPaymentsWithdrawalId:
            payoutWithdrawal.nowPaymentsWithdrawalId,
          nowPaymentsBatchId:
            payoutWithdrawal.nowPaymentsBatchId,
          nowPaymentsExternalId:
            payoutWithdrawal.nowPaymentsExternalId,
        });

      }
      // SUCCESS ONLY
      // =========================
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


      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {

        return res.status(400).json({
          message:
            "Invalid crypto payment amount",
        });

      }

      payment.priceAmount =
        amount;


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
      // ATOMIC CRYPTO DEPOSIT
      // =========================

      let transaction = null;
      let creditedUser = null;

      let depositSession = null;
      let depositCommitted = false;

      try {

        depositSession =
          await mongoose.startSession();

        depositSession.startTransaction();

        const depositPayment =
          await CryptoPayment.findOne({
            _id:
              payment._id,
            paymentId:
              String(
                data.payment_id
              ),
          }).session(
            depositSession
          );

        if (!depositPayment) {

          throw new Error(
            "Payment not found during crypto deposit settlement"
          );

        }

        const duplicateTransaction =
          await Transaction.findOne({
            reference:
              String(
                data.payment_id
              ),
          }).session(
            depositSession
          );

        if (
          duplicateTransaction ||
          depositPayment.credited === true
        ) {

          await depositSession.abortTransaction();

          return res.json({
            success:
              true,
            message:
              "Crypto deposit already processed",
          });

        }

        const depositUser =
          await User.findById(
            depositPayment.userId
          ).session(
            depositSession
          );

        if (!depositUser) {

          throw new Error(
            "User not found during crypto deposit settlement"
          );

        }

        const depositTreasury =
          await User.findOne({
            accountType:
              "treasury",
          }).session(
            depositSession
          );

        if (!depositTreasury) {

          throw new Error(
            "Treasury account not found"
          );

        }

        const balanceBefore =
          Number(
            depositUser.balance || 0
          );

        const totalDepositsBefore =
          Number(
            depositUser.totalDeposits || 0
          );

        const treasuryBalanceBefore =
          Number(
            depositTreasury.balance || 0
          );

        const treasuryRevenueBefore =
          Number(
            depositTreasury.revenue || 0
          );

        if (
          !Number.isFinite(
            balanceBefore
          ) ||
          !Number.isFinite(
            totalDepositsBefore
          ) ||
          !Number.isFinite(
            treasuryBalanceBefore
          ) ||
          !Number.isFinite(
            treasuryRevenueBefore
          )
        ) {

          throw new Error(
            "Invalid balance data during crypto deposit settlement"
          );

        }

        depositUser.balance =
          balanceBefore +
          netAmount;

        depositUser.totalDeposits =
          totalDepositsBefore +
          amount;

        depositTreasury.balance =
          treasuryBalanceBefore +
          fee;

        depositTreasury.revenue =
          treasuryRevenueBefore +
          fee;

        await depositUser.save({
          session:
            depositSession,
        });

        await depositTreasury.save({
          session:
            depositSession,
        });

        const createdTransactions =
          await Transaction.create(
            [{
              fromEmail:
                "Blockchain",

              toEmail:
                depositUser.email,

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

            }],
            {
              session:
                depositSession,
            }
          );

        transaction =
          createdTransactions[0];

        if (!transaction) {

          throw new Error(
            "Crypto deposit transaction was not created"
          );

        }

        depositPayment.priceAmount =
          amount;

        depositPayment.credited =
          true;

        depositPayment.creditedAt =
          new Date();

        depositPayment.status =
          "finished";

        depositPayment.paymentStatus =
          "finished";

        depositPayment.cryptoReceived =
          Number(
            data.actually_paid || 0
          );

        depositPayment.transactionHash =
          data.payin_hash ||
          data.txid ||
          null;

        depositPayment.confirmations =
          Number(
            data.confirmations || 0
          );

        await depositPayment.save({
          session:
            depositSession,
        });

        await createLedgerEntry({

          userId:
            depositUser._id,

          email:
            depositUser.email,

          type:
            "Crypto Deposit",

          amount:
            netAmount,

          balanceBefore:
            balanceBefore,

          balanceAfter:
            depositUser.balance,

          reference:
            String(
              data.payment_id
            ),

          description:
            `Automatic blockchain deposit - ${fee.toFixed(4)} USD crypto fee`,

          session:
            depositSession,

        });

        await depositSession.commitTransaction();

        depositCommitted =
          true;

        creditedUser =
          depositUser;


      } catch (depositError) {

        console.error(
          "CRYPTO DEPOSIT SETTLEMENT ERROR:",
          depositError
        );

        if (
          depositSession &&
          !depositCommitted
        ) {

          try {

            await depositSession.abortTransaction();

          } catch (abortError) {

            console.error(
              "CRYPTO DEPOSIT SETTLEMENT ABORT ERROR:",
              abortError
            );

          }

        }

        throw depositError;

      } finally {

        if (depositSession) {

          try {

            await depositSession.endSession();

          } catch (sessionError) {

            console.error(
              "CRYPTO DEPOSIT SETTLEMENT SESSION ERROR:",
              sessionError
            );

          }

        }

      }
      // =========================
      // NOTIFICATION
      // =========================

      await Notification.create({

        email:
          creditedUser.email,

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
              creditedUser.email,

            balance:
              creditedUser.balance,

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
          creditedUser.balance,

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




















