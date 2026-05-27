const mongoose =
  require("mongoose");

const apiKeySchema =
  new mongoose.Schema(
    {
      userId: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref: "User",
      },

      email:
        String,

      name:
        String,

      apiKey: {
        type: String,

        unique: true,
      },

      permissions: [
        String,
      ],

      active: {
        type: Boolean,

        default: true,
      },

      lastUsed:
        Date,
    },

    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "ApiKey",
    apiKeySchema
  );