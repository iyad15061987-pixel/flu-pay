const express = require("express");
const router = express.Router();

const {
  auth,
  adminOnly,
} = require("../middleware/auth");

const Withdrawal =
  require("../models/Withdrawal");

const User =
  require("../models/User");

  const Transaction =
  require("../models/Transaction");
  
  const createLedgerEntry =
  require(
    "../utils/ledger"
  );

// =========================
// GET ALL WITHDRAWALS
// =========================

router.get(
  "/admin/withdrawals",
  auth,
  adminOnly,
  async (req, res) => {
    try {

      const withdrawals =
        await Withdrawal.find().sort({
          createdAt: -1,
        });

      return res.json(
        withdrawals
      );

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message: "Server error",
      });

    }
  }
);

// =========================
// APPROVE WITHDRAWAL
// =========================

router.post(
  "/admin/withdrawals/:id/approve",
  auth,
  adminOnly,
  async (req, res) => {
    try {

      const withdrawal =
        await Withdrawal.findById(
          req.params.id
        );

      if (!withdrawal) {
        return res.status(404).json({
          message: "Withdrawal not found",
        });
      }

      const user =
        await User.findById(
          withdrawal.userId
        );

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
const beforeBalance =
  user.balance;

user.balance -=
  Number(
    withdrawal.amount || 0
  );

user.totalWithdrawals =
  (user.totalWithdrawals || 0) +
  Number(
    withdrawal.amount || 0
  );

await user.save();

await createLedgerEntry({
  userId:
    user._id,

  email:
    user.email,

  type:
    "Withdrawal Approved",

  amount:
    Number(
      withdrawal.amount || 0
    ),

  balanceBefore:
    beforeBalance,

  balanceAfter:
    user.balance,

  reference:
    withdrawal._id,

  description:
    "Withdrawal approved by admin",
});

withdrawal.status =
  "approved";

withdrawal.processedAt =
  new Date();

await withdrawal.save();

await Transaction.findOneAndUpdate(
  {
    fromEmail:
      user.email,

    type:
      "Withdrawal",

    status:
      "pending",
  },
  {
    status:
      "approved",
  },
  {
    sort: {
      createdAt: -1,
    },
  }
);

return res.json({
  success: true,
  message:
    "Withdrawal approved",
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
// REJECT WITHDRAWAL
// =========================

router.post(
  "/admin/withdrawals/:id/reject",
  auth,
  adminOnly,
  async (req, res) => {
    try {

      const withdrawal =
        await Withdrawal.findById(
          req.params.id
        );

      if (!withdrawal) {
        return res.status(404).json({
          message: "Withdrawal not found",
        });
      }

      // لا نعيد أي رصيد لأن الرصيد
      // لم يتم خصمه عند إنشاء الطلب

      withdrawal.status =
        "rejected";

      withdrawal.processedAt =
        new Date();

      await withdrawal.save();

      return res.json({
        success: true,
        message:
          "Withdrawal rejected",
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message: "Server error",
      });

    }
  }
);

module.exports = router;