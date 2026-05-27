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

// =========================
// SEND PUSH NOTIFICATION
// =========================

router.post(
  "/push/send",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      const {
        title,
        body,
      } = req.body;

      return res.json({
        message:
          "Push notification queued",

        data: {
          title,
          body,
        },
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
// PUSH STATUS
// =========================

router.get(
  "/push/status",

  auth,

  async (req, res) => {
    try {

      return res.json({
        firebase:
          false,

        message:
          "Firebase optional mode active",
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