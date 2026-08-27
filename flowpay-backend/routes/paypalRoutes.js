const express =
  require("express");

const axios =
  require("axios");

const router =
  express.Router();

const {
  getAccessToken,
} = require(
  "../config/paypal"
);

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
// =========================
// CREATE PAYPAL ORDER
// =========================

router.post(
  "/paypal/create-order",

  auth,

  async (req, res) => {

    try {

      const {
        amount,
      } = req.body;


      // =========================
      // USER
      // =========================

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


      // =========================
      // VALIDATE AMOUNT
      // =========================

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
            "Invalid deposit amount",

        });

      }


      if (
        numericAmount < 1
      ) {

        return res.status(400).json({

          message:
            "Minimum PayPal deposit is $1",

        });

      }


      // =========================
      // PAYPAL TOKEN
      // =========================

      const accessToken =
        await getAccessToken();


      // =========================
      // CREATE PAYPAL ORDER
      // =========================

      const paypalUrl =
        process.env.PAYPAL_ENV === "live"

          ? "https://api-m.paypal.com/v2/checkout/orders"

          : "https://api-m.sandbox.paypal.com/v2/checkout/orders";


      const response =
        await axios.post(

          paypalUrl,

          {

            intent:
              "CAPTURE",


            purchase_units: [

              {

                reference_id:
                  String(
                    user._id
                  ),


                description:
                  `FlowPay wallet deposit - ${user.email}`,


                custom_id:
                  String(
                    user._id
                  ),


                amount: {

                  currency_code:
                    "USD",

                  value:
                    numericAmount.toFixed(2),

                },

              },

            ],


            application_context: {

              brand_name:
                "FlowPay",


              landing_page:
                "LOGIN",


              user_action:
                "PAY_NOW",


              shipping_preference:
                "NO_SHIPPING",


              return_url:
                process.env.PAYPAL_RETURN_URL ||
                "https://flu-pay-beta.vercel.app/paypal-success",


              cancel_url:
                process.env.PAYPAL_CANCEL_URL ||
                "https://flu-pay-beta.vercel.app/deposit",

            },

          },


          {

            headers: {

              Authorization:
                `Bearer ${accessToken}`,

              "Content-Type":
                "application/json",

            },

          }

        );


      // =========================
      // SAVE DEPOSIT REQUEST
      // =========================

      await DepositRequest.create({

        userId:
          user._id,


        email:
          user.email,


        amount:
          numericAmount,


        method:
          "paypal",


        reference:
          response.data.id,


        status:
          "Pending",

      });


      const approveUrl =
        response.data.links.find(

          (link) =>
            link.rel === "approve"

        )?.href;



      return res.json({

        success:
          true,


        orderId:
          response.data.id,


        approveUrl,


        paypal:
          response.data,

      });



    } catch (err) {


      console.error(

        "PAYPAL CREATE ORDER ERROR:",

        err.response?.data ||
        err.message

      );


      return res.status(500).json({

        message:
          "PayPal create order failed",


        error:
          err.response?.data ||
          err.message,

      });


    }

  }

);
// =========================
// CAPTURE PAYPAL ORDER
// =========================

router.post(
  "/paypal/capture-order",

  auth,

  async (req, res) => {

    try {

      const {
        orderId,
      } = req.body;


      if (!orderId) {

        return res.status(400).json({
          message:
            "PayPal orderId is required",
        });

      }


      const accessToken =
        await getAccessToken();


      const captureUrl =
        process.env.PAYPAL_ENV === "live"

        ? `https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`

        : `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`;


      const response =
        await axios.post(

          captureUrl,

          {},

          {
            headers: {
              Authorization:
                `Bearer ${accessToken}`,

              "Content-Type":
                "application/json",
            },
          }

        );


      if (
        response.data.status !==
        "COMPLETED"
      ) {

        return res.status(400).json({

          message:
            "PayPal payment not completed",

          status:
            response.data.status,

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

        return res.status(404).json({

          message:
            "Deposit request already processed or not found",

        });

      }



      const duplicated =
        await Transaction.findOne({

          reference:
            orderId,

          type:
            "PayPal Deposit",

          status:
            "completed",

        });


      if (duplicated) {

        return res.status(400).json({

          message:
            "PayPal payment already credited",

        });

      }



      const user =
        await User.findById(
          request.userId
        );


      if (!user) {

        return res.status(404).json({

          message:
            "User not found",

        });

      }



      const fee =
        Number(
          (request.amount * 0.035)
          .toFixed(2)
        );


      const netAmount =
        Number(
          (request.amount - fee)
          .toFixed(2)
        );


      const balanceBefore =
        Number(
          user.balance || 0
        );



      user.balance =
        Number(
          (
            balanceBefore +
            netAmount
          )
          .toFixed(8)
        );


      user.totalDeposits =
        Number(
          user.totalDeposits || 0
        ) +
        Number(
          request.amount
        );


      await user.save();



      request.status =
        "Approved";

      request.approvedAt =
        new Date();

      request.approvedBy =
        user.email;


      await request.save();



      await Transaction.create({

        fromEmail:
          "PAYPAL",

        toEmail:
          user.email,

        amount:
          request.amount,

        fee,

        netAmount,

        feeType:
          "paypal",

        feeRate:
          0.035,

        type:
          "PayPal Deposit",

        method:
          "paypal",

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
          "PayPal Deposit",

        amount:
          netAmount,

        balanceBefore,

        balanceAfter:
          user.balance,

        reference:
          orderId,

        description:
          "PayPal Live payment completed",

      });



      await createNotification({

        email:
          user.email,

        title:
          "PayPal Deposit Completed",

        message:
          `Your PayPal deposit of $${request.amount} has been completed.`,

      });



      return res.json({

        success:
          true,

        message:
          "PayPal deposit completed successfully",

        amount:
          request.amount,

        fee,

        netAmount,

        balance:
          user.balance,

      });



    } catch (err) {

      console.error(

        "PAYPAL CAPTURE ERROR:",

        err.response?.data ||
        err.message

      );


      return res.status(500).json({

        message:
          "PayPal capture failed",

        error:
          err.response?.data ||
          err.message,

      });

    }

  }
);

module.exports =
  router;