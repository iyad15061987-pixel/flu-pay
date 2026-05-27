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

// =========================
// ENABLE 2FA
// =========================

router.post(
  "/2fa/enable",

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

      user.twoFactorEnabled =
        true;

      await user.save();

      return res.json({
        message:
          "Two-factor authentication enabled",
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
// DISABLE 2FA
// =========================

router.post(
  "/2fa/disable",

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

      user.twoFactorEnabled =
        false;

      await user.save();

      return res.json({
        message:
          "Two-factor authentication disabled",
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