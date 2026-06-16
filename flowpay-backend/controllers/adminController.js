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
  calculateExternalFee,
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
      const request =
        await WithdrawRequest.create(
          req.body
        );

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
  };

exports.approveDeposit =
  async (req, res) => {
    try {

      const { requestId } =
        req.body;

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
      // PREVENT DUPLICATE APPROVAL
      // =========================

      if (
        request.status ===
        "Approved"
      ) {
        return res.status(400).json({
          message:
            "Deposit already approved",
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

      const fee =
        calculateExternalFee(
          request.amount
        );

      const netAmount =
        request.amount -
        fee;

        const beforeBalance =
  user.balance;
  
      user.balance +=
        netAmount;

      user.revenue +=
        fee;

      await user.save();

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
    "Deposit approved by admin",
});

      request.status =
        "Approved";

      await request.save();

      await Transaction.create({
        fromEmail:
          "External",

        toEmail:
          request.email,

        amount:
          request.amount,

        fee,

        netAmount,

        type:
          "Deposit",
      });

      await Notification.create({
        email:
          request.email,

        title:
          "Deposit Approved",

        message:
          `Your deposit of $${request.amount} was approved`,
      });

      return res.json({
        success: true,
        message:
          "Deposit approved",
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server error",
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

      const fee =
        calculateExternalFee(
          request.amount
        );

      const total =
        Number(
          request.amount
        );

      if (
        user.balance <
        total
      ) {
        return res.status(400).json({
          message:
            "Insufficient balance",
        });
      }

      const beforeBalance =
  user.balance;

      user.balance -=
        total;

      user.revenue +=
        fee;

      await user.save();

      await createLedgerEntry({
  userId:
    user._id,

  email:
    user.email,

  type:
    "Admin Withdraw Approval",

  amount:
    total,

  balanceBefore:
    beforeBalance,

  balanceAfter:
    user.balance,

  reference:
    request._id,

  description:
    "Withdrawal approved by admin",
});

      request.status =
        "Approved";

      await request.save();

      await Transaction.create({
        fromEmail:
          request.email,

        toEmail:
          "External",

        amount:
          request.amount,

        fee,

        netAmount:
          request.amount -
          fee,

        type:
          "Withdraw",
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