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

router.post(
  "/save-fcm-token",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const {
        token,
      } = req.body;

      await User.findByIdAndUpdate(
        req.user.id,
        {
          fcmToken:
            token,
        }
      );

      res.json({
        message:
          "FCM token saved",
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