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

const Otp =
  require(
    "../models/Otp"
  );

const sendMail =
  require(
    "../utils/sendMail"
  );

router.post(
  "/forgot-password",
  async (req, res) => {
    try {
      const {
        email,
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

      const otp =
        Math.floor(
          100000 +
            Math.random() *
              900000
        ).toString();

      await Otp.create({
        email,

        otp,

        expiresAt:
          new Date(
            Date.now() +
              10 *
                60 *
                1000
          ),
      });

      await sendMail(
        email,
        "FlowPay OTP Code",
        `Your OTP code is ${otp}`
      );

      res.json({
        message:
          "OTP sent",
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