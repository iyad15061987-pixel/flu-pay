const mongoose =
  require("mongoose");

const transactionSchema =
  new mongoose.Schema(
    {
      fromEmail: String,

      toEmail: String,

      amount: Number,

      fee: Number,

      netAmount: Number,

      type: String,
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