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

const Transaction =
  require(
    "../models/Transaction"
  );

// =========================
// GENERATE CARD
// =========================

const generateCardNumber =
  () => {
    let number = "4532";

    for (
      let i = 0;
      i < 12;
      i++
    ) {
      number += Math.floor(
        Math.random() * 10
      );
    }

    return number;
  };

const generateCVV =
  () => {
    return Math.floor(
      100 +
        Math.random() *
          900
    ).toString();
  };

const generateExpiry =
  () => {
    const year =
      new Date().getFullYear() +
      3;

    const month =
      String(
        Math.floor(
          Math.random() *
            12
        ) + 1
      ).padStart(2, "0");

    return `${month}/${String(
      year
    ).slice(-2)}`;
  };

// =========================
// REQUEST CARD
// =========================

router.post(
  "/request-card",

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

      if (
        user.balance < 10
      ) {
        return res.status(400).json({
          message:
            "Insufficient balance",
        });
      }

      user.balance -= 10;

      await user.save();

      const card =
        await VirtualCard.create(
          {
            userId:
              user._id,

            email:
              user.email,

            cardNumber:
              generateCardNumber(),

            cvv:
              generateCVV(),

            expiry:
              generateExpiry(),
          }
        );

      await Transaction.create({
        fromEmail:
          user.email,

        toEmail:
          "FlowPay Cards",

        amount: 10,

        type:
          "virtual_card_fee",
      });

      res.json({
        message:
          "Virtual card created successfully",

        card,
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
// GET MY CARDS
// =========================

router.get(
  "/my-cards",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const cards =
        await VirtualCard.find(
          {
            userId:
              req.user.id,
          }
        ).sort({
          createdAt: -1,
        });

      res.json(cards);

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
// FREEZE CARD
// =========================

router.post(
  "/freeze-card/:id",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const card =
        await VirtualCard.findById(
          req.params.id
        );

      if (!card) {
        return res.status(404).json({
          message:
            "Card not found",
        });
      }

      card.status =
        "frozen";

      await card.save();

      res.json({
        message:
          "Card frozen",
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
// DELETE CARD
// =========================

router.delete(
  "/delete-card/:id",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      await VirtualCard.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Card deleted",
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