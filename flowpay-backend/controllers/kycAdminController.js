const Kyc = require("../models/Kyc");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");

// =========================
// GET ALL KYC REQUESTS
// =========================

exports.getKycRequests =
  async (req, res) => {

    try {

      const requests =
        await Kyc.find()
          .sort({
            createdAt: -1,
          });

      res.json(
        requests
      );

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Server error",
      });

    }

  };

// =========================
// APPROVE KYC
// =========================

exports.approveKyc =
  async (req, res) => {

    try {

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

      kyc.reviewedBy =
        req.user.email;

      kyc.reviewedAt =
        new Date();

      await kyc.save();

      await User.findByIdAndUpdate(
        kyc.userId,
        {
          kycStatus:
            "approved",
          verified:
            true,
        }
      );

      await createNotification({
        email:
          kyc.email,

        title:
          "KYC Approved",

        message:
          "Your identity verification has been approved.",
      });

      res.json({
        success: true,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Server error",
      });

    }

  };

// =========================
// REJECT KYC
// =========================

exports.rejectKyc =
  async (req, res) => {

    try {

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

      kyc.reviewedBy =
        req.user.email;

      kyc.reviewedAt =
        new Date();

      await kyc.save();

      await User.findByIdAndUpdate(
        kyc.userId,
        {
          kycStatus:
            "rejected",
        }
      );

      await createNotification({
        email:
          kyc.email,

        title:
          "KYC Rejected",

        message:
          `KYC rejected. Reason: ${reason}`,
      });

      res.json({
        success: true,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Server error",
      });

    }

  };