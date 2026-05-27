const mongoose =
  require("mongoose");

const withdrawalSchema =
  new mongoose.Schema(
    {
      // =========================
      // USER
      // =========================

      userId: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref: "User",
      },

      email:
        String,

      // =========================
      // AMOUNTS
      // =========================

      amount: {
        type: Number,

        required:
          true,
      },

      fee: {
        type: Number,

        default: 0,
      },

      netAmount: {
        type: Number,

        default: 0,
      },

      currency: {
        type: String,

        default:
          "USD",
      },

      // =========================
      // WITHDRAW METHOD
      // =========================

      method: {
        type: String,

        enum: [
          "paypal",
          "bank",
          "crypto",
        ],

        default:
          "paypal",
      },

      destination: {
        type: String,

        required:
          true,
      },

      // =========================
      // STATUS
      // =========================

      status: {
        type: String,

        enum: [
          "pending",
          "processing",
          "approved",
          "rejected",
          "completed",
          "cancelled",
        ],

        default:
          "pending",
      },

      // =========================
      // SECURITY
      // =========================

      riskLevel: {
        type: String,

        default:
          "low",
      },

      amlFlagged: {
        type: Boolean,

        default:
          false,
      },

      fraudFlagged: {
        type: Boolean,

        default:
          false,
      },

      requiresManualReview: {
        type: Boolean,

        default:
          false,
      },

      // =========================
      // PROCESSING
      // =========================

      processedBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref: "User",

        default:
          null,
      },

      processedAt:
        Date,

      rejectionReason: {
        type: String,

        default:
          null,
      },

      adminNotes: {
        type: String,

        default:
          null,
      },

      // =========================
      // TREASURY
      // =========================

      treasuryReference: {
        type: String,

        default:
          null,
      },

      externalTransactionId: {
        type: String,

        default:
          null,
      },

      // =========================
      // REALTIME TRACKING
      // =========================

      ipAddress: {
        type: String,

        default:
          null,
      },

      deviceFingerprint: {
        type: String,

        default:
          null,
      },

      // =========================
      // WEBHOOKS
      // =========================

      webhookDelivered: {
        type: Boolean,

        default:
          false,
      },

      // =========================
      // AUDIT
      // =========================

      auditTrail: [
        {
          action:
            String,

          performedBy:
            String,

          timestamp: {
            type: Date,

            default:
              Date.now,
          },
        },
      ],
    },

    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Withdrawal",
    withdrawalSchema
  );