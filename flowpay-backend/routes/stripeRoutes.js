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



        const fee =
          Number(
            (request.amount * 0.029)
            .toFixed(2)
          );


        const netAmount =
          Number(
            (request.amount - fee)
            .toFixed(2)
          );



        const beforeBalance =
          user.balance || 0;



        user.balance +=
          netAmount;


        user.totalDeposits =
          (user.totalDeposits || 0)
          +
          request.amount;



        await user.save();



        request.status =
          "Approved";


        request.approvedAt =
          new Date();


        await request.save();




        await Transaction.create({

          fromEmail:
            "STRIPE",

          toEmail:
            user.email,

          amount:
            request.amount,

          fee,

          netAmount,

          feeType:
            "stripe",

          feeRate:
            0.029,

          type:
            "Stripe Deposit",

          method:
            "stripe",

          reference:
            orderId,

          status:
            "completed",

        });




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
            "Stripe payment completed",

        });




        await createNotification({

          email:
            user.email,

          title:
            "Stripe Deposit Completed",

          message:
            `Your Stripe deposit of $${request.amount} has been completed.`,

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