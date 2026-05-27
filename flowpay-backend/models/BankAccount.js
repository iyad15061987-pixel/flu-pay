const mongoose =
  require("mongoose");

const bankAccountSchema =
  new mongoose.Schema(
    {
      userId: String,

      email: String,

      bankName:
        String,

      accountHolder:
        String,

      iban: String,

      swift: String,

      country:
        String,

      currency:
        String,

      verified: {
        type: Boolean,

        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "BankAccount",
    bankAccountSchema
  );