const express =
  require("express");

const router =
  express.Router();

const {
  auth,
} = require(
  "../middleware/auth"
);

const Notification =
  require(
    "../models/Notification"
  );

// =========================
// LIST NOTIFICATIONS
// =========================

router.get(
  "/notifications",

  auth,

  async (req, res) => {
    try {
      const notifications =
        await Notification.find({
          userId:
            req.user.id,
        }).sort({
          createdAt: -1,
        });

      res.json(
        notifications
      );

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Notifications error",
      });
    }
  }
);

module.exports =
  router;