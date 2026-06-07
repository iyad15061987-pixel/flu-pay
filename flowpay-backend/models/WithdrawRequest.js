const mongoose =
  require("mongoose");

const withdrawRequestSchema =
  new mongoose.Schema(
    {
      userId: String,

      email: String,

      amount: Number,

      method: String,

      wallet: String,

      status: {
        type: String,
        default: "Pending",
      },

      type: {
        type: String,
        default: "Withdraw",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "WithdrawRequest",
    withdrawRequestSchema
  );