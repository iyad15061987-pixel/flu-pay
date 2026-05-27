const mongoose =
  require("mongoose");

const accountingEntrySchema =
  new mongoose.Schema(
    {
      transactionId: {
        type:
          mongoose.Schema
            .Types.ObjectId,

        ref:
          "Transaction",
      },

      account: String,

      type: {
        type: String,

        enum: [
          "debit",
          "credit",
        ],
      },

      amount: Number,

      currency: {
        type: String,

        default:
          "USD",
      },

      description:
        String,
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "AccountingEntry",
    accountingEntrySchema
  );