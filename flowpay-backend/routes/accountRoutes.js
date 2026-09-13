const express = require("express");

const User = require("../models/User");
const Withdrawal = require("../models/Withdrawal");
const DepositRequest = require("../models/DepositRequest");
const Transaction = require("../models/Transaction");

const { auth } = require("../middleware/auth");

const router = express.Router();

// ==================================================
// DELETE /api/account
// Secure account deletion / closure
// ==================================================

router.delete("/account", auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unable to identify the authenticated user.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User account not found.",
      });
    }

    // --------------------------------------------------
    // SYSTEM / ADMIN ACCOUNTS CANNOT USE USER DELETION
    // --------------------------------------------------

    if (
      ["admin", "treasury", "system"].includes(
        String(user.accountType || "").toLowerCase()
      ) ||
      String(user.role || "").toLowerCase() === "admin"
    ) {
      return res.status(403).json({
        message: "This account cannot be deleted through the user account deletion process.",
      });
    }

    // --------------------------------------------------
    // FINANCIAL BALANCE CHECK
    // --------------------------------------------------

    const balance = Number(user.balance || 0);
    const reservedBalance = Number(user.reservedBalance || 0);

    if (balance > 0 || reservedBalance > 0) {
      return res.status(409).json({
        message:
          "Your account cannot be deleted while it has an available or reserved balance. Please withdraw or resolve the remaining funds first.",
        balance,
        reservedBalance,
      });
    }

    // --------------------------------------------------
    // PENDING WITHDRAWALS
    // --------------------------------------------------

    const activeWithdrawalStatuses = [
      "pending",
      "awaiting_2fa",
      "processing",
      "approved",
    ];

    const pendingWithdrawal = await Withdrawal.findOne({
      userId,
      status: { $in: activeWithdrawalStatuses },
    }).select("_id status amount");

    if (pendingWithdrawal) {
      return res.status(409).json({
        message:
          "Your account cannot be deleted while a withdrawal is still being processed.",
        withdrawalStatus: pendingWithdrawal.status,
      });
    }

    // --------------------------------------------------
    // PENDING DEPOSIT REQUESTS
    // --------------------------------------------------

    const pendingDeposit = await DepositRequest.findOne({
      userId,
      status: "Pending",
    }).select("_id status amount");

    if (pendingDeposit) {
      return res.status(409).json({
        message:
          "Your account cannot be deleted while a deposit request is pending.",
        depositStatus: pendingDeposit.status,
      });
    }

    // --------------------------------------------------
    // PENDING TRANSACTIONS
    // --------------------------------------------------

    const pendingTransaction = await Transaction.findOne({
      $or: [
        { fromEmail: user.email },
        { toEmail: user.email },
      ],
      status: { $in: ["pending", "approved"] },
    }).select("_id status amount type");

    if (pendingTransaction) {
      return res.status(409).json({
        message:
          "Your account cannot be deleted while a financial transaction is still pending.",
        transactionStatus: pendingTransaction.status,
      });
    }

    // --------------------------------------------------
    // SOFT-CLOSE ACCOUNT
    //
    // Financial, audit, AML and KYC records are NOT
    // blindly deleted. The user account is disabled and
    // personally identifiable authentication data is
    // removed where appropriate.
    // --------------------------------------------------

    user.email = `deleted-${user._id}@deleted.flowpay`;
    user.password = undefined;

    user.customerId = undefined;

    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;

    user.deviceFingerprint = null;
    user.fcmToken = undefined;

    user.lastLoginAt = null;
    user.lastLoginIp = null;

    user.failedLoginAttempts = 0;
    user.lockUntil = null;

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorTempSecret = null;
    user.twoFactorBackupCodes = [];

    user.active = false;
    user.frozen = true;
    user.accountStatus = "closed";

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Your FlowPay account has been closed. Certain financial, KYC, AML, security, and audit records may be retained where required by law or legitimate compliance obligations.",
    });
  } catch (error) {
    console.error("ACCOUNT DELETION ERROR:", error);

    return res.status(500).json({
      message: "Unable to process account deletion.",
    });
  }
});

module.exports = router;
