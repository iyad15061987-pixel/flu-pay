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

router.post(
  "/create-crypto-payment",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const {
        price_amount,
        pay_currency,
      } = req.body;

      const response =
        await axios.post(
          "https://api.nowpayments.io/v1/payment",

          {
            price_amount,

            price_currency:
              "usd",

            pay_currency,

            order_id:
              req.user.email,

            ipn_callback_url:
              "https://flu-pay.onrender.com/api/crypto-webhook",
          },

          {
            headers: {
              "x-api-key":
                process
                  .env
                  .NOWPAYMENTS_API_KEY,
            },
          }
        );

      res.json(
        response.data
      );

    } catch (err) {
      console.log(
        err.response?.data ||
          err
      );

      res.status(500).json({
        message:
          "Crypto payment error",
      });
    }
  }
);

module.exports =
  router;