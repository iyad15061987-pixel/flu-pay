const mongoose =
  require("mongoose");

const fraudLogSchema =
  new mongoose.Schema(
    {
      email: String,

      reason:
        String,

      riskScore:
        Number,

      action:
        String,

      metadata:
        Object,
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "FraudLog",
    fraudLogSchema
  );