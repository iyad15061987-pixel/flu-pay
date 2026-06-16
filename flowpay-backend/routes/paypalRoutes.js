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

// =========================
// CREATE PAYPAL ORDER
// =========================

router.post(
  "/paypal/create-order",

  async (req, res) => {
    try {

      const {
        amount,
      } = req.body;

      const accessToken =
        await getAccessToken();

      const response =
        await axios.post(
          process.env.PAYPAL_ENV ===
          "live"
            ? "https://api-m.paypal.com/v2/checkout/orders"
            : "https://api-m.sandbox.paypal.com/v2/checkout/orders",

          {
            intent:
              "CAPTURE",

            purchase_units: [
              {
                amount: {
                  currency_code:
                    "USD",

                  value:
                    Number(amount)
                      .toFixed(2),
                },
              },
            ],
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

      return res.json(
        response.data
      );

    } catch (err) {

      console.log(
        err.response?.data ||
        err.message
      );

      return res.status(500).json({
        message:
          "PayPal create order failed",
      });

    }
  }
);

module.exports =
  router;