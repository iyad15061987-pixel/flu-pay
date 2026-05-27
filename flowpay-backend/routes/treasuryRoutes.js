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

const User =
  require(
    "../models/User"
  );

// =========================
// TREASURY OVERVIEW
// =========================

router.get(
  "/treasury/overview",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      const users =
        await User.find();

      let totalBalances = 0;

      let totalRevenue = 0;

      users.forEach(
        (user) => {
          totalBalances +=
            user.balance || 0;

          totalRevenue +=
            user.revenue || 0;
        }
      );

      return res.json({
        totalUsers:
          users.length,

        totalBalances,

        totalRevenue,
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
// TREASURY HEALTH
// =========================

router.get(
  "/treasury/health",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      return res.json({
        status:
          "healthy",

        treasury:
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

module.exports =
  router;