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

const Withdrawal =
require(
"../models/Withdrawal"
);

const User =
require(
"../models/User"
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

  ```
  const withdrawals =
    await Withdrawal.find()
      .sort({
        createdAt: -1,
      });

  return res.json(
    withdrawals
  );

} catch (err) {

  console.log(err);

  return res.status(500).json({
    message:
      "Server error",
  });
}

});

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
    message:
      "Withdrawal not found",
  });

}

const user =
  await User.findById(
    withdrawal.userId
  );

if (user) {

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

}

withdrawal.status =
  "approved";

withdrawal.processedAt =
  new Date();

withdrawal.processedBy =
  req.user.id;

await withdrawal.save();

return res.json({
  success: true,
  message:
    "Withdrawal approved",
});

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

});

// =========================
// COMPLETE WITHDRAWAL
// =========================

router.post(
"/admin/withdrawals/:id/complete",

auth,

adminOnly,

async (req, res) => {

```
try {

  const withdrawal =
    await Withdrawal.findById(
      req.params.id
    );

  if (!withdrawal) {

    return res.status(404).json({
      message:
        "Withdrawal not found",
    });

  }

  withdrawal.status =
    "completed";

  withdrawal.processedAt =
    new Date();

  withdrawal.processedBy =
    req.user.id;

  await withdrawal.save();

  return res.json({
    success: true,
    message:
      "Withdrawal completed",
  });

} catch (err) {

  console.log(err);

  return res.status(500).json({
    message:
      "Server error",
  });

}

});

// =========================
// REJECT WITHDRAWAL
// REFUND USER
// =========================

router.post(
"/admin/withdrawals/:id/reject",

auth,

adminOnly,

async (req, res) => {

```
try {

  const withdrawal =
    await Withdrawal.findById(
      req.params.id
    );

  if (!withdrawal) {

    return res.status(404).json({
      message:
        "Withdrawal not found",
    });

  }

  const user =
    await User.findById(
      withdrawal.userId
    );

  if (user) {

    user.balance +=
      Number(
        withdrawal.amount || 0
      );

    await user.save();

  }

  withdrawal.status =
    "rejected";

  withdrawal.processedAt =
    new Date();

  withdrawal.processedBy =
    req.user.id;

  await withdrawal.save();

  return res.json({
    success: true,
    message:
      "Withdrawal rejected and refunded",
  });

} catch (err) {

  console.log(err);

  return res.status(500).json({
    message:
      "Server error",
  });

}

});

module.exports =
router;
