const express =
  require("express");

const router =
  express.Router();

const {
  auth,
} = require(
  "../middleware/auth"
);

const Kyc =
  require(
    "../models/Kyc"
  );

const User =
  require(
    "../models/User"
  );

// =========================
// GET ALL KYC REQUESTS
// =========================

router.get(
  "/admin/kyc-requests",

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

      const requests =
        await Kyc.find().sort({
          createdAt: -1,
        });

      res.json(requests);

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

// =========================
// APPROVE KYC
// =========================

router.post(
  "/admin/approve-kyc/:id",

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

      const kyc =
        await Kyc.findById(
          req.params.id
        );

      if (!kyc) {
        return res.status(404).json({
          message:
            "KYC not found",
        });
      }

      kyc.status =
        "approved";

      await kyc.save();

      await User.findByIdAndUpdate(
        kyc.userId,
        {
          verified:
            true,
        }
      );

      res.json({
        message:
          "KYC approved",
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

// =========================
// REJECT KYC
// =========================

router.post(
  "/admin/reject-kyc/:id",

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

      const {
        reason,
      } = req.body;

      const kyc =
        await Kyc.findById(
          req.params.id
        );

      if (!kyc) {
        return res.status(404).json({
          message:
            "KYC not found",
        });
      }

      kyc.status =
        "rejected";

      kyc.rejectionReason =
        reason;

      await kyc.save();

      res.json({
        message:
          "KYC rejected",
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