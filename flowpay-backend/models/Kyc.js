const mongoose =
  require("mongoose");

const kycSchema =
  new mongoose.Schema(
    {
      // =========================
      // USER
      // =========================

      userId: {
        type:
          mongoose.Schema
            .Types.ObjectId,

        ref: "User",

        required: true,
      },

      email: {
        type: String,

        required: true,
      },

      // =========================
      // PERSONAL INFO
      // =========================

      fullName:
        String,

      country:
        String,

      documentType:
        String,

      // =========================
      // FILES
      // =========================

      passportUrl:
        String,

      selfieUrl:
        String,

      documentFront:
        String,

      selfie:
        String,

      // =========================
      // STATUS
      // =========================

      status: {
        type: String,

        enum: [
          "pending",
          "approved",
          "rejected",
        ],

        default:
          "pending",
      },

      rejectionReason:
        String,

      reviewedBy:
        String,

      reviewedAt:
        Date,
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Kyc",
    kycSchema
  );