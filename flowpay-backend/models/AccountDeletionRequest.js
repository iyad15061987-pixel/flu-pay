const mongoose =
  require("mongoose");

const accountDeletionRequestSchema =
  new mongoose.Schema(
    {
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "reviewing",
          "approved",
          "rejected",
          "completed",
        ],
        default: "pending",
        index: true,
      },

      ipAddress: {
        type: String,
        default: null,
      },

      userAgent: {
        type: String,
        default: null,
      },

      reviewedAt: {
        type: Date,
        default: null,
      },

      completedAt: {
        type: Date,
        default: null,
      },

      notes: {
        type: String,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "AccountDeletionRequest",
    accountDeletionRequestSchema
  );