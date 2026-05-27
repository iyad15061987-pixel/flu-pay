const express =
  require("express");

const router =
  express.Router();

const {
  auth,
} = require(
  "../middleware/auth"
);

const CorporateAccount =
  require(
    "../models/CorporateAccount"
  );

// =========================
// CREATE CORPORATE
// =========================

router.post(
  "/create-corporate",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const {
        companyName,
      } = req.body;

      const exists =
        await CorporateAccount.findOne(
          {
            ownerEmail:
              req.user.email,
          }
        );

      if (
        exists
      ) {
        return res.status(400).json({
          message:
            "Corporate account already exists",
        });
      }

      const corporate =
        await CorporateAccount.create(
          {
            companyName,

            ownerEmail:
              req.user.email,

            members: [
              {
                email:
                  req.user.email,

                role:
                  "Owner",
              },
            ],
          }
        );

      res.json({
        message:
          "Corporate account created",

        corporate,
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
// ADD MEMBER
// =========================

router.post(
  "/add-corporate-member",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const {
        companyId,

        email,

        role,
      } = req.body;

      const corporate =
        await CorporateAccount.findById(
          companyId
        );

      if (!corporate) {
        return res.status(404).json({
          message:
            "Corporate account not found",
        });
      }

      if (
        corporate.ownerEmail !==
        req.user.email
      ) {
        return res.status(403).json({
          message:
            "Unauthorized",
        });
      }

      corporate.members.push({
        email,

        role,
      });

      await corporate.save();

      res.json({
        message:
          "Member added",
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
// GET CORPORATE
// =========================

router.get(
  "/corporate",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const corporate =
        await CorporateAccount.findOne(
          {
            ownerEmail:
              req.user.email,
          }
        );

      res.json(
        corporate
      );

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