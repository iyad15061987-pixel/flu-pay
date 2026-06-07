const mongoose =
  require("mongoose");

const sessionSchema =
  new mongoose.Schema(
    {
      userId: String,

      refreshToken:
        String,

      device: String,

      ip: String,
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Session",
    sessionSchema
  );