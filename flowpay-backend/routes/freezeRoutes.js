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

const User =
  require(
    "../models/User"
  );

// =========================
// FREEZE USER
// =========================

router.post(
  "/freeze/:id",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      user.frozen = true;

      await user.save();

      return res.json({
        message:
          "User frozen successfully",
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
// UNFREEZE USER
// =========================

router.post(
  "/unfreeze/:id",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      user.frozen = false;

      await user.save();

      return res.json({
        message:
          "User unfrozen successfully",
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