const mongoose =
  require("mongoose");

const cardTransactionSchema =
  new mongoose.Schema(
    {
      cardId: {
        type:
          mongoose.Schema
            .Types.ObjectId,

        ref:
          "VirtualCard",
      },

      email:
        String,

      merchant:
        String,

      amount:
        Number,

      status: {
        type: String,

        default:
          "completed",
      },

      type: {
        type: String,

        default:
          "purchase",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "CardTransaction",
    cardTransactionSchema
  );