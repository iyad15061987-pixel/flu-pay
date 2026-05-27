const speakeasy =
  require(
    "speakeasy"
  );

const QRCode =
  require(
    "qrcode"
  );

const generateOtp =
  require(
    "../utils/generateOtp"
  );

const sendMail =
  require(
    "../utils/sendMail"
  );

const bcrypt =
  require("bcryptjs");

const jwt =
  require("jsonwebtoken");

const User =
  require(
    "../models/User"
  );

// =========================
// REGISTER
// =========================

exports.register =
  async (req, res) => {

    try {

      const {
        email,
        password,
      } = req.body;

      // =========================
      // CHECK EXISTING USER
      // =========================

      const exists =
        await User.findOne({
          email,
        });

      if (exists) {

        return res.status(400).json({
          message:
            "Email already exists",
        });

      }

      // =========================
      // HASH PASSWORD
      // =========================

      const hashed =
        await bcrypt.hash(
          password,
          10
        );

      // =========================
      // GENERATE OTP
      // =========================

      const otp =
        generateOtp();

      const otpExpires =
        new Date(
          Date.now() +
            10 *
              60 *
              1000
        );

      // =========================
      // CREATE USER
      // =========================

      await User.create({
        email,

        password:
          hashed,

        verified:
          false,

        emailOtp:
          otp,

        emailOtpExpires:
          otpExpires,
      });

      // =========================
      // SEND EMAIL
      // =========================

      try {

        await sendMail({
          to: email,

          subject:
            "FlowPay Verification Code",

          text:
            `Your verification code is: ${otp}`,
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
          "Account created successfully",

        requiresVerification:
          true,
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server error",
      });

    }

  };

// =========================
// LOGIN
// =========================

exports.login =
  async (req, res) => {

    try {

      const {
        email,
        password,
      } = req.body;

      // =========================
      // FIND USER
      // =========================

      const user =
        await User.findOne({
          email,
        });

      if (!user) {

        return res.status(400).json({
          message:
            "Invalid credentials",
        });

      }

      // =========================
      // ACCOUNT LOCK
      // =========================

      if (
        user.lockUntil &&
        user.lockUntil >
          new Date()
      ) {

        return res.status(403).json({
          message:
            "Account temporarily locked",
        });

      }

      // =========================
      // CHECK PASSWORD
      // =========================

      const match =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!match) {

        user.failedLoginAttempts += 1;

        // LOCK ACCOUNT

        if (
          user.failedLoginAttempts >=
          5
        ) {

          user.lockUntil =
            new Date(
              Date.now() +
                15 *
                  60 *
                  1000
            );

        }

        await user.save();

        return res.status(400).json({
          message:
            "Invalid credentials",
        });

      }

      // RESET FAILED ATTEMPTS

      user.failedLoginAttempts =
        0;

      user.lockUntil =
        null;

      // =========================
      // CHECK VERIFICATION
      // =========================

      if (
        !user.verified
      ) {

        return res.status(403).json({
          message:
            "Please verify your email first",
        });

      }

      // =========================
      // 2FA REQUIRED
      // =========================

      if (
        user.twoFactorEnabled
      ) {

        return res.json({
          requiresTwoFactor:
            true,

          userId:
            user._id,
        });

      }

      // =========================
      // LOGIN TRACKING
      // =========================

      user.lastLoginAt =
        new Date();

      user.lastLoginIp =
        req.ip;

      await user.save();

      // =========================
      // CREATE JWT
      // =========================

      const token =
        jwt.sign(
          {
            id:
              user._id,

            email:
              user.email,

            role:
              user.role,
          },

          process.env
            .JWT_SECRET,

          {
            expiresIn:
              "7d",
          }
        );

      // =========================
      // RESPONSE
      // =========================

      return res.json({
        token,

        userId:
          user._id,

        role:
          user.role,

        email:
          user.email,
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server error",
      });

    }

  };

// =========================
// SETUP 2FA
// =========================

exports.setup2FA =
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

      // =========================
      // GENERATE SECRET
      // =========================

      const secret =
        speakeasy.generateSecret({
          name:
            `FlowPay (${user.email})`,
        });

      // SAVE TEMP SECRET

      user.twoFactorTempSecret =
        secret.base32;

      await user.save();

      // =========================
      // GENERATE QR
      // =========================

      const qrCode =
        await QRCode.toDataURL(
          secret.otpauth_url
        );

      // =========================
      // RESPONSE
      // =========================

      return res.json({
        qrCode,

        secret:
          secret.base32,
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server error",
      });

    }

  };

// =========================
// VERIFY 2FA SETUP
// =========================

exports.verify2FASetup =
  async (req, res) => {

    try {

      const {
        token,
      } = req.body;

      const user =
        await User.findById(
          req.user.id
        );

      if (
        !user ||
        !user.twoFactorTempSecret
      ) {

        return res.status(400).json({
          message:
            "2FA setup not initialized",
        });

      }

      // =========================
      // VERIFY TOKEN
      // =========================

      const verified =
        speakeasy.totp.verify({
          secret:
            user.twoFactorTempSecret,

          encoding:
            "base32",

          token,
        });

      if (!verified) {

        return res.status(400).json({
          message:
            "Invalid 2FA code",
        });

      }

      // =========================
      // ENABLE 2FA
      // =========================

      user.twoFactorEnabled =
        true;

      user.twoFactorSecret =
        user.twoFactorTempSecret;

      user.twoFactorTempSecret =
        null;

      await user.save();

      // =========================
      // RESPONSE
      // =========================

      return res.json({
        message:
          "2FA enabled successfully",
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server error",
      });

    }

  };

// =========================
// VERIFY LOGIN 2FA
// =========================

exports.verify2FALogin =
  async (req, res) => {

    try {

      const {
        userId,
        token,
      } = req.body;

      const user =
        await User.findById(
          userId
        );

      if (
        !user ||
        !user.twoFactorEnabled
      ) {

        return res.status(400).json({
          message:
            "2FA not enabled",
        });

      }

      // =========================
      // VERIFY TOTP
      // =========================

      const verified =
        speakeasy.totp.verify({
          secret:
            user.twoFactorSecret,

          encoding:
            "base32",

          token,
        });

      if (!verified) {

        return res.status(400).json({
          message:
            "Invalid 2FA code",
        });

      }

      // =========================
      // LOGIN TRACKING
      // =========================

      user.lastLoginAt =
        new Date();

      user.lastLoginIp =
        req.ip;

      await user.save();

      // =========================
      // JWT
      // =========================

      const jwtToken =
        jwt.sign(
          {
            id:
              user._id,

            email:
              user.email,

            role:
              user.role,
          },

          process.env
            .JWT_SECRET,

          {
            expiresIn:
              "7d",
          }
        );

      // =========================
      // RESPONSE
      // =========================

      return res.json({
        token:
          jwtToken,

        userId:
          user._id,

        role:
          user.role,

        email:
          user.email,
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server error",
      });

    }

  };

// =========================
// DISABLE 2FA
// =========================

exports.disable2FA =
  async (req, res) => {

    try {

      const {
        password,
      } = req.body;

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

      // =========================
      // VERIFY PASSWORD
      // =========================

      const match =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!match) {

        return res.status(400).json({
          message:
            "Invalid password",
        });

      }

      // =========================
      // DISABLE 2FA
      // =========================

      user.twoFactorEnabled =
        false;

      user.twoFactorSecret =
        null;

      user.twoFactorTempSecret =
        null;

      await user.save();

      // =========================
      // RESPONSE
      // =========================

      return res.json({
        message:
          "2FA disabled successfully",
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server error",
      });

    }

  };