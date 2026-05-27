const express =
  require("express");

const router =
  express.Router();

const {
  auth,
  adminOnly,
} = require(
  "../middleware/auth"
);

// =========================
// LIVE SYSTEM STATUS
// =========================

router.get(
  "/admin/live-status",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      return res.json({
        server:
          "online",

        database:
          "connected",

        realtime:
          "active",
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
// LIVE METRICS
// =========================

router.get(
  "/admin/live-metrics",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      return res.json({
        cpuUsage: 0,

        memoryUsage: 0,

        activeUsers: 0,
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