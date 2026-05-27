const mongoose =
  require("mongoose");

const virtualCardSchema =
  new mongoose.Schema(
    {
      userId: {
        type:
          mongoose.Schema
            .Types.ObjectId,

        ref: "User",
      },

      email: String,

      cardNumber: String,

      cvv: String,

      expiry: String,

      type: {
        type: String,

        default:
          "virtual",
      },

      status: {
        type: String,

        default:
          "active",
      },

      balance: {
        type: Number,

        default: 0,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "VirtualCard",
    virtualCardSchema
  );