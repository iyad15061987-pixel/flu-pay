const express =
  require("express");

const router =
  express.Router();

const adminAuth =
  require(
    "../middleware/adminAuth"
  );

const Kyc =
  require(
    "../models/Kyc"
  );

const User =
  require(
    "../models/User"
  );

const Notification =
  require(
    "../models/Notification"
  );

// =========================
// GET ALL KYC
// =========================

router.get(
  "/admin/kyc",
  adminauth,

  adminOnly,

  async (req, res) => {
    try {
      const kyc =
        await Kyc.find().sort({
          createdAt: -1,
        });

      res.json(kyc);

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
  "/approve-kyc",
  adminauth,

  adminOnly,

  async (req, res) => {
    try {
      const {
        kycId,
      } = req.body;

      const kyc =
        await Kyc.findById(
          kycId
        );

      if (!kyc) {
        return res.status(404).json({
          message:
            "KYC not found",
        });
      }

      kyc.status =
        "Approved";

      kyc.reviewedBy =
        req.user.email;

      await kyc.save();

      await User.findByIdAndUpdate(
        kyc.userId,
        {
          verified: true,
        }
      );

      await Notification.create({
        email:
          kyc.email,

        title:
          "KYC Approved",

        message:
          "Your account has been verified successfully.",
      });

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
  "/reject-kyc",
  adminauth,

  adminOnly,

  async (req, res) => {
    try {
      const {
        kycId,
        note,
      } = req.body;

      const kyc =
        await Kyc.findById(
          kycId
        );

      if (!kyc) {
        return res.status(404).json({
          message:
            "KYC not found",
        });
      }

      kyc.status =
        "Rejected";

      kyc.reviewedBy =
        req.user.email;

      kyc.reviewNote =
        note;

      await kyc.save();

      await Notification.create({
        email:
          kyc.email,

        title:
          "KYC Rejected",

        message: `Verification rejected: ${note}`,
      });

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