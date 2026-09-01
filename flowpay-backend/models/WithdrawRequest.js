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

      approvedBy: {
  type: String,
  default: null,
},

approvedAt: {
  type: Date,
  default: null,
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