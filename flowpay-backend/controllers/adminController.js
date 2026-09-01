const User =
  require("../models/User");

const DepositRequest =
  require(
    "../models/DepositRequest"
  );

const WithdrawRequest =
  require(
    "../models/WithdrawRequest"
  );

const Transaction =
  require(
    "../models/Transaction"
  );

  const createLedgerEntry =
  require(
    "../utils/ledger"
  );

const Notification =
  require(
    "../models/Notification"

  );
  const {
  calculateFee,
  getFeeRate,
} = require(
  "../utils/fees"
);

exports.getUsers =
  async (req, res) => {
    try {
      const users =
        await User.find().sort({
          createdAt: -1,
        });

      res.json(users);

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Server error",
      });
    }
  };

exports.createDepositRequest =
  async (req, res) => {
    try {
      const request =
        await DepositRequest.create(
          req.body
        );

      res.json({
        message:
          "Deposit request created",
      });

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Server error",
      });
    }
  };

exports.createWithdrawRequest =
  async (req, res) => {
    try {

      const amount =
  Number(
    req.body.amount
  );

if (
  !Number.isFinite(amount) ||
  amount <= 0
) {
  return res.status(400).json({
    message:
      "Invalid withdrawal amount",
  });
}

// =========================
// CHECK USER BALANCE
// =========================

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
  user.frozen
) {
  return res.status(403).json({
    message:
      "Account frozen",
  });
}

if (
  !user.active
) {
  return res.status(403).json({
    message:
      "Account inactive",
  });
}

if (
  Number(user.balance || 0) <
  amount
) {
  return res.status(400).json({
    message:
      "Insufficient balance",
  });
}

// =========================
// WITHDRAW METHOD
// =========================

const method =
  String(
    req.body.method ||
    ""
  )
    .toLowerCase()
    .trim();

if (!method) {
  return res.status(400).json({
    message:
      "Withdrawal method is required",
  });
}
const request =
  await WithdrawRequest.create({
    ...req.body,

    userId:
      req.user.id,

    email:
      req.user.email,

    amount:
      amount,

    method:
      method,

    status:
      "Pending",

    type:
      "Withdraw",
  });

      res.json({
        message:
          "Withdraw request created",
      });

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Server error",
      });
    }
  };

exports.getDepositRequests =
  async (req, res) => {
    try {
      const requests =
        await DepositRequest.find({
          status:
            "Pending",
        }).sort({
          createdAt: -1,
        });

      res.json(requests);

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Server error",
      });
    }
  };

exports.getWithdrawRequests =
  async (req, res) => {
    try {
      const requests =
        await WithdrawRequest.find({
          status:
            "Pending",
        }).sort({
          createdAt: -1,
        });

      res.json(requests);

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Server error",
      });
    }

  };exports.approveDeposit =
  async (req, res) => {

    try {

      const { requestId } =
        req.body;


      // =========================
      // GET REQUEST
      // =========================

      const request =
        await DepositRequest.findById(
          requestId
        );

      if (!request) {

        return res.status(404).json({
          message:
            "Request not found",
        });

      }


      // =========================
      // ONLY PENDING REQUESTS
      // =========================

      if (
        request.status !==
        "Pending"
      ) {

        return res.status(400).json({
          message:
            request.status === "Approved"
              ? "Deposit already approved"
              : "Deposit request is not pending",
        });

      }

// =========================
// PREVENT DUPLICATE TRANSACTION
// =========================

const duplicated =
  await Transaction.findOne({
    reference:
      String(request._id),

    type:
      "Withdraw",

    status:
      "completed",
  });

if (duplicated) {
  return res.status(400).json({
    message:
      "Withdrawal transaction already exists",
  });
}

      // =========================
      // USER
      // =========================

      const user =
        await User.findById(
          request.userId
        );

      if (!user) {

        return res.status(404).json({
          message:
            "User not found",
        });

      }


      // =========================
      // METHOD
      // =========================

      const normalizedMethod =
        String(
          request.method ||
          "manual"
        )
          .toLowerCase()
          .trim();


      // =========================
      // AMOUNT
      // =========================

      const amount =
        Number(
          request.amount
        );

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {

        return res.status(400).json({
          message:
            "Invalid deposit amount",
        });

      }


      // =========================
      // FEE
      // USE CENTRAL FEE SYSTEM
      // =========================

      const fee =
        Number(
          calculateFee(
            amount,
            normalizedMethod
          )
        );

      const feeRate =
        Number(
          getFeeRate(
            normalizedMethod
          )
        );


      if (
        !Number.isFinite(fee) ||
        fee < 0
      ) {

        return res.status(400).json({
          message:
            "Invalid deposit fee",
        });

      }


      // =========================
      // NET AMOUNT
      // =========================

      const netAmount =
        Number(
          (
            amount -
            fee
          ).toFixed(8)
        );

      if (
        !Number.isFinite(netAmount) ||
        netAmount < 0
      ) {

        return res.status(400).json({
          message:
            "Invalid net deposit amount",
        });

      }


      // =========================
      // BALANCE BEFORE
      // =========================

      const beforeBalance =
        Number(
          user.balance || 0
        );


      // =========================
      // TREASURY
      // =========================

      const treasury =
        await User.findOne({
          accountType:
            "treasury",
        });

      if (!treasury) {

        throw new Error(
          "Treasury account not found"
        );

      }


      const treasuryBefore =
        Number(
          treasury.balance || 0
        );


      // =========================
      // UPDATE USER
      // =========================

      user.balance =
        Number(
          (
            beforeBalance +
            netAmount
          ).toFixed(8)
        );

      user.totalDeposits =
        Number(
          user.totalDeposits || 0
        ) +
        amount;


      // =========================
      // UPDATE TREASURY
      // =========================

      treasury.balance =
        Number(
          (
            treasuryBefore +
            fee
          ).toFixed(8)
        );

      treasury.revenue =
        Number(
          (
            Number(
              treasury.revenue || 0
            ) +
            fee
          ).toFixed(8)
        );


      // =========================
      // SAVE BALANCES
      // =========================

      await user.save();

      await treasury.save();


      // =========================
      // LEDGER
      // =========================

      await createLedgerEntry({

        userId:
          user._id,

        email:
          user.email,

        type:
          "Admin Deposit Approval",

        amount:
          netAmount,

        balanceBefore:
          beforeBalance,

        balanceAfter:
          user.balance,

        reference:
          request._id,

        description:
          `Deposit approved by admin via ${normalizedMethod}`,

      });


      // =========================
      // MARK REQUEST APPROVED
      // =========================

      request.status =
        "Approved";

      request.approvedBy =
        req.user?.email ||
        "admin";

      request.approvedAt =
        new Date();

      await request.save();


      // =========================
      // TRANSACTION
      // =========================

      const transaction =
        await Transaction.create({

          fromEmail:
            "External",

          toEmail:
            user.email,

          amount:
            amount,

          fee:
            fee,

          netAmount:
            netAmount,

          feeType:
            normalizedMethod ===
              "crypto"
              ? "crypto"
              : normalizedMethod ===
                  "paypal"
              ? "paypal"
              : normalizedMethod ===
                  "bank" ||
                normalizedMethod ===
                  "bank_transfer" ||
                normalizedMethod ===
                  "bank transfer"
              ? "bank"
              : normalizedMethod ===
                  "stripe"
              ? "stripe"
              : "external",

          feeRate:
            feeRate,

          type:
            "Deposit",

          reference:
            request.reference ||
            String(
              request._id
            ),

          method:
            normalizedMethod,

          status:
            "completed",

        });


      // =========================
      // NOTIFICATION
      // =========================

      await Notification.create({

        email:
          user.email,

        title:
          "Deposit Approved",

        message:
          "Your " +
          normalizedMethod +
          " deposit of $" +
          amount.toFixed(2) +
          " was approved. " +
          "Fee: $" +
          fee.toFixed(4) +
          ". " +
          "Net amount: $" +
          netAmount.toFixed(4) +
          ".",

      });


      // =========================
      // RESPONSE
      // =========================

      return res.json({

        success:
          true,

        message:
          "Deposit approved",

        requestId:
          request._id,

        amount:
          amount,

        fee:
          fee,

        feeRate:
          feeRate,

        netAmount:
          netAmount,

        method:
          normalizedMethod,

        transactionId:
          transaction._id,

      });

    }

    catch (err) {

      console.error(
        "APPROVE DEPOSIT ERROR:",
        err
      );

      return res.status(500).json({

        message:
          "Server error",

        error:
          err.message,

      });

    }

  };

exports.rejectDeposit =
  async (req, res) => {
    try {

      const { requestId } =
        req.body;

      // =========================
      // GET REQUEST
      // =========================

      const request =
        await DepositRequest.findById(
          requestId
        );

      if (!request) {
        return res.status(404).json({
          message:
            "Deposit request not found",
        });
      }

      // =========================
      // ONLY PENDING
      // =========================

      if (
        request.status !==
        "Pending"
      ) {
        return res.status(400).json({
          message:
            request.status === "Rejected"
              ? "Deposit already rejected"
              : request.status === "Approved"
                ? "Deposit already approved"
                : "Deposit request is not pending",
        });
      }

      // =========================
      // MARK REJECTED
      // =========================

      request.status =
        "Rejected";

      request.rejectedAt =
        new Date();

      request.adminNote =
        req.body?.reason ||
        "Deposit rejected by admin";

      await request.save();

      // =========================
      // NOTIFICATION
      // =========================

      await Notification.create({
        email:
          request.email,

        title:
          "Deposit Rejected",

        message:
          "Your deposit request of $" +
          Number(
            request.amount || 0
          ).toFixed(2) +
          " was rejected by admin.",
      });

      // =========================
      // RESPONSE
      // =========================

      return res.json({
        success: true,

        message:
          "Deposit rejected",

        requestId:
          request._id,

        status:
          request.status,
      });

    } catch (err) {

      console.error(
        "REJECT DEPOSIT ERROR:",
        err
      );

      return res.status(500).json({
        message:
          "Server error",

        error:
          err.message,
      });
    }
  };

exports.approveWithdraw =
  async (req, res) => {
    try {

      const { requestId } =
        req.body;

      const request =
        await WithdrawRequest.findById(
          requestId
        );

      if (!request) {
        return res.status(404).json({
          message:
            "Request not found",
        });
      }

      // =========================
      // PREVENT DUPLICATE APPROVAL
      // =========================

      if (
        request.status ===
        "Approved"
      ) {
        return res.status(400).json({
          message:
            "Withdraw already approved",
        });
      }

      // =========================
// ONLY PENDING REQUESTS
// =========================

if (
  request.status !==
  "Pending"
) {
  return res.status(400).json({
    message:
      "Withdraw request is not pending",
  });
}

      const user =
        await User.findById(
          request.userId
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      // =========================
// ACCOUNT STATUS
// =========================

if (
  user.frozen
) {
  return res.status(403).json({
    message:
      "Account frozen",
  });
}

if (
  !user.active
) {
  return res.status(403).json({
    message:
      "Account inactive",
  });
}

// =========================
// AMOUNT
// =========================

const amount =
  Number(
    request.amount
  );

if (
  !Number.isFinite(amount) ||
  amount <= 0
) {
  return res.status(400).json({
    message:
      "Invalid withdrawal amount",
  });
}


// =========================
// FEE
// =========================

const fee =
  Number(
    calculateExternalFee(
      amount
    ).toFixed(2)
  );


// =========================
// NET AMOUNT
// =========================

const netAmount =
  Number(
    (
      amount -
      fee
    ).toFixed(2)
  );

if (
  !Number.isFinite(netAmount) ||
  netAmount < 0
) {
  return res.status(400).json({
    message:
      "Invalid withdrawal fee",
  });
}

if (

  Number(user.balance || 0) <
  amount
) {
  return res.status(400).json({
    message:
      "Insufficient balance",
  });
}

// =========================
// PREVENT DUPLICATE REQUEST
// =========================

const existingRequest =
  await WithdrawRequest.findOne({
    userId:
      req.user.id,

    amount:
      amount,

    method:
      method,

    status:
      "Pending",
  });

if (existingRequest) {
  return res.status(409).json({
    message:
      "A pending withdrawal request already exists for this amount and method.",
    requestId:
      existingRequest._id,
  });
}

const beforeBalance =
  Number(
    user.balance || 0
  );

// =========================
// TREASURY
// =========================

const treasury =
  await User.findOne({
    accountType:
      "treasury",
  });

if (!treasury) {
  throw new Error(
    "Treasury account not found"
  );
}

const treasuryBefore =
  Number(
    treasury.balance || 0
  );

// =========================
// UPDATE BALANCES
// =========================

user.balance =
  Number(
    (
      Number(user.balance || 0) -
      amount
    ).toFixed(8)
  );
  treasury.balance =
  Number(
    (

      treasuryBefore +
      fee
    ).toFixed(8)
  );

treasury.revenue =
  Number(
    (

      Number(
        treasury.revenue || 0
      ) +
      fee
    ).toFixed(8)
  );

await user.save();

await treasury.save();

      await createLedgerEntry({
  userId:
    user._id,

  email:
    user.email,

  type:
    "Admin Withdraw Approval",

amount:
  amount,

  balanceBefore:
    beforeBalance,

  balanceAfter:
    user.balance,

  reference:
    request._id,

  description:
     "Withdrawal approved by admin. External payout not executed.",
});

     request.status =
  "Approved";

request.approvedBy =
  req.user?.email ||
  "admin";

request.approvedAt =
  new Date();

await request.save();

    const transaction =
  await Transaction.create({

    fromEmail:
      request.email,

    toEmail:
      "External",

    amount:
      amount,

    fee:
      fee,

    netAmount:
      netAmount,

    feeType:
      "external",

    feeRate:
      amount > 0
        ? fee / amount
        : 0,

    type:
      "Withdraw",

    method:
      request.method ||
      "external",

    reference:
      String(
        request._id
      ),

    status:
      "completed",

  });

      await Notification.create({
        email:
          request.email,

        title:
          "Withdraw Approved",

        message:
          `Your withdraw of $${request.amount} was approved`,
      });

      return res.json({
        success: true,
        message:
          "Withdraw approved",
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server error",
      });

    }
  };
