const mongoose =
  require("mongoose");

const ledgerEntrySchema =
  new mongoose.Schema(
    {
      userId: String,

      email: String,

      type: String,

      amount: Number,

      balanceBefore:
        Number,

      balanceAfter:
        Number,

      reference:
        String,

      description:
        String,
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "LedgerEntry",
    ledgerEntrySchema
  );