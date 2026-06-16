const User =
  require("../models/User");

const Transaction =
  require(
    "../models/Transaction"
  );

const createLedgerEntry =
  require(
    "../utils/ledger"
  );

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

      const beforeBalance =
        user.balance;

      const newBalance =
        Number(balance);

      if (
        isNaN(newBalance)
      ) {
        return res.status(400).json({
          message:
            "Invalid balance",
        });
      }

      const difference =
        newBalance -
        beforeBalance;

      user.balance =
        newBalance;

      await user.save();

      await createLedgerEntry({
        userId:
          user._id,

        email:
          user.email,

        type:
          "Admin Balance Adjustment",

        amount:
          Math.abs(
            difference
          ),

        balanceBefore:
          beforeBalance,

        balanceAfter:
          newBalance,

        reference:
          req.user.id,

        description:
          "Balance adjusted by admin",
      });

      await Transaction.create({
        fromEmail:
          "ADMIN",

        toEmail:
          user.email,

        amount:
          Math.abs(
            difference
          ),

        fee: 0,

        netAmount:
          Math.abs(
            difference
          ),

        type:
          difference >= 0
            ? "Admin Credit"
            : "Admin Debit",

        reference:
          req.user.id,

        status:
          "completed",
      });

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