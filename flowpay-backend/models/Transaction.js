const mongoose =
  require("mongoose");

const transactionSchema =
  new mongoose.Schema(
    {
      // =========================
      // TRANSACTION PARTIES
      // =========================

      fromEmail: {
        type: String,
        default: null,
      },

      toEmail: {
        type: String,
        default: null,
      },


      // =========================
      // AMOUNTS
      // =========================

      amount: {
        type: Number,
        required: true,
      },

      fee: {
        type: Number,
        default: 0,
      },

      stripeFee: {
        type: Number,
        default: 0,
      },

      netAmount: {
        type: Number,
      },


      // =========================
      // FEE INFORMATION
      // =========================

      feeType: {
        type: String,

        enum: [
          "internal",
          "paypal",
          "bank",
          "stripe",
          "crypto",
          "external",
          "none",
        ],

        default: "none",
      },

      feeRate: {
        type: Number,
        default: 0,
      },


      // =========================
      // TRANSACTION TYPE
      // =========================

      type: {
        type: String,
        default: null,
      },


      // =========================
      // PAYMENT METHOD
      // =========================

      method: {
        type: String,
        default: null,
      },


      // =========================
      // REFERENCE
      // =========================

      reference: {
        type: String,
        default: null,
      },


      // =========================
      // STATUS
      // =========================

      status: {
        type: String,

        enum: [
          "pending",
          "approved",
          "rejected",
          "completed",
        ],

        default: "completed",
      },


      // =========================
      // REVIEW
      // =========================

      reviewedBy: {
        type: String,
        default: null,
      },

      reviewedAt: {
        type: Date,
        default: null,
      },
    },

    {
      timestamps: true,
    }
  );


module.exports =
  mongoose.model(
    "Transaction",
    transactionSchema
  );
