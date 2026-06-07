const allowRoles =
  require(
    "../middleware/roles"
  );

const express =
  require("express");

const router =
  express.Router();

const adminAuth =
  require(
    "../middleware/adminAuth"
  );

const User =
  require(
    "../models/User"
  );

const FraudLog =
  require(
    "../models/FraudLog"
  );

const Kyc =
  require(
    "../models/Kyc"
  );

// =========================
// COMPLIANCE DASHBOARD
// =========================

router.get(
  "/admin/compliance",

  adminAuth,

  allowRoles(
  "SuperAdmin",
  "Compliance"
),

  async (req, res) => {
    try {
      const users =
        await User.find();

      const fraudLogs =
        await FraudLog.find().sort({
          createdAt: -1,
        });

      const kyc =
        await Kyc.find();

      const frozenUsers =
        users.filter(
          (u) => u.frozen
        );

      const unverifiedUsers =
        users.filter(
          (u) =>
            !u.verified
        );

      const totalBalance =
        users.reduce(
          (
            sum,
            user
          ) =>
            sum +
            user.balance,

          0
        );

      const highRiskLogs =
        fraudLogs.filter(
          (log) =>
            log.riskScore >=
            70
        );

      res.json({
        totalUsers:
          users.length,

        frozenUsers:
          frozenUsers.length,

        unverifiedUsers:
          unverifiedUsers.length,

        totalBalance,

        totalFraudLogs:
          fraudLogs.length,

        highRiskLogs:
          highRiskLogs.length,

        recentFraud:
          fraudLogs.slice(
            0,
            10
          ),

        recentKyc:
          kyc.slice(
            0,
            10
          ),
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