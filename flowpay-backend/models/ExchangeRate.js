const mongoose =
  require("mongoose");

const exchangeRateSchema =
  new mongoose.Schema(
    {
      base: String,

      target:
        String,

      rate: Number,
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "ExchangeRate",
    exchangeRateSchema
  );
  