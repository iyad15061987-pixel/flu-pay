const mongoose =
  require("mongoose");

const depositRequestSchema =
  new mongoose.Schema(
    {
      userId: String,

      email: String,

      amount: Number,

      method: String,

      status: {
        type: String,
        default: "Pending",
      },

      type: {
        type: String,
        default: "Deposit",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "DepositRequest",
    depositRequestSchema
  );