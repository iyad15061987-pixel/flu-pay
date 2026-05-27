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
  "/admin/kyc",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      const kycRequests =
        await Kyc.find()
          .sort({
            createdAt: -1,
          });

      return res.json(
        kycRequests
      );

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
// APPROVE KYC
// =========================

router.post(
  "/admin/kyc/approve",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      const { kycId } =
        req.body;

      const kyc =
        await Kyc.findById(
          kycId
        );

      if (!kyc) {
        return res.status(404).json({
          message:
            "KYC request not found",
        });
      }

      // =========================
      // UPDATE KYC
      // =========================

      kyc.status =
        "approved";

      kyc.reviewedBy =
        req.user.email;

      kyc.reviewedAt =
        new Date();

      await kyc.save();

      // =========================
      // VERIFY USER
      // =========================

      const user =
        await User.findById(
          kyc.userId
        );

      if (user) {

        user.verified =
          true;

        await user.save();
      }

      return res.json({
        message:
          "KYC approved successfully",
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
// REJECT KYC
// =========================

router.post(
  "/admin/kyc/reject",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      const {
        kycId,
        reason,
      } = req.body;

      const kyc =
        await Kyc.findById(
          kycId
        );

      if (!kyc) {
        return res.status(404).json({
          message:
            "KYC request not found",
        });
      }

      kyc.status =
        "rejected";

      kyc.rejectionReason =
        reason ||
        "Rejected by admin";

      kyc.reviewedBy =
        req.user.email;

      kyc.reviewedAt =
        new Date();

      await kyc.save();

      return res.json({
        message:
          "KYC rejected",
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