const express =
  require("express");

const router =
  express.Router();

const {
  auth,
  adminOnly,
} = require(
  "../middleware/auth"
);

const User =
  require(
    "../models/User"
  );

const {
  setup2FA,
  verify2FASetup,
  verify2FALogin,
  disable2FA,
  getBackupCodes,
  regenerateBackupCodes,
} = require(
  "../controllers/authController"
);

// =========================
// SETUP 2FA
// =========================

router.post(
  "/2fa/setup",

  auth,

  setup2FA
);

// =========================
// VERIFY & ENABLE 2FA
// =========================

router.post(
  "/2fa/verify-setup",

  auth,

  verify2FASetup
);

// =========================
// VERIFY LOGIN 2FA
// =========================

router.post(
  "/2fa/verify-login",

  verify2FALogin
);

// =========================
// DISABLE 2FA
// =========================

router.post(
  "/2fa/disable",

  auth,

  disable2FA
);

// =========================
// GET BACKUP CODES
// =========================

router.get(
  "/2fa/backup-codes",

  auth,

  getBackupCodes
);

// =========================
// REGENERATE BACKUP CODES
// =========================

router.post(
  "/2fa/regenerate-backup-codes",

  auth,

  regenerateBackupCodes
);

// =========================
// GET MY 2FA STATUS
// =========================

router.get(
  "/2fa/status",

  auth,

  async (req, res) => {
    try {

      const user =
        await User.findById(
          req.user.id
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      return res.json({
        enabled:
          user.twoFactorEnabled,
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

// =========================
// ADMIN 2FA STATUS
// =========================

router.get(
  "/admin/2fa-status",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      const users =
        await User.find(
          {},
          {
            email: 1,
            role: 1,
            twoFactorEnabled: 1,
          }
        );

      return res.json(
        users
      );

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

module.exports =
  router;