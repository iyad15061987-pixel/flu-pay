const mongoose =
  require("mongoose");

const userSchema =
  new mongoose.Schema(
    {
      // =========================
      // BASIC USER INFORMATION
      // =========================

      email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
      },

      password: {
        type: String,
      },

      customerId: {
        type: String,
        unique: true,
        sparse: true,
        default: null,
      },

      // =========================
      // WALLET
      // =========================

      balance: {
        type: Number,
        default: 0,
      },

      revenue: {
        type: Number,
        default: 0,
      },

      treasuryBalance: {
        type: Number,
        default: 0,
      },

      // =========================
      // ACCOUNT / ROLE
      // =========================

      role: {
        type: String,
        default: "user",
      },

      accountType: {
        type: String,

        enum: [
          "user",
          "business",
          "admin",
          "treasury",
          "system",
        ],

        default: "user",
      },

      accountStatus: {
        type: String,

        enum: [
          "active",
          "pending",
          "suspended",
          "closed",
        ],

        default: "active",
      },

      active: {
        type: Boolean,
        default: true,
      },

      frozen: {
        type: Boolean,
        default: false,
      },

      // =========================
      // CURRENCY
      // =========================

      currency: {
        type: String,
        default: "USD",
      },

      // =========================
      // VERIFICATION
      // =========================

      verified: {
        type: Boolean,
        default: false,
      },

      emailOtp: {
        type: String,
      },

      emailOtpExpires: {
        type: Date,
      },

      // =========================
      // RISK / AML
      // =========================

      riskScore: {
        type: Number,
        default: 0,
      },

      riskLevel: {
        type: String,
        default: "low",
      },

      amlFlagged: {
        type: Boolean,
        default: false,
      },

      // =========================
      // LIMITS
      // =========================

      dailyLimit: {
        type: Number,
        default: 1000,
      },

      monthlyLimit: {
        type: Number,
        default: 10000,
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
        default: false,
      },

      twoFactorSecret: {
        type: String,
        default: null,
      },

      twoFactorTempSecret: {
        type: String,
        default: null,
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
        default: null,
      },

      lastLoginIp: {
        type: String,
        default: null,
      },

      failedLoginAttempts: {
        type: Number,
        default: 0,
      },

      lockUntil: {
        type: Date,
        default: null,
      },

      // =========================
      // DEVICE / SESSION
      // =========================

      deviceFingerprint: {
        type: String,
        default: null,
      },

      fcmToken: {
        type: String,
      },

      // =========================
      // KYC / COMPLIANCE
      // =========================

      kycStatus: {
        type: String,
        default: "pending",
      },

      // =========================
      // WALLET SECURITY
      // =========================

      withdrawalLocked: {
        type: Boolean,
        default: false,
      },

      transferLocked: {
        type: Boolean,
        default: false,
      },

      // =========================
      // TREASURY / FINANCIAL STATS
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
    },

    {
      timestamps: true,
    }
  );


// =========================
// MODEL
// =========================

module.exports =
  mongoose.model(
    "User",
    userSchema
  );