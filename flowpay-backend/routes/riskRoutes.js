const express =
  require("express");

const router =
  express.Router();

const adminAuth =
  require(
    "../middleware/adminAuth"
  );

const allowRoles =
  require(
    "../middleware/roles"
  );

const RiskProfile =
  require(
    "../models/RiskProfile"
  );

// =========================
// GET RISK DASHBOARD
// =========================

router.get(
  "/admin/risk-dashboard",

  adminAuth,

  allowRoles(
    "SuperAdmin",
    "Compliance"
  ),

  async (req, res) => {
    try {
      const profiles =
        await RiskProfile.find().sort({
          riskScore: -1,
        });

      const highRisk =
        profiles.filter(
          (p) =>
            p.riskLevel ===
            "High"
        );

      const mediumRisk =
        profiles.filter(
          (p) =>
            p.riskLevel ===
            "Medium"
        );

      res.json({
        totalProfiles:
          profiles.length,

        highRisk:
          highRisk.length,

        mediumRisk:
          mediumRisk.length,

        profiles,
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