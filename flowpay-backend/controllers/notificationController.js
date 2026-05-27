const Notification =
  require("../models/Notification");

exports.getNotifications =
  async (req, res) => {
    try {
      const notifications =
        await Notification.find({
          email:
            req.params.email,
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
          "Server error",
      });
    }
  };