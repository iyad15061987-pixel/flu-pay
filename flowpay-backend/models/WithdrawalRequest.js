const mongoose =
  require("mongoose");

const withdrawalRequestSchema =
  new mongoose.Schema(
    {
      userId: String,

      email: String,

      currency:
        String,

      address:
        String,

      amount:
        Number,

      fee:
        Number,

      status: {
        type: String,

        default:
          "Pending",
      },

      approvals: {
        type: Number,

        default: 0,
      },

      approvedBy:
        [String],

      txHash:
        String,
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "WithdrawalRequest",
    withdrawalRequestSchema
  );