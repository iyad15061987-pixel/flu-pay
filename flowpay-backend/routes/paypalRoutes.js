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

  const {
  calculateExternalFee,
} = require(
  "../utils/fees"
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

// ==================================================
// FLOWPAY SIMULATION MODE
// DO NOT CONTACT PAYPAL
// ==================================================

if (
  process.env.FLOWPAY_SIMULATION ===
  "true"
) {

  const simulationReference =
    `SIM-PAYPAL-${Date.now()}-${String(
      user._id
    )}`;

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
      simulationReference,

    status:
      "Pending",

    type:
      "Deposit",

  });

  console.log(
    "FLOWPAY SIMULATION: PayPal order NOT created"
  );

  return res.json({

    success:
      true,

    simulation:
      true,

    message:
      "Simulation mode: PayPal order was NOT created.",

    orderId:
      simulationReference,

    status:
      "Pending",

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


      console.log("PAYPAL ORDER ID:", response.data.id);
      console.log("PAYPAL LINKS:", JSON.stringify(response.data.links, null, 2));

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


      // =========================
      // VALIDATE ORDER ID
      // =========================

      if (!orderId) {

        return res.status(400).json({
          message:
            "PayPal orderId is required",
        });

      }


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

      // ==================================================
// FLOWPAY SIMULATION MODE
// DO NOT CONTACT PAYPAL
// ==================================================

if (
  process.env.FLOWPAY_SIMULATION ===
  "true"
) {

  const request =
    await DepositRequest.findOne({
      reference:
        orderId,

      userId:
        user._id,

    });

  if (!request) {

    return res.status(404).json({

      message:
        "PayPal deposit request not found",

    });

  }

  if (
    request.status !==
    "Pending"
  ) {

    return res.status(400).json({

      message:
        "PayPal deposit request is not pending",

    });

  }

  console.log(
    "FLOWPAY SIMULATION: PayPal capture NOT executed"
  );

  return res.json({

    success:
      true,

    simulation:
      true,

    message:
      "Simulation mode: PayPal capture was NOT executed.",

    orderId:
      orderId,

    status:
      "Pending",

  });
}

      // =========================
      // GET PAYPAL TOKEN
      // =========================

      const accessToken =
        await getAccessToken();


      // =========================
      // GET PAYPAL ORDER
      // =========================

      const orderUrl =
        process.env.PAYPAL_ENV === "live"

          ? `https://api-m.paypal.com/v2/checkout/orders/${orderId}`

          : `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`;


      const orderResponse =
        await axios.get(

          orderUrl,

          {
            headers: {
              Authorization:
                `Bearer ${accessToken}`,

              "Content-Type":
                "application/json",
            },
          }

        );


      const paypalOrder =
        orderResponse.data;


      // =========================
      // FIND DEPOSIT REQUEST
      // =========================

      const request =
        await DepositRequest.findOne({

          reference:
            orderId,

          userId:
            user._id,

        });


      if (!request) {

        return res.status(404).json({

          message:
            "PayPal deposit request not found",

        });

      }


      // =========================
      // PREVENT DUPLICATE CREDIT
      // =========================

      if (
        request.status ===
        "Approved"
      ) {

        return res.status(400).json({

          message:
            "PayPal payment already credited",

        });

      }


      if (
        request.status !==
        "Pending"
      ) {

        return res.status(400).json({

          message:
            "PayPal deposit request is not pending",

        });

      }


      // =========================
      // VERIFY PAYPAL AMOUNT
      // =========================

      const paypalAmount =
        Number(
          paypalOrder
            .purchase_units?.[0]
            ?.amount?.value
        );


      const requestedAmount =
        Number(
          request.amount
        );


      if (
        !Number.isFinite(
          paypalAmount
        ) ||
        paypalAmount !==
          Number(
            requestedAmount.toFixed(2)
          )
      ) {

        return res.status(400).json({

          message:
            "PayPal amount does not match deposit request",

        });

      }


      // =========================
      // CAPTURE PAYPAL PAYMENT
      // =========================

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


      // =========================
      // VERIFY CAPTURE
      // =========================

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


      // =========================
      // PREVENT DUPLICATE
      // =========================

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


      // =========================
      // FEE
      // =========================

    const fee =
  Number(
    calculateExternalFee(
      requestedAmount
    ).toFixed(2)
  );


      // =========================
      // NET AMOUNT
      // =========================

      const netAmount =
        Number(
          (
            requestedAmount -
            fee
          ).toFixed(2)
        );


      if (
        netAmount < 0
      ) {

        return res.status(400).json({

          message:
            "Invalid PayPal deposit fee",

        });

      }


      // =========================
      // BALANCE BEFORE
      // =========================

      const balanceBefore =
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


      const treasuryBefore =
        Number(
          treasury.balance || 0
        );


      // =========================
      // UPDATE USER BALANCE
      // =========================

      user.balance =
        Number(
          (
            balanceBefore +
            netAmount
          ).toFixed(8)
        );


      user.totalDeposits =
        Number(
          user.totalDeposits || 0
        ) +
        requestedAmount;


      // =========================
      // UPDATE TREASURY
      // =========================

      treasury.balance =
        Number(
          (
            treasuryBefore +
            fee
          ).toFixed(8)
        );


      treasury.revenue =
        Number(
          (
            (treasury.revenue || 0) +
            fee
          ).toFixed(8)
        );


      await user.save();

      await treasury.save();


      // =========================
      // MARK REQUEST APPROVED
      // =========================

      request.status =
        "Approved";

      request.approvedAt =
        new Date();

      request.approvedBy =
        user.email;


      await request.save();


      // =========================
      // TRANSACTION
      // =========================

      const transaction =
        await Transaction.create({

          fromEmail:
            "PAYPAL",

          toEmail:
            user.email,

          amount:
            requestedAmount,

          fee:
            fee,

          netAmount:
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


      // =========================
      // LEDGER
      // =========================

      await createLedgerEntry({

        userId:
          user._id,

        email:
          user.email,

        type:
          "PayPal Deposit",

        amount:
          netAmount,

        balanceBefore:
          balanceBefore,

        balanceAfter:
          user.balance,

        reference:
          orderId,

        description:
          "PayPal payment completed",

      });


      // =========================
      // NOTIFICATION
      // =========================

      await createNotification({

        email:
          user.email,

        title:
          "PayPal Deposit Completed",

        message:
          "Your PayPal deposit of $" +
          requestedAmount.toFixed(2) +
          " has been completed. " +
          "Fee: $" +
          fee.toFixed(2) +
          ". Net amount: $" +
          netAmount.toFixed(2) +
          ".",

      });


      // =========================
      // RESPONSE
      // =========================

      return res.json({

        success:
          true,

        message:
          "PayPal deposit completed successfully",

        amount:
          requestedAmount,

        fee:
          fee,

        netAmount:
          netAmount,

        balance:
          user.balance,

        treasuryFee:
          fee,

        transactionId:
          transaction._id,

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
