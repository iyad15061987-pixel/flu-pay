const mongoose =
  require("mongoose");

const withdrawalSchema =
  new mongoose.Schema(
    {
      // ==================================================
      // USER
      // ==================================================

      userId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,
      },

      email: {
        type: String,

        required: true,

      },


      // ==================================================
      // FLOWPAY USD AMOUNT
      // ==================================================

      amount: {
        type: Number,

        required: true,

        min: 0,
      },

      fee: {
        type: Number,

        default: 0,

        min: 0,
      },

      netAmount: {
        type: Number,

        default: 0,

        min: 0,
      },

      currency: {
        type: String,

        default: "USD",

        uppercase: true,
      },


      // ==================================================
      // CRYPTO PAYOUT
      //
      // FlowPay amount remains USD.
      // payoutAmount is the actual crypto amount.
      // ==================================================

      payoutCurrency: {
        type: String,

        default: null,

        uppercase: true,
      },

      payoutAmount: {
        type: Number,

        default: null,

        min: 0,
      },

      exchangeRate: {
        type: Number,

        default: null,

        min: 0,
      },


      // ==================================================
      // WITHDRAW METHOD
      // ==================================================

      method: {
        type: String,

        enum: [
          "paypal",
          "bank",
          "crypto",
        ],

        default: "paypal",
      },

      destination: {
        type: String,

        required: true,

        trim: true,
      },


      // ==================================================
      // STATUS
      // ==================================================

      status: {
        type: String,

        enum: [
          "pending",
          "awaiting_2fa",
          "processing",
          "approved",
          "rejected",
          "completed",
          "cancelled",
        ],

        default: "pending",
      },


      // ==================================================
      // NOWPAYMENTS
      // ==================================================

      nowPaymentsBatchId: {
        type: String,

        default: null,
      },

      nowPaymentsWithdrawalId: {
        type: String,

        default: null,
      },

      nowPaymentsStatus: {
        type: String,

        default: null,
      },

// ==================================================
// NOWPAYMENTS PAYOUT SECURITY
// ==================================================

payoutAttempted: {
  type: Boolean,

  default: false,
},


payoutAttemptCount: {
  type: Number,

  default: 0,

  min: 0,
},


lastPayoutAttemptAt: {
  type: Date,

  default: null,
},


payoutError: {
  type: String,

  default: null,
},

      // ==================================================
      // SECURITY / RISK
      // ==================================================

      riskLevel: {
        type: String,

        default: "low",
      },

      amlFlagged: {
        type: Boolean,

        default: false,
      },

      fraudFlagged: {
        type: Boolean,

        default: false,
      },

      requiresManualReview: {
        type: Boolean,

        default: false,
      },


      // ==================================================
      // PROCESSING
      // ==================================================

      processedBy: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        default: null,
      },

      processedAt: {
        type: Date,

        default: null,
      },

      rejectionReason: {
        type: String,

        default: null,
      },

      adminNotes: {
        type: String,

        default: null,
      },


      // ==================================================
      // TREASURY
      // ==================================================

      treasuryReference: {
        type: String,

        default: null,
      },

      externalTransactionId: {
        type: String,

        default: null,
      },


      // ==================================================
      // REALTIME TRACKING
      // ==================================================

      ipAddress: {
        type: String,

        default: null,
      },

      deviceFingerprint: {
        type: String,

        default: null,
      },


      // ==================================================
      // WEBHOOKS
      // ==================================================

      webhookDelivered: {
        type: Boolean,

        default: false,
      },


      // ==================================================
      // REFUND PROTECTION
      // ==================================================

      fundsRefunded: {
        type: Boolean,

        default: false,
      },

      refundedAt: {
        type: Date,

        default: null,
      },


      // ==================================================
      // AUDIT
      // ==================================================

      auditTrail: [
        {
          action: {
            type: String,
          },

          performedBy: {
            type: String,
          },

          timestamp: {
            type: Date,

            default: Date.now,
          },
        },
      ],
    },

    {
      timestamps: true,
    }
  );


// ======================================================
// INDEXES
// ======================================================

withdrawalSchema.index({
  userId: 1,
  createdAt: -1,
});

withdrawalSchema.index({
  method: 1,
  status: 1,
});

withdrawalSchema.index({
  nowPaymentsWithdrawalId: 1,
});


// ======================================================
// MODEL
// ======================================================

module.exports =
  mongoose.model(
    "Withdrawal",
    withdrawalSchema
  );