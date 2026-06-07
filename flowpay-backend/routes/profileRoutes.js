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
// GET PROFILE
// =========================

router.get(
  "/profile",

  auth,

  async (req, res) => {
    try {

      const user =
        await User.findById(
          req.user.id
        ).select(
          "-password"
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      res.json(user);

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