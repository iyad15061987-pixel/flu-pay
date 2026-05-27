const express =
  require("express");

const router =
  express.Router();

const {
  auth,
} = require(
  "../middleware/auth"
);

const ApiKey =
  require(
    "../models/ApiKey"
  );

const User =
  require(
    "../models/User"
  );

const generateApiKey =
  require(
    "../utils/generateApiKey"
  );

// =========================
// CREATE API KEY
// =========================

router.post(
  "/api-keys",

  auth,

  adminOnly,

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

      const apiKey =
        generateApiKey();

      const key =
        await ApiKey.create({
          userId:
            user._id,

          email:
            user.email,

          name:
            req.body.name ||
            "Default Key",

          apiKey,

          permissions: [
            "transfers",
            "balance",
            "cards",
          ],
        });

      res.json(key);

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
// LIST API KEYS
// =========================

router.get(
  "/api-keys",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const keys =
        await ApiKey.find({
          userId:
            req.user.id,
        });

      res.json(keys);

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
// DELETE API KEY
// =========================

router.delete(
  "/api-keys/:id",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      await ApiKey.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "API key deleted",
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