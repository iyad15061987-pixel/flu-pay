const allowRoles =
  require(
    "../middleware/roles"
  );

const express =
  require("express");

const router =
  express.Router();

const adminAuth =
  require(
    "../middleware/adminAuth"
  );

const Treasury =
  require(
    "../models/Treasury"
  );

const User =
  require(
    "../models/User"
  );

// =========================
// GET TREASURY
// =========================

router.get(
  "/admin/treasury",

  adminauth,

  adminOnly,

  async (req, res) => {
    try {
      const treasury =
        await Treasury.find();

      const users =
        await User.find();

      let liabilities =
        0;

      users.forEach(
        (user) => {
          liabilities +=
            user.balance;
        }
      );

      let reserves =
        0;

      treasury.forEach(
        (wallet) => {
          reserves +=
            wallet.hotWallet +
            wallet.coldWallet +
            wallet.reserveWallet;
        }
      );

      res.json({
        treasury,

        liabilities,

        reserves,

        coverageRatio:
          reserves /
          liabilities,
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
// UPDATE TREASURY
// =========================

router.post(
  "/admin/update-treasury",

  adminAuth,

  allowRoles(
  "SuperAdmin",
  "Treasury"
),

  async (req, res) => {
    try {
      const {
        currency,

        hotWallet,

        coldWallet,

        reserveWallet,
      } = req.body;

      const updated =
        await Treasury.findOneAndUpdate(
          {
            currency,
          },

          {
            hotWallet,

            coldWallet,

            reserveWallet,
          },

          {
            upsert: true,

            new: true,
          }
        );

      res.json({
        message:
          "Treasury updated",

        updated,
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