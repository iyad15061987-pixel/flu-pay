const express =
  require("express");

const AccountDeletionRequest =
  require("../models/AccountDeletionRequest");

const User =
  require("../models/User");

const Withdrawal =
  require("../models/Withdrawal");

const DepositRequest =
  require("../models/DepositRequest");

const router =
  express.Router();

// ==================================================
// PUBLIC ACCOUNT DELETION REQUEST
// POST /api/account-deletion-request
// ==================================================

router.post(
  "/account-deletion-request",
  async (req, res) => {

    try {

      const email =
        String(
          req.body?.email || ""
        )
          .trim()
          .toLowerCase();

      if (!email) {
        return res.status(400).json({
          message:
            "Please provide the email address associated with your FlowPay account.",
        });
      }

      const user =
        await User.findOne({
          email,
        });

      // Do not reveal whether an email exists.
      if (!user) {
        return res.status(200).json({
          success: true,
          message:
            "If an account is associated with this email, the deletion request will be reviewed.",
        });
      }

      // --------------------------------------------------
      // PREVENT DUPLICATE ACTIVE REQUESTS
      // --------------------------------------------------

      const existingRequest =
        await AccountDeletionRequest.findOne({
          email,
          status: {
            $in: [
              "pending",
              "reviewing",
            ],
          },
        });

      if (existingRequest) {
        return res.status(200).json({
          success: true,
          message:
            "A deletion request for this account is already under review.",
        });
      }

      // --------------------------------------------------
      // FINANCIAL BALANCE CHECK
      // --------------------------------------------------

      const balance =
        Number(
          user.balance || 0
        );

      const reservedBalance =
        Number(
          user.reservedBalance || 0
        );

      if (
        balance > 0 ||
        reservedBalance > 0
      ) {
        return res.status(409).json({
          message:
            "The account cannot be closed while it has an available or reserved balance. Please resolve the remaining funds first.",
        });
      }

      // --------------------------------------------------
      // PENDING WITHDRAWAL CHECK
      // --------------------------------------------------

      const pendingWithdrawal =
        await Withdrawal.findOne({
          userId: user._id,
          status: {
            $in: [
              "pending",
              "awaiting_2fa",
              "processing",
              "approved",
            ],
          },
        }).select(
          "_id status"
        );

      if (pendingWithdrawal) {
        return res.status(409).json({
          message:
            "The account cannot be closed while a withdrawal is still being processed.",
        });
      }

      // --------------------------------------------------
      // PENDING DEPOSIT CHECK
      // --------------------------------------------------

      const pendingDeposit =
        await DepositRequest.findOne({
          userId: user._id,
          status: "Pending",
        }).select(
          "_id status"
        );

      if (pendingDeposit) {
        return res.status(409).json({
          message:
            "The account cannot be closed while a deposit request is pending.",
        });
      }

      // --------------------------------------------------
      // CREATE DELETION REQUEST
      // --------------------------------------------------

      const request =
        await AccountDeletionRequest.create({
          email,
          status: "pending",
          ipAddress:
            req.ip || null,
          userAgent:
            req.get("user-agent") ||
            null,
        });

      return res.status(201).json({
        success: true,
        requestId:
          request._id,
        message:
          "Your account deletion request has been submitted for review.",
      });

    } catch (error) {

      console.error(
        "ACCOUNT DELETION REQUEST ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to process the account deletion request.",
      });

    }

  }
);

module.exports =
  router;