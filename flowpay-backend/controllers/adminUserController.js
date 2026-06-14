const User =
  require("../models/User");

// =========================
// GET ALL USERS
// =========================

exports.getAllUsers =
  async (req, res) => {

    try {

      const users =
        await User.find()
          .sort({
            createdAt: -1,
          });

      res.json(users);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Server error",
      });

    }

  };

// =========================
// FREEZE USER
// =========================

exports.freezeUser =
  async (req, res) => {

    try {

      await User.findByIdAndUpdate(
        req.params.id,
        {
          frozen: true,
        }
      );

      res.json({
        success: true,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Server error",
      });

    }

  };

// =========================
// UNFREEZE USER
// =========================

exports.unfreezeUser =
  async (req, res) => {

    try {

      await User.findByIdAndUpdate(
        req.params.id,
        {
          frozen: false,
        }
      );

      res.json({
        success: true,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Server error",
      });

    }

  };

// =========================
// UPDATE BALANCE
// =========================

exports.updateBalance =
  async (req, res) => {

    try {

      const {
        balance,
      } = req.body;

      await User.findByIdAndUpdate(
        req.params.id,
        {
          balance:
            Number(balance),
        }
      );

      res.json({
        success: true,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Server error",
      });

    }

  };

// =========================
// UPDATE ROLE
// =========================

exports.updateRole =
  async (req, res) => {

    try {

      const {
        role,
      } = req.body;

      await User.findByIdAndUpdate(
        req.params.id,
        {
          role,
        }
      );

      res.json({
        success: true,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Server error",
      });

    }

  };