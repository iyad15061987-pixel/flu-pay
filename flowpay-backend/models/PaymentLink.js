const mongoose =
  require("mongoose");

const paymentLinkSchema =
  new mongoose.Schema(
    {
      userId: {
        type:
          mongoose.Schema
            .Types.ObjectId,

        ref: "User",
      },

      email:
        String,

      // =========================
      // INVOICE DATA
      // =========================

      invoiceNumber: {
        type:
          String,

        unique:
          true,
      },

      customerName:
        String,

      customerEmail:
        String,

      dueDate:
        Date,

      // =========================
      // PAYMENT DATA
      // =========================

      title:
        String,

      amount:
        Number,

      description:
        String,

      code: {
        type:
          String,

        unique:
          true,
      },

      active: {
        type:
          Boolean,

        default:
          true,
      },

      status: {
        type:
          String,

       enum: [
  "pending",
  "paid",
  "refunded",
  "overdue",
],

        default:
          "pending",
      },

      paidAt:
        Date,
    },

    {
      timestamps:
        true,
    }
  );

module.exports =
  mongoose.model(
    "PaymentLink",
    paymentLinkSchema
  );