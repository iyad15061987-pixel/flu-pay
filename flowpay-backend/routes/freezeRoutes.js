const express =
  require("express");

const router =
  express.Router();

const adminAuth =
  require(
    "../middleware/adminAuth"
  );

const User =
  require(
    "../models/User"
  );

router.post(
  "/freeze-user",
  adminauth,

  adminOnly,

  async (req, res) => {
    try {
      await User.findByIdAndUpdate(
        req.body.userId,
        {
          frozen: true,
        }
      );

      res.json({
        message:
          "User frozen",
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

router.post(
  "/unfreeze-user",
  adminauth,

  adminOnly,

  async (req, res) => {
    try {
      await User.findByIdAndUpdate(
        req.body.userId,
        {
          frozen: false,
        }
      );

      res.json({
        message:
          "User unfrozen",
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

router.post(
  "/delete-user",
  adminauth,

  adminOnly,

  async (req, res) => {
    try {
      await User.findByIdAndDelete(
        req.body.userId
      );

      res.json({
        message:
          "User deleted",
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