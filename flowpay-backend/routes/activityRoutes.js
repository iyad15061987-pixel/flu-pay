const express =
  require("express");

const router =
  express.Router();

const adminAuth =
  require(
    "../middleware/adminAuth"
  );

const ActivityLog =
  require(
    "../models/ActivityLog"
  );

router.get(
  "/admin/activity-logs",

  adminauth,

  adminOnly,

  async (req, res) => {
    try {
      const logs =
        await ActivityLog.find().sort({
          createdAt: -1,
        });

      res.json(
        logs
      );

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