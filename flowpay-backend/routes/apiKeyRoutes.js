const express =
  require("express");

const crypto =
  require("crypto");

const router =
  express.Router();

const {
  auth,
  adminOnly,
} = require(
  "../middleware/auth"
);

// =========================
// GENERATE API KEY
// =========================

router.post(
  "/api-keys/generate",

  auth,

  async (req, res) => {
    try {

      const apiKey =
        crypto.randomBytes(32)
          .toString("hex");

      return res.json({
        message:
          "API key generated",

        apiKey,
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
// ADMIN API KEYS
// =========================

router.get(
  "/admin/api-keys",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      return res.json([]);

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