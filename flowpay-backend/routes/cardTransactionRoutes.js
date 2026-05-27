const express =
  require("express");

const router =
  express.Router();

const {
  auth,
} = require(
  "../middleware/auth"
);

const User =
  require(
    "../models/User"
  );

const VirtualCard =
  require(
    "../models/VirtualCard"
  );

const CardTransaction =
  require(
    "../models/CardTransaction"
  );

// =========================
// CARD PURCHASE
// =========================

router.post(
  "/card-purchase",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const {
        cardId,
        merchant,
        amount,
      } = req.body;

      const numericAmount =
        Number(amount);

      const card =
        await VirtualCard.findById(
          cardId
        );

      if (!card) {
        return res.status(404).json({
          message:
            "Card not found",
        });
      }

      if (
        card.status !==
        "active"
      ) {
        return res.status(403).json({
          message:
            "Card is frozen",
        });
      }

      const user =
        await User.findById(
          card.userId
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      if (
        user.balance <
        numericAmount
      ) {
        return res.status(400).json({
          message:
            "Insufficient balance",
        });
      }

      user.balance -=
        numericAmount;

      await user.save();

      const transaction =
        await CardTransaction.create(
          {
            cardId:
              card._id,

            email:
              user.email,

            merchant,

            amount:
              numericAmount,
          }
        );

      res.json({
        message:
          "Purchase completed",

        transaction,
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
// GET CARD TRANSACTIONS
// =========================

router.get(
  "/card-transactions/:cardId",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const transactions =
        await CardTransaction.find(
          {
            cardId:
              req.params.cardId,
          }
        ).sort({
          createdAt: -1,
        });

      res.json(
        transactions
      );

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