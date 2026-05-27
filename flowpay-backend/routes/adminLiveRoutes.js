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

const AuditLog =
  require(
    "../models/AuditLog"
  );

// =========================
// LIVE ACTIVITY FEED
// =========================

router.get(
  "/admin/live-activity",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const admin =
        await User.findById(
          req.user.id
        );

      if (
        !admin ||
        admin.role !==
          "admin"
      ) {
        return res.status(403).json({
          message:
            "Access denied",
        });
      }

      const logs =
        await AuditLog.find()
          .sort({
            createdAt: -1,
          })
          .limit(100);

      res.json(logs);

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