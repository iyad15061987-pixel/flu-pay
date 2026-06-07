const mongoose =
  require("mongoose");

const invoiceSchema =
  new mongoose.Schema(
    {
      merchantId: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref: "User",
      },

      merchantEmail:
        String,

      customerEmail:
        String,

      amount:
        Number,

      currency: {
        type: String,

        default:
          "USD",
      },

      description:
        String,

      paymentLink:
        String,

      status: {
        type: String,

        default:
          "pending",
      },

      // =========================
      // PAYMENT PROCESSOR
      // =========================

      processor: {
        type: String,

        default:
          "paypal",
      },

      // =========================
      // PAYMENT DETAILS
      // =========================

      transactionId:
        String,

      paymentMethod:
        String,

      paidAt:
        Date,
    },

    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Invoice",
    invoiceSchema
  );