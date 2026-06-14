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

const VirtualCard =
  require(
    "../models/VirtualCard"
  );

const User =
  require(
    "../models/User"
  );

  const Kyc =
  require(
    "../models/Kyc"
  );

// =========================
// GENERATE CARD NUMBER
// =========================

function generateCardNumber() {

  let card = "";

  for (
    let i = 0;
    i < 16;
    i++
  ) {

    card += Math.floor(
      Math.random() * 10
    );
  }

  return card;
}

// =========================
// GENERATE CVV
// =========================

function generateCVV() {

  return String(
    Math.floor(
      100 +
      Math.random() * 900
    )
  );
}

// =========================
// GENERATE EXPIRY
// =========================

function generateExpiry() {

  const date =
    new Date();

  date.setFullYear(
    date.getFullYear() + 3
  );

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const year =
    String(
      date.getFullYear()
    ).slice(-2);

  return `${month}/${year}`;
}

// =========================
// GET USER CARDS
// =========================

router.get(
  "/my-cards",

  auth,

  async (req, res) => {
    try {

      const cards =
        await VirtualCard.find({
          userId:
            req.user.id,
        });

      return res.json(
        cards
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
// CREATE CARD
// =========================

router.post(
  "/request-card",

  auth,

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
            "Need $10 to create card",
        });
      }

      const existing =
        await VirtualCard.findOne({
          userId:
            req.user.id,
        });

      if (
        existing
      ) {

        return res.status(400).json({
          message:
            "Card already exists",
        });
      }
const approvedKyc =
  await Kyc.findOne({
    userId:
      user._id,

    status:
      "approved",
  });

if (
  !approvedKyc
) {
  return res.status(403).json({
    message:
      "KYC approval required before issuing a card",
  });
}

if (
  user.balance < 10
) {
  return res.status(400).json({
    message:
      "Need $10 to create card",
  });
}

user.balance -= 10;

await user.save();

const cardHolder =
  approvedKyc?.fullName
    ? approvedKyc.fullName.toUpperCase()
    : user.email
        .split("@")[0]
        .toUpperCase();

await VirtualCard.create({
  userId:
    user._id,

  email:
    user.email,

  cardHolder,

  cardNumber:
    generateCardNumber(),

  cvv:
    generateCVV(),

  expiry:
    generateExpiry(),

  status:
    "active",
});

      return res.json({
        success: true,
        message:
          "Virtual card created",
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
// FREEZE CARD
// =========================

router.post(
  "/freeze-card/:id",

  auth,

  async (req, res) => {
    try {

      const card =
        await VirtualCard.findOne({
          _id:
            req.params.id,

          userId:
            req.user.id,
        });

      if (!card) {

        return res.status(404).json({
          message:
            "Card not found",
        });
      }

      card.status =
        card.status ===
        "active"
          ? "frozen"
          : "active";

      await card.save();

      return res.json({
        success: true,
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
// ADMIN CARDS
// =========================

router.get(
  "/admin/cards",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      const cards =
        await VirtualCard.find()
          .sort({
            createdAt: -1,
          });

      return res.json(
        cards
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
// SIMULATE CARD PURCHASE
// =========================

const CardTransaction =
  require(
    "../models/CardTransaction"
  );

router.post(
  "/card-purchase/:id",

  auth,

  async (req, res) => {
    try {

      const {
        amount,
        merchant,
      } = req.body;

      const card =
        await VirtualCard.findOne({
          _id:
            req.params.id,

          userId:
            req.user.id,
        });

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

        return res.status(400).json({
          message:
            "Card is frozen",
        });
      }

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

      const numericAmount =
        Number(amount);

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

      await CardTransaction.create({
        cardId:
          card._id,

        email:
          user.email,

        merchant:
          merchant ||
          "Unknown Merchant",

        amount:
          numericAmount,

        status:
          "completed",

        type:
          "purchase",
      });

      return res.json({
        success: true,
        message:
          "Purchase completed",
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