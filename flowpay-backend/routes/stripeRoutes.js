const express =
  require("express");

const Stripe =
  require("stripe");

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


const DepositRequest =
  require(
    "../models/DepositRequest"
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



const stripe =
  new Stripe(
    process.env.STRIPE_SECRET_KEY
  );



// ==================================================
// CREATE STRIPE CHECKOUT SESSION
// ==================================================

router.post(

  "/stripe/create-checkout",

  auth,

  async (req, res) => {


    try {


      const amount =
        Number(
          req.body.amount
        );


      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {

        return res.status(400).json({

          message:
            "Invalid amount",

        });

      }



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



      const session =
        await stripe.checkout.sessions.create({

          mode:
            "payment",

          payment_intent_data: {
            metadata: {
              userId: String(user._id),
              email: user.email,
              amount: String(amount),
            },
          },

          payment_method_types: [

            "card",

          ],


          line_items: [

            {

              price_data: {

                currency:
                  "usd",


                product_data: {

                  name:
                    "FlowPay Wallet Deposit",

                },


                unit_amount:
                  Math.round(
                    amount * 100
                  ),

              },


              quantity:
                1,

            },

          ],


          metadata: {

            userId:
              String(
                user._id
              ),

            email:
              user.email,

            amount:
              String(
                amount
              ),

          },


          success_url:
            process.env.STRIPE_SUCCESS_URL ||
            "https://flu-pay-beta.vercel.app/deposit-success",


          cancel_url:
            process.env.STRIPE_CANCEL_URL ||
            "https://flu-pay-beta.vercel.app/deposit",


        });



      await DepositRequest.create({

        userId:
          user._id,

        email:
          user.email,

        amount,

        method:
          "stripe",

        reference:
          session.id,

        status:
          "Pending",

      });



      return res.json({

        success:
          true,

        sessionId:
          session.id,

        url:
          session.url,

      });



    } catch(err) {


      console.error(

        "STRIPE CREATE ERROR:",

        err.message

      );


      return res.status(500).json({

        message:
          "Stripe checkout creation failed",

      });


    }


  }

);




// ==================================================
// STRIPE WEBHOOK
// ==================================================

router.post(

  "/stripe/webhook",

  express.raw({
    type:
      "application/json",
  }),


  async (req,res)=>{


    try {


      const signature =
        req.headers[
          "stripe-signature"
        ];


      const event =
        stripe.webhooks.constructEvent(

          req.body,

          signature,

          process.env.STRIPE_WEBHOOK_SECRET

        );


      if (
        event.type ===
        "checkout.session.completed"
      ) {

        const session =
          event.data.object;

        const orderId =
          session.id;

        // ==================================================
        // FIND EXISTING TRANSACTION
        // ==================================================

        const exists =
          await Transaction.findOne({
            reference:
              orderId,

            type:
              "Stripe Deposit",
          });

        if (exists) {

          return res.json({
            received:
              true,
          });

        }

        // ==================================================
        // FIND PENDING DEPOSIT REQUEST
        // ==================================================

        const request =
          await DepositRequest.findOne({

            reference:
              orderId,

            status:
              "Pending",

          });

        if (!request) {

          return res.json({
            received:
              true,
          });

        }

        // ==================================================
        // FIND USER
        // ==================================================

        const user =
          await User.findById(
            request.userId
          );

        if (!user) {

          return res.json({
            received:
              true,
          });

        }

        // ==================================================
        // VERIFY PAYMENT AMOUNT
        // ==================================================

        const sessionAmount =
          Number(
            session.amount_total || 0
          ) / 100;

        if (
          Math.abs(
            sessionAmount -
            request.amount
          ) > 0.01
        ) {

          console.error(
            "STRIPE AMOUNT MISMATCH:",
            {
              sessionAmount,
              requestAmount:
                request.amount,
              sessionId:
                orderId,
            }
          );

          return res.status(400).json({
            message:
              "Stripe payment amount mismatch",
          });

        }

        // ==================================================
        // FLOWPAY FEE
        // 3.5%
        // ==================================================

        const flowPayFee =
          Number(
            (
              request.amount *
              0.035
            ).toFixed(2)
          );
        // ==================================================
        // STRIPE ACTUAL FEE
        // ==================================================

        let stripeFee = null;

        try {

          const paymentIntentId =
            session.payment_intent;

          if (!paymentIntentId) {
            throw new Error(
              "Stripe PaymentIntent ID not found"
            );
          }

          const paymentIntent =
            await stripe.paymentIntents.retrieve(
              paymentIntentId,
              {
                expand: [
                  "latest_charge.balance_transaction",
                ],
              }
            );

          const charge =
            paymentIntent.latest_charge;

          if (
            !charge ||
            typeof charge === "string" ||
            !charge.balance_transaction
          ) {
            throw new Error(
              "Stripe balance transaction not available"
            );
          }

          const balanceTransaction =
            charge.balance_transaction;

          if (
            typeof balanceTransaction === "string"
          ) {
            throw new Error(
              "Stripe balance transaction was not expanded"
            );
          }

          stripeFee =
            Number(
              (
                balanceTransaction.fee / 100
              ).toFixed(2)
            );

          if (
            !Number.isFinite(stripeFee) ||
            stripeFee < 0
          ) {
            throw new Error(
              "Invalid Stripe fee returned"
            );
          }

        } catch (stripeFeeError) {

          console.error(
            "STRIPE FEE RETRIEVAL ERROR:",
            stripeFeeError.message
          );

          return res.status(500).json({
            message:
              "Unable to verify Stripe processing fee",
          });
        }

        // ==================================================
        // USER NET AMOUNT
        // FLOWPAY COMMISSION = 3.5%
        // ==================================================

        const netAmount =
          Number(
            (
              request.amount -
              flowPayFee
            ).toFixed(2)
          );

        if (
          !Number.isFinite(
            netAmount
          ) ||
          netAmount < 0
        ) {

          return res.status(400).json({
            message:
              "Invalid net deposit amount",
          });

        }

                // ==================================================
        // FLOWPAY NET REVENUE
        // FLOWPAY FEE - STRIPE FEE
        // ==================================================

        const flowPayRevenue =
          Number(
            (
              flowPayFee -
              stripeFee
            ).toFixed(2)
          );

        if (
          !Number.isFinite(flowPayRevenue) ||
          flowPayRevenue < 0
        ) {

          console.error(
            "INVALID FLOWPAY NET REVENUE:",
            {
              flowPayFee,
              stripeFee,
              flowPayRevenue,
              sessionId: orderId,
            }
          );

          return res.status(500).json({
            message:
              "Invalid FlowPay revenue calculation",
          });
        }

        // ==================================================
        // USER BALANCE
        // ==================================================

        const beforeBalance =
          user.balance || 0;

        user.balance +=
          netAmount;

        user.totalDeposits =
          (user.totalDeposits || 0) +
          request.amount;

        // ==================================================
        // FLOWPAY TREASURY REVENUE
        // ==================================================

        const treasury =
          await User.findOne({
            accountType: "treasury",
            email: "treasury@flowpay.internal",
          });

        if (!treasury) {

          console.error(
            "STRIPE TREASURY ACCOUNT NOT FOUND"
          );

          return res.status(500).json({
            message:
              "Treasury account not configured",
          });
        }

        // FlowPay receives the customer fee
        // minus the actual Stripe processing fee.

        treasury.balance =
          (treasury.balance || 0) +
          flowPayRevenue;

        treasury.revenue =
          (treasury.revenue || 0) +
          flowPayRevenue;

        await user.save();

        await treasury.save();

        // ==================================================
        // APPROVE DEPOSIT REQUEST
        // ==================================================

        request.status =
          "Approved";

        request.approvedAt =
          new Date();

        await request.save();

        // ==================================================
        // TRANSACTION
        // ==================================================

        await Transaction.create({

          fromEmail:
            "STRIPE",

          toEmail:
            user.email,

          amount:
            request.amount,

          // FlowPay's 3.5% customer fee
          fee:
            flowPayFee,

          // Actual Stripe processing fee
          stripeFee:
            stripeFee,

          netAmount:
            netAmount,

          feeType:
            "stripe",

          // FlowPay fee rate
          feeRate:
            0.035,

          type:
            "Stripe Deposit",

          method:
            "stripe",

          reference:
            orderId,

          status:
            "completed",

        });

        // ==================================================
        // LEDGER
        // ==================================================

        await createLedgerEntry({

          userId:
            user._id,

          email:
            user.email,

          type:
            "Stripe Deposit",

          amount:
            netAmount,

          balanceBefore:
            beforeBalance,

          balanceAfter:
            user.balance,

          reference:
            orderId,

          description:
            `Stripe payment completed. FlowPay fee: $${flowPayFee.toFixed(2)}. Stripe fee: $${stripeFee.toFixed(2)}. FlowPay net revenue: $${flowPayRevenue.toFixed(2)}.`,

        });

        // ==================================================
        // NOTIFICATION
        // ==================================================

        await createNotification({

          email:
            user.email,

          title:
            "Stripe Deposit Completed",

          message:
            `Your Stripe deposit of $${request.amount.toFixed(2)} has been completed. FlowPay fee: $${flowPayFee.toFixed(2)}. Amount added to your balance: $${netAmount.toFixed(2)}.`,

        });

      }


      res.json({

        received:
          true,

      });



    } catch(err) {


      console.error(

        "STRIPE WEBHOOK ERROR:",

        err.message

      );


      res.status(400).send(

        `Webhook Error: ${err.message}`

      );


    }


  }

);



module.exports =
  router;