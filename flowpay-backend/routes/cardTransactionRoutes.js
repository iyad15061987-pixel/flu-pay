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

const CardTransaction =
  require(
    "../models/CardTransaction"
  );

const VirtualCard =
  require(
    "../models/VirtualCard"
  );

// =========================
// CARD TRANSACTIONS
// =========================

router.get(
  "/card-transactions/:cardId",

  auth,

  async (req, res) => {
    try {

      const card =
        await VirtualCard.findOne({
          _id:
            req.params.cardId,

          userId:
            req.user.id,
        });

      if (!card) {

        return res.status(404).json({
          message:
            "Card not found",
        });
      }

      const transactions =
        await CardTransaction.find({
          cardId:
            card._id,
        }).sort({
          createdAt: -1,
        });

      return res.json(
        transactions
      );

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
// ADMIN CARD TRANSACTIONS
// =========================

router.get(
  "/admin/card-transactions",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      const transactions =
        await CardTransaction.find()
          .sort({
            createdAt: -1,
          });

      return res.json(
        transactions
      );

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