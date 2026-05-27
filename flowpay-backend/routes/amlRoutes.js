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

const AmlAlert =
  require(
    "../models/AmlAlert"
  );

// =========================
// AML DASHBOARD
// =========================

router.get(
  "/admin/aml-alerts",

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

      const alerts =
        await AmlAlert.find()
          .sort({
            createdAt: -1,
          })
          .limit(100);

      const highRiskUsers =
        await User.find({
          riskLevel:
            "high",
        }).select(
          "-password"
        );

      const frozenUsers =
        await User.find({
          frozen: true,
        }).select(
          "-password"
        );

      res.json({
        alerts,

        highRiskUsers,

        frozenUsers,
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