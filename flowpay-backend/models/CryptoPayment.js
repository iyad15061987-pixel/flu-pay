const mongoose =
  require("mongoose");

const cryptoPaymentSchema =
  new mongoose.Schema({

    userId: String,

    email: String,

    paymentId: String,

    address: String,

    amount: Number,

    currency: String,

    status: {
      type: String,
      default: "waiting",
    },

    credited: {
      type: Boolean,
      default: false,
    },

  }, {
    timestamps: true,
  });

module.exports =
  mongoose.model(
    "CryptoPayment",
    cryptoPaymentSchema
  );