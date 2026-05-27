const express =
  require("express");

const router =
  express.Router();

const {
  auth,
} = require(
  "../middleware/auth"
);

const User =
  require(
    "../models/User"
  );

// =========================
// TOGGLE 2FA
// =========================

router.post(
  "/2fa/toggle",

  auth,

  adminOnly,

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
        !user.twoFactorEnabled;

      await user.save();

      res.json({
        enabled:
          user.twoFactorEnabled,
      });

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "2FA update failed",
      });
    }
  }
);

module.exports =
  router;