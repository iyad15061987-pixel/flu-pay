const mongoose =
  require("mongoose");

const transactionSchema =
  new mongoose.Schema(
    {
      fromEmail: String,

      toEmail: String,

      amount: Number,

      fee: {
        type: Number,
        default: 0,
      },

      netAmount: Number,

      type: String,

      method: String,

      reference: String,

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