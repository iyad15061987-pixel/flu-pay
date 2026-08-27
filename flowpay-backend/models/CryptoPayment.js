const mongoose =
  require("mongoose");


const cryptoPaymentSchema =
  new mongoose.Schema(

    {

      // =========================
      // USER
      // =========================

      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },


      email: {
        type: String,
        required: true,
      },


      // =========================
      // NOWPAYMENTS
      // =========================

      paymentId: {
        type: String,
        required: true,
        unique: true,
      },


      paymentStatus: {
        type: String,
        default: "waiting",
      },


      // =========================
      // WALLET
      // =========================

      address: {
        type: String,
        default: null,
      },


      currency: {
        type: String,
        uppercase: true,
        default: "USDT",
      },


      network: {
        type: String,
        default: null,
      },


      // =========================
      // AMOUNTS
      // =========================

      priceAmount: {
        type: Number,
        required: true,
      },


      cryptoAmount: {
        type: Number,
        default: null,
      },


      cryptoReceived: {
        type: Number,
        default: null,
      },


      exchangeRate: {
        type: Number,
        default: null,
      },


      fee: {
        type: Number,
        default: 0,
      },


      netAmount: {
        type: Number,
        default: 0,
      },


      // =========================
      // BLOCKCHAIN
      // =========================

      transactionHash: {
        type: String,
        default: null,
      },


      confirmations: {
        type: Number,
        default: 0,
      },


      // =========================
      // STATUS
      // =========================

      status: {

        type: String,

        enum: [
          "waiting",
          "confirming",
          "confirmed",
          "finished",
          "failed",
          "expired",
        ],

        default: "waiting",

      },


      credited: {

        type: Boolean,

        default: false,

      },


      creditedAt: {

        type: Date,

        default: null,

      },


    },

    {
      timestamps:true,
    }

  );



module.exports =
mongoose.model(
  "CryptoPayment",
  cryptoPaymentSchema
);