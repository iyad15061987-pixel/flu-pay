const express = require("express");
const axios = require("axios");

const router = express.Router();

const { auth } = require(
  "../middleware/auth"
);

const User = require(
  "../models/User"
);

const CryptoPayment = require(
  "../models/CryptoPayment"
);

// =========================
// CREATE CRYPTO PAYMENT
// =========================

router.post(
  "/crypto/create-payment",

  auth,

  async (req, res) => {

    console.log(
      "AUTH HEADER:",
      req.headers.authorization
    );

    console.log(
      "CRYPTO PAYMENT REQUEST RECEIVED"
    );

    console.log(
      req.body
    );

    try {

      const {
        amount,
        payCurrency,
      } = req.body;

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

      const response =
        await axios.post(
          "https://api.nowpayments.io/v1/payment",

          {
            price_amount:
              Number(amount),

            price_currency:
              "usd",

            pay_currency:
              payCurrency ||
              "usdttrc20",

            order_id:
              user.email,

            order_description:
              `FlowPay Deposit - ${user.email}`,

            ipn_callback_url:
              "https://flu-pay.onrender.com/api/crypto-webhook",
          },

          {
            headers: {
              "x-api-key":
                process.env
                  .NOWPAYMENTS_API_KEY,

              "Content-Type":
                "application/json",
            },
          }
        );

      // =========================
      // SAVE PAYMENT
      // =========================

      await CryptoPayment.create({

        userId:
          String(user._id),

        email:
          user.email,

        paymentId:
          String(
            response.data.payment_id
          ),

        address:
          response.data.pay_address,

        amount:
          response.data.price_amount,

        currency:
          response.data.pay_currency,

        status:
          response.data.payment_status,

        credited:
          false,
      });

      console.log(
        "NOW RESPONSE:",
        JSON.stringify(
          response.data,
          null,
          2
        )
      );

      return res.json({
        success: true,
        payment: response.data,
      });

    } catch (err) {

      console.log(
        "NOW API KEY EXISTS:",
        !!process.env
          .NOWPAYMENTS_API_KEY
      );

      console.log(
        "FULL ERROR:",
        err
      );

      console.log(
        "NOWPAYMENTS ERROR:",
        err.response?.data ||
        err.message
      );

      return res.status(500).json({
        message:
          "Failed to create payment",
      });

    }

  }
);

module.exports =
  router;