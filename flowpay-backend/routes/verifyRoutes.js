const express =
  require("express");

const router =
  express.Router();

const User =
  require(
    "../models/User"
  );

// =========================
// VERIFY EMAIL
// =========================

router.post(
  "/verify-email",

  async (req, res) => {
    try {
      const {
        email,
        otp,
      } = req.body;

      const user =
        await User.findOne({
          email,
        });

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      if (
        user.emailOtp !==
        otp
      ) {
        return res.status(400).json({
          message:
            "Invalid OTP",
        });
      }

      if (
        new Date() >
        user.emailOtpExpires
      ) {
        return res.status(400).json({
          message:
            "OTP expired",
        });
      }

      user.verified =
        true;

      user.emailOtp =
        null;

      user.emailOtpExpires =
        null;

      await user.save();

      res.json({
        message:
          "Email verified successfully",
      });

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

module.exports =
  router;