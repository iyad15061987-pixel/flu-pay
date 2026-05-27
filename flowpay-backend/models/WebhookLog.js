const mongoose =
  require("mongoose");

const webhookSchema =
  new mongoose.Schema(
    {
      source:
        String,

      event:
        String,

      payload:
        Object,

      signature:
        String,

      status: {
        type: String,

        default:
          "received",
      },
    },

    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "WebhookLog",

    webhookSchema
  );