const mongoose =
  require("mongoose");

const treasurySchema =
  new mongoose.Schema(
    {
      currency:
        String,

      hotWallet:
        Number,

      coldWallet:
        Number,

      reserveWallet:
        Number,
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Treasury",
    treasurySchema
  );