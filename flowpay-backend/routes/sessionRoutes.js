const express =
  require("express");

const router =
  express.Router();

const {
  auth,
} = require(
  "../middleware/auth"
);

const UserSession =
  require(
    "../models/UserSession"
  );

// =========================
// GET USER SESSIONS
// =========================

router.get(
  "/sessions",

  auth,

  async (req, res) => {
    try {

      const sessions =
        await UserSession.find({
          userId:
            req.user.id,

          active:
            true,
        })
          .sort({
            lastSeen: -1,
          });

      return res.json(
        sessions
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
// LOGOUT ALL DEVICES
// =========================

router.post(
  "/logout-all",

  auth,

  async (req, res) => {
    try {

      await UserSession.updateMany(
        {
          userId:
            req.user.id,
        },

        {
          active:
            false,
        }
      );

      return res.json({
        message:
          "All sessions logged out",
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
// LOGOUT ONE SESSION
// =========================

router.post(
  "/logout-session",

  auth,

  async (req, res) => {
    try {

      const {
        sessionId,
      } = req.body;

      await UserSession.findOneAndUpdate(
        {
          _id:
            sessionId,

          userId:
            req.user.id,
        },

        {
          active:
            false,
        }
      );

      return res.json({
        message:
          "Session terminated",
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