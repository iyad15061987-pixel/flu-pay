const mongoose =
  require("mongoose");

const userSchema =
  new mongoose.Schema(
    {
      email: {
        type: String,

        unique: true,
      },

      password:
        String,

      balance: {
        type: Number,

        default: 0,
      },

      revenue: {
        type: Number,

        default: 0,
      },

      role: {
        type: String,

        default:
          "user",
      },

      frozen: {
        type: Boolean,

        default:
          false,
      },

      currency: {
        type: String,

        default:
          "USD",
      },

      fcmToken:
        String,

      verified: {
        type: Boolean,

        default:
          false,
      },

      emailOtp:
        String,

      emailOtpExpires:
        Date,

      riskScore: {
        type: Number,

        default: 0,
      },

      riskLevel: {
        type: String,

        default:
          "low",
      },

      dailyLimit: {
        type: Number,

        default:
          1000,
      },

      monthlyLimit: {
        type: Number,

        default:
          10000,
      },

      dailyUsed: {
        type: Number,

        default: 0,
      },

      monthlyUsed: {
        type: Number,

        default: 0,
      },

      // =========================
      // 2FA
      // =========================

      twoFactorEnabled: {
        type: Boolean,

        default:
          false,
      },

      twoFactorSecret: {
        type: String,

        default:
          null,
      },

      twoFactorTempSecret: {
        type: String,

        default:
          null,
      },

      twoFactorBackupCodes: [
        {
          type: String,
        },
      ],

      // =========================
      // SECURITY
      // =========================

      lastLoginAt: {
        type: Date,

        default:
          null,
      },

      lastLoginIp: {
        type: String,

        default:
          null,
      },

      failedLoginAttempts: {
        type: Number,

        default: 0,
      },

      lockUntil: {
        type: Date,

        default:
          null,
      },

      // =========================
      // DEVICE / SESSION
      // =========================

      deviceFingerprint: {
        type: String,

        default:
          null,
      },

      // =========================
      // COMPLIANCE
      // =========================

      kycStatus: {
        type: String,

        default:
          "pending",
      },

      amlFlagged: {
        type: Boolean,

        default:
          false,
      },

      // =========================
      // WALLET SECURITY
      // =========================

      withdrawalLocked: {
        type: Boolean,

        default:
          false,
      },

      transferLocked: {
        type: Boolean,

        default:
          false,
      },

      // =========================
      // TREASURY
      // =========================

      totalDeposits: {
        type: Number,

        default: 0,
      },

      totalWithdrawals: {
        type: Number,

        default: 0,
      },

      totalTransfersSent: {
        type: Number,

        default: 0,
      },

      totalTransfersReceived: {
        type: Number,

        default: 0,
      },

      // =========================
      // STATUS
      // =========================

      active: {
        type: Boolean,

        default:
          true,
      },
    },

    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "User",
    userSchema
  );