const mongoose =
  require("mongoose");

const riskProfileSchema =
  new mongoose.Schema(
    {
      email: String,

      totalTransfers:
        {
          type: Number,

          default: 0,
        },

      totalVolume:
        {
          type: Number,

          default: 0,
        },

      riskScore:
        {
          type: Number,

          default: 0,
        },

      riskLevel:
        {
          type: String,

          default:
            "Low",
        },

      lastIp:
        String,

      lastCountry:
        String,
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "RiskProfile",
    riskProfileSchema
  );