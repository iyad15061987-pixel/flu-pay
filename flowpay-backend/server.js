require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "flowpay_secret_key";

const MONGO_URI =
  process.env.MONGO_URI;

// =========================
// CONNECT MONGODB
// =========================

console.log("⏳ Connecting to MongoDB...");

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.log("❌ Mongo Error:", err);
  });

// =========================
// USER MODEL
// =========================

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },

  password: String,

  balance: {
    type: Number,
    default: 0,
  },

  role: {
    type: String,
    default: "user",
  },

  frozen: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model(
  "User",
  UserSchema
);

// =========================
// TRANSACTION MODEL
// =========================

const TransactionSchema =
  new mongoose.Schema({
    fromEmail: String,

    toEmail: String,

    amount: Number,

    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

const Transaction = mongoose.model(
  "Transaction",
  TransactionSchema
);

// =========================
// AUTH MIDDLEWARE
// =========================

const auth = (
  req,
  res,
  next
) => {
  try {
    const token =
      req.headers.authorization?.split(
        " "
      )[1];

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (err) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

// =========================
// HOME
// =========================

app.get("/", (req, res) => {
  res.send("FlowPay API running 🚀");
});

// =========================
// REGISTER
// =========================

app.post(
  "/register",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (
        !email ||
        !password
      ) {
        return res.status(400).json({
          message: "Missing data",
        });
      }

      const existingUser =
        await User.findOne({
          email,
        });

      if (existingUser) {
        return res.status(400).json({
          message:
            "User already exists",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const user =
        new User({
          email,
          password:
            hashedPassword,
          balance: 0,
        });

      await user.save();

      res.json({
        message:
          "Account created successfully",
      });

    } catch (err) {
      console.log(
        "REGISTER ERROR:",
        err
      );

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

// =========================
// LOGIN
// =========================

app.post(
  "/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      const user =
        await User.findOne({
          email,
        });

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      if (user.frozen) {
        return res.status(403).json({
          message:
            "Account frozen",
        });
      }

      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isMatch) {
        return res.status(400).json({
          message:
            "Wrong password",
        });
      }

      const token = jwt.sign(
        {
          id: user._id,
          email:
            user.email,
        },

        JWT_SECRET,

        {
          expiresIn: "7d",
        }
      );

      res.json({
        message:
          "Login success",

        token,

        userId:
          user._id,

        email:
          user.email,

        role:
          user.role,
      });

    } catch (err) {
      console.log(
        "LOGIN ERROR:",
        err
      );

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

// =========================
// CURRENT USER
// =========================

app.get(
  "/me",
  auth,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.id
        );

      res.json(user);

    } catch (err) {
      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

// =========================
// ALL USERS
// =========================

app.get(
  "/users",
  async (req, res) => {
    try {
      const users =
        await User.find();

      res.json(users);

    } catch (err) {
      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

// =========================
// BALANCE
// =========================

app.get(
  "/balance/:id",
  auth,
  async (req, res) => {
    try {
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

      res.json({
        balance:
          user.balance,
      });

    } catch (err) {
      console.log(
        "BALANCE ERROR:",
        err
      );

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

// =========================
// ADD BALANCE
// =========================

app.post(
  "/add-balance",
  auth,
  async (req, res) => {
    try {
      const {
        userId,
        amount,
      } = req.body;

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      user.balance += Number(
        amount
      );

      await user.save();

      res.json({
        balance:
          user.balance,
      });

    } catch (err) {
      console.log(
        "ADD BALANCE ERROR:",
        err
      );

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

// =========================
// FREEZE USER
// =========================

app.post(
  "/freeze-user",
  auth,
  async (req, res) => {
    try {
      const { userId } =
        req.body;

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      user.frozen =
        !user.frozen;

      await user.save();

      res.json({
        message:
          user.frozen
            ? "User frozen"
            : "User unfrozen",

        frozen:
          user.frozen,
      });

    } catch (err) {
      console.log(
        "FREEZE ERROR:",
        err
      );

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

// =========================
// TRANSFER
// =========================

app.post(
  "/transfer",
  auth,
  async (req, res) => {
    try {
      const {
        fromUserId,
        toEmail,
        amount,
      } = req.body;

      const sender =
        await User.findById(
          fromUserId
        );

      const receiver =
        await User.findOne({
          email:
            toEmail,
        });

      if (
        !sender ||
        !receiver
      ) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      if (sender.frozen) {
        return res.status(403).json({
          message:
            "Account frozen",
        });
      }

      const transferAmount =
        Number(amount);

      if (
        sender.balance <
        transferAmount
      ) {
        return res.status(400).json({
          message:
            "Insufficient balance",
        });
      }

      sender.balance -=
        transferAmount;

      receiver.balance +=
        transferAmount;

      await sender.save();

      await receiver.save();

      const transaction =
        new Transaction({
          fromEmail:
            sender.email,

          toEmail:
            receiver.email,

          amount:
            transferAmount,
        });

      await transaction.save();

      res.json({
        message:
          "Transfer successful",

        balance:
          sender.balance,
      });

    } catch (err) {
      console.log(
        "TRANSFER ERROR:",
        err
      );

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

// =========================
// TRANSACTIONS
// =========================

app.get(
  "/transactions/:email",
  auth,
  async (req, res) => {
    try {
      const email =
        req.params.email;

      const transactions =
        await Transaction.find({
          $or: [
            {
              fromEmail:
                email,
            },

            {
              toEmail:
                email,
            },
          ],
        }).sort({
          createdAt: -1,
        });

      res.json(
        transactions
      );

    } catch (err) {
      console.log(
        "TX ERROR:",
        err
      );

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

// =========================
// SEARCH USERS
// =========================

app.get(
  "/search-users",
  auth,
  async (req, res) => {
    try {
      const query =
        req.query.query;

      const users =
        await User.find({
          email: {
            $regex:
              query || "",
            $options: "i",
          },
        }).limit(10);

      res.json(users);

    } catch (err) {
      console.log(
        "SEARCH ERROR:",
        err
      );

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});