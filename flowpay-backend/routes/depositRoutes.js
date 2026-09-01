const express =
  require("express");

const router =
  express.Router();

const {
  auth,
  adminOnly,
} = require("../middleware/auth");

const emit =
  require("../socket/emitter");

const EVENTS =
  require("../socket/events");

const User =
  require("../models/User");

const DepositRequest =
  require("../models/DepositRequest");

const Transaction =
  require("../models/Transaction");
const createLedgerEntry =
  require("../utils/ledger");

const createNotification =
  require("../utils/createNotification");

const riskEngine =
  require("../utils/riskEngine");

const amlEngine =
  require("../utils/amlEngine");

const {
  calculateFee,
  getFeeRate,
} =
  require("../utils/fees");

// ======================================================
// CREATE DEPOSIT
// ======================================================

router.post(
  "/deposits",

  auth,

  async (req, res) => {

    try {

      const {
        amount,
        method,
        reference,
      } = req.body;


      // ==================================================
      // USER
      // ==================================================

      const user =
        await User.findById(
          req.user.id
        );

      if (!user) {

        return res.status(404).json({
          message:
            "User not found",
        });

      }


      // ==================================================
      // ACCOUNT STATUS
      // ==================================================

      if (user.frozen) {

        return res.status(403).json({
          message:
            "Account frozen",
        });

      }

      if (!user.active) {

        return res.status(403).json({
          message:
            "Account inactive",
        });

      }


      // ==================================================
      // VALIDATE AMOUNT
      // ==================================================

      const numericAmount =
        Number(amount);

      if (
        !Number.isFinite(
          numericAmount
        ) ||
        numericAmount <= 0
      ) {

        return res.status(400).json({
          message:
            "Invalid amount",
        });

      }


      // ==================================================
      // METHOD
      // ==================================================

      const normalizedMethod =
        String(
          method ||
          "manual"
        )
          .toLowerCase()
          .trim();


      // ==================================================
      // FEE TYPE
      // ==================================================

      let feeType =
        "external";

      if (
        normalizedMethod ===
        "crypto"
      ) {

        feeType =
          "crypto";

      } else if (
        normalizedMethod ===
        "paypal"
      ) {

        feeType =
          "paypal";

      } else if (
        normalizedMethod ===
        "bank" ||
        normalizedMethod ===
        "bank_transfer" ||
        normalizedMethod ===
        "bank transfer"
      ) {

        feeType =
          "bank";

      } else if (
        normalizedMethod ===
        "stripe"
      ) {

        feeType =
          "stripe";

      }


      // ==================================================
      // AML CHECK
      // ==================================================

      await amlEngine({
        user,
        amount:
          numericAmount,
      });


      // ==================================================
      // RISK ENGINE
      // ==================================================

      const risk =
        await riskEngine({
          user,
          amount:
            numericAmount,
        });


      // ==================================================
      // FEE
      // ==================================================

      const fee =
        calculateFee(
          numericAmount,
          feeType
        );


      // ==================================================
      // FEE RATE
      // ==================================================

      const feeRate =
        getFeeRate(
          feeType
        );


      // ==================================================
      // NET AMOUNT
      // ==================================================

      const netAmount =
        numericAmount -
        fee;

      if (
        !Number.isFinite(
          netAmount
        ) ||
        netAmount < 0
      ) {

        return res.status(400).json({
          message:
            "Deposit amount is too small for the applicable fee",
        });

      }


      // ==================================================
      // BANK / CRYPTO
      // CREATE PENDING REQUEST ONLY
      // ==================================================

      if (
        normalizedMethod ===
          "bank" ||
        normalizedMethod ===
          "bank_transfer" ||
        normalizedMethod ===
          "bank transfer" ||
        normalizedMethod ===
          "crypto"
      ) {

        const existingRequest =
          await DepositRequest.findOne({

            userId:
              user._id,

            amount:
              numericAmount,

            method:
              normalizedMethod,

            status:
              "Pending",

          });


        if (existingRequest) {

          return res.status(409).json({

            success:
              false,

            message:
              "A pending deposit request already exists for this amount and method.",

            requestId:
              existingRequest._id,

          });

        }


        const request =
          await DepositRequest.create({

            userId:
              user._id,

            email:
              user.email,

            amount:
              numericAmount,

            method:
              normalizedMethod,

            reference:
              reference ||
              "Wallet Funding",

            status:
              "Pending",

            type:
              "Deposit",

          });


        await createNotification({

          email:
            user.email,

          title:
            "Deposit Request Pending",

          message:
            `Your ${normalizedMethod} deposit request of $${numericAmount.toFixed(2)} has been submitted and is awaiting admin approval.`,

        });


        // ==================================================
        // PENDING DEPOSIT EVENT
        // ==================================================

        emit(
          "deposit_created",

          {
            email:
              user.email,

            amount:
              numericAmount,

            fee:
              fee,

            feeType:
              feeType,

            feeRate:
              feeRate,

            netAmount:
              netAmount,

            method:
              normalizedMethod,

            risk:
              risk.level,

            status:
              "Pending",

            requestId:
              request._id,

            timestamp:
              new Date(),

          }
        );


        if (
          risk.level ===
          "high"
        ) {

          emit(
            EVENTS.FRAUD_ALERT,

            {

              type:
                "HIGH_RISK_DEPOSIT",

              severity:
                "high",

              user:
                user.email,

              amount:
                numericAmount,

              timestamp:
                new Date(),

            }
          );

        }


        return res.status(202).json({

          success:
            true,

          status:
            "Pending",

          message:
            "Deposit request submitted and is awaiting admin approval.",

          requestId:
            request._id,

          amount:
            numericAmount,

          fee:
            fee,

          feeType:
            feeType,

          feeRate:
            feeRate,

          netAmount:
            netAmount,

          method:
            normalizedMethod,

        });

      }


      // ==================================================
      // OTHER METHODS
      // ==================================================
      //
      // PayPal has its own dedicated routes.
      // Stripe and other external methods should not
      // credit the wallet directly through this endpoint.
      // ==================================================

      return res.status(400).json({

        success:
          false,

        message:
          "This deposit method must be processed through its dedicated payment route.",

        method:
          normalizedMethod,

      });

    }

    catch (err) {

      console.error(
        "DEPOSIT ERROR:",
        err
      );

      return res.status(500).json({

        message:
          "Deposit failed",

        error:
          err.message,

      });

    }

  }
);

// ======================================================
// ADMIN DEPOSITS
// ======================================================

router.get(
  "/admin/deposits",

  auth,

  adminOnly,

  async (req, res) => {

    try {

      const deposits =
        await Transaction.find({

          type:
            "Deposit",

        }).sort({

          createdAt:
            -1,

        });


      return res.json(
        deposits
      );

    }

    catch (err) {

      console.error(
        err
      );


      return res.status(500).json({

        message:
          "Server error",

      });

    }

  }
);


// ======================================================
// USER DEPOSITS
// ======================================================

router.get(
  "/deposits",

  auth,

  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.user.id
        );


      if (!user) {

        return res.status(404).json({

          message:
            "User not found",

        });

      }


      const deposits =
        await Transaction.find({

          toEmail:
            user.email,

          type:
            "Deposit",

        }).sort({

          createdAt:
            -1,

        });


      return res.json(
        deposits
      );

    }

    catch (err) {

      console.error(
        err
      );


      return res.status(500).json({

        message:
          "Server error",

      });

    }

  }
);


module.exports =
  router;