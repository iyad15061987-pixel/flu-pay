const mongoose =
  require("mongoose");

const amlAlertSchema =
  new mongoose.Schema(
    {
      email:
        String,

      riskLevel:
        String,

      reason:
        String,

      amount:
        Number,

      status: {
        type: String,

        default:
          "open",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "AmlAlert",
    amlAlertSchema
  );