const express =
  require("express");

const router =
  express.Router();

const bcrypt =
  require("bcryptjs");

const User =
  require(
    "../models/User"
  );

const sendMail =
  require(
    "../utils/sendMail"
  );

const generateOtp =
  require(
    "../utils/generateOtp"
  );

// =========================
// FORGOT PASSWORD
// =========================

router.post(
  "/forgot-password",

  async (req, res) => {
    try {
      const { email } =
        req.body;

      // =========================
      // VALIDATION
      // =========================

      if (!email) {
        return res.status(400).json({
          message:
            "Email is required",
        });
      }

      // =========================
      // FIND USER
      // =========================

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

      // =========================
      // GENERATE OTP
      // =========================

      const otp =
        generateOtp();

      user.emailOtp =
        otp;

      user.emailOtpExpires =
        new Date(
          Date.now() +
            10 *
              60 *
              1000
        );

      await user.save();

      // =========================
      // SEND EMAIL
      // =========================

      try {
        await sendMail({
          to: email,

          subject:
            "FlowPay Password Reset",

          text:
            `Your password reset code is: ${otp}`,
        });

      } catch (mailErr) {
        console.log(
          "Mail error:",
          mailErr.message
        );
      }

      // =========================
      // RESPONSE
      // =========================

      return res.json({
        message:
          "Password reset code sent",
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
// RESET PASSWORD
// =========================

router.post(
  "/reset-password",

  async (req, res) => {
    try {
      const {
        email,
        otp,
        newPassword,
      } = req.body;

      // =========================
      // VALIDATION
      // =========================

      if (
        !email ||
        !otp ||
        !newPassword
      ) {
        return res.status(400).json({
          message:
            "Missing required fields",
        });
      }

      // =========================
      // FIND USER
      // =========================

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

      // =========================
      // OTP CHECK
      // =========================

      if (
        user.emailOtp !==
        otp
      ) {
        return res.status(400).json({
          message:
            "Invalid OTP",
        });
      }

      // =========================
      // OTP EXPIRATION
      // =========================

      if (
        !user.emailOtpExpires ||
        new Date() >
          user.emailOtpExpires
      ) {
        return res.status(400).json({
          message:
            "OTP expired",
        });
      }

      // =========================
      // HASH PASSWORD
      // =========================

      const hashed =
        await bcrypt.hash(
          newPassword,
          10
        );

      // =========================
      // UPDATE USER
      // =========================

      user.password =
        hashed;

      user.emailOtp =
        null;

      user.emailOtpExpires =
        null;

      await user.save();

      // =========================
      // RESPONSE
      // =========================

      return res.json({
        message:
          "Password reset successfully",
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

module.exports =
  router;