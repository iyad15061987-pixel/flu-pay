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

const numericAmount =
  Number(amount);

if (
  isNaN(numericAmount) ||
  numericAmount <= 0
) {
  return res.status(400).json({
    message:
      "Invalid amount",
  });
}

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
    (l) =>
      l.rel ===
      "approve"
  )?.href;

return res.json({
  orderId:
    response.data.id,

  approveUrl,

  paypal:
    response.data,
});

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

      const accessToken =
        await getAccessToken();

      const response =
        await axios.post(
          (
            process.env.PAYPAL_ENV ===
            "live"
          )
            ? `https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`
            : `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,

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
            "Payment not completed",
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
            "Deposit request not found",
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
          request.amount
        ) * 0.035;

      const netAmount =
        Number(
          request.amount
        ) - fee;

      const beforeBalance =
        user.balance;

      user.balance +=
        netAmount;

      user.revenue =
        (user.revenue || 0) +
        fee;

      user.totalDeposits =
        (user.totalDeposits || 0) +
        Number(
          request.amount
        );

      await user.save();

      request.status =
        "Approved";

      request.approvedAt =
        new Date();

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

        type:
          "Deposit",

        reference:
          orderId,

        method:
          "paypal",
      });

      await createLedgerEntry({
        userId:
          user._id,

        email:
          user.email,

        type:
          "Deposit",

        amount:
          netAmount,

        balanceBefore:
          beforeBalance,

        balanceAfter:
          user.balance,

        reference:
          orderId,

        description:
          "PayPal deposit completed",
      });

      await createNotification({
        email:
          user.email,

        title:
          "Deposit Approved",

        message:
          `Your PayPal deposit of $${request.amount} was completed`,
      });

      return res.json({
        success: true,
        message:
          "Deposit completed",
      });

    } catch (err) {

      console.log(
        err.response?.data ||
        err.message
      );

      return res.status(500).json({
        message:
          "PayPal capture failed",
      });
    }
  }
);

module.exports =
  router;