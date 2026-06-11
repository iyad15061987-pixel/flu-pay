const mongoose =
  require("mongoose");

const depositRequestSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      email: {
        type: String,
        required: true,
      },

      amount: {
        type: Number,
        required: true,
      },

      method: {
        type: String,
        default: "paypal",
      },

      reference: {
        type: String,
        default: "",
      },

      status: {
        type: String,
        enum: [
          "Pending",
          "Approved",
          "Rejected",
        ],
        default: "Pending",
      },

      adminNote: {
        type: String,
        default: "",
      },

      approvedBy: {
        type: String,
        default: null,
      },

      approvedAt: {
        type: Date,
        default: null,
      },

      rejectedAt: {
        type: Date,
        default: null,
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