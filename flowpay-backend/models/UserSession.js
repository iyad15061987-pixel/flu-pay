const mongoose =
  require("mongoose");

const userSessionSchema =
  new mongoose.Schema(
    {
      userId: {
        type:
          mongoose.Schema
            .Types.ObjectId,

        ref: "User",
      },

      email:
        String,

      ip:
        String,

      userAgent:
        String,

      deviceFingerprint:
        String,

      active: {
        type: Boolean,

        default:
          true,
      },

      lastSeen: {
        type: Date,

        default:
          Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "UserSession",
    userSessionSchema
  );