require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const PORT =
  process.env.PORT || 5000;

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "flowpay_secret_key";

const MONGO_URI =
  process.env.MONGO_URI;

// =========================
// FEES SYSTEM
// =========================

const INTERNAL_FEE =
  0.0001;

const EXTERNAL_FEE =
  0.035;

const MINIMUM_FEE =
  0.1;
// =========================
// SECURITY LIMITS
// =========================

const MIN_TRANSFER =
  1;

const MAX_TRANSFER =
  10000;

const MAX_REQUEST =
  50000;
// =========================
// CONNECT DATABASE
// =========================

console.log(
  "⏳ Connecting to MongoDB..."
);

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS:
      30000,

    socketTimeoutMS: 45000,

    family: 4,
  })

  .then(() => {
    console.log(
      "✅ MongoDB Connected"
    );
  })

  .catch((err) => {
    console.log(
      "❌ Mongo Error:",
      err
    );
  });

// =========================
// USER MODEL
// =========================

const UserSchema =
  new mongoose.Schema({
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

    revenue: {
      type: Number,
      default: 0,
    },
  currency: {
  type: String,
  default: "USD",
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

    fee: Number,

    netAmount: Number,

    type: String,

    status: {
      type: String,
      default: "completed",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

const Transaction =
  mongoose.model(
    "Transaction",
    TransactionSchema
  );

// =========================
// LOG MODEL
// =========================

const LogSchema =
  new mongoose.Schema({
    action: String,

    email: String,

    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

const Log = mongoose.model(
  "Log",
  LogSchema
);
// =========================
// NOTIFICATION MODEL
// =========================

const NotificationSchema =
  new mongoose.Schema({
    email: String,

    message: String,

    read: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

const Notification =
  mongoose.model(
    "Notification",
    NotificationSchema
  );
// =========================
// SUPPORT MODEL
// =========================

const SupportSchema =
  new mongoose.Schema({
    email: String,

    subject: String,

    message: String,

    status: {
      type: String,
      default: "open",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

const Support =
  mongoose.model(
    "Support",
    SupportSchema
  );
  // =========================
// REQUEST MODEL
// =========================

const RequestSchema =
  new mongoose.Schema({
    userId: String,

    email: String,

    type: String,

    method: String,

    amount: Number,

    wallet: String,

    status: {
      type: String,
      default: "pending",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

const Request =
  mongoose.model(
    "Request",
    RequestSchema
  );

// =========================
// AUTH
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
        message:
          "Unauthorized",
      });
    }

    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
      );

    req.user = decoded;

    next();

  } catch (err) {
    return res.status(401).json({
      message:
        "Invalid token",
    });
  }
};

// =========================
// ADMIN AUTH
// =========================

const adminAuth =
  async (
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
        return res
          .status(401)
          .json({
            message:
              "Unauthorized",
          });
      }

      const decoded =
        jwt.verify(
          token,
          JWT_SECRET
        );

      const user =
        await User.findById(
          decoded.id
        );

      if (
        !user ||
        user.role !==
          "admin"
      ) {
        return res
          .status(403)
          .json({
            message:
              "Admin only",
          });
      }

      req.user = user;

      next();

    } catch (err) {
      return res
        .status(401)
        .json({
          message:
            "Invalid token",
        });
    }
  };

// =========================
// HOME
// =========================

app.get("/", (req, res) => {
  res.send(
    "FlowPay API running 🚀"
  );
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
          message:
            "Missing data",
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
        });

      await user.save();

      await Log.create({
        action:
          "New account created",

        email,
      });

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

      await Log.create({
        action:
          "User login",

        email,
      });

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

        balance:
          user.balance,
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
// USERS
// =========================

app.get(
  "/users",
  adminAuth,
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

      res.json({
        balance:
          user.balance,
      });

    } catch (err) {
      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);
// =========================
// INTERNAL TRANSFER
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
  sender.email ===
  receiver.email
) {
  return res.status(400).json({
    message:
      "Cannot send to yourself",
  });
}

if (
  transferAmount <
  MIN_TRANSFER
) {
  return res.status(400).json({
    message:
      `Minimum transfer is ${MIN_TRANSFER}$`,
  });
}

if (
  transferAmount >
  MAX_TRANSFER
) {
  return res.status(400).json({
    message:
      `Maximum transfer is ${MAX_TRANSFER}$`,
  });
}
      let fee =
        transferAmount *
        INTERNAL_FEE;

      if (
        fee < MINIMUM_FEE
      ) {
        fee =
          MINIMUM_FEE;
      }

      const total =
        transferAmount +
        fee;

      if (
        sender.balance <
        total
      ) {
        return res.status(400).json({
          message:
            "Insufficient balance",
        });
      }

      const netAmount =
        transferAmount;

      sender.balance -=
        total;

      receiver.balance +=
        netAmount;

      sender.revenue +=
        fee;

      await sender.save();

      await receiver.save();

      await Transaction.create({
        fromEmail:
          sender.email,

        toEmail:
          receiver.email,

        amount:
          transferAmount,

        fee,

        netAmount,

        type:
          "internal_transfer",
      });

      await Log.create({
        action:
          `Internal transfer ${transferAmount}$ to ${receiver.email}`,

        email:
          sender.email,
      });

      await Notification.create({
  email: sender.email,

  message:
    `You sent ${transferAmount}$ to ${receiver.email}`,
});

await Notification.create({
  email: receiver.email,

  message:
    `You received ${transferAmount}$ from ${sender.email}`,
});
      res.json({
        message:
          "Transfer successful",

        fee,

        total,

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
// EXTERNAL DEPOSIT
// =========================

app.post(
  "/external-deposit",
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

      const depositAmount =
        Number(amount);

      let fee =
        depositAmount *
        EXTERNAL_FEE;

      if (
        fee < MINIMUM_FEE
      ) {
        fee =
          MINIMUM_FEE;
      }

      const netAmount =
        depositAmount -
        fee;

      user.balance +=
        netAmount;

      user.revenue +=
        fee;

      await user.save();

      await Transaction.create({
        fromEmail:
          "External",

        toEmail:
          user.email,

        amount:
          depositAmount,

        fee,

        netAmount,

        type:
          "external_deposit",
      });

      await Log.create({
        action:
          `External deposit ${depositAmount}$`,

        email:
          user.email,
      });

      res.json({
        message:
          "Deposit completed",

        fee,

        netAmount,

        balance:
          user.balance,
      });

    } catch (err) {
      console.log(
        "DEPOSIT ERROR:",
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
// EXTERNAL WITHDRAW
// =========================

app.post(
  "/external-withdraw",
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

      const withdrawAmount =
        Number(amount);

      let fee =
        withdrawAmount *
        EXTERNAL_FEE;

      if (
        fee < MINIMUM_FEE
      ) {
        fee =
          MINIMUM_FEE;
      }

      const total =
        withdrawAmount +
        fee;

      if (
        user.balance <
        total
      ) {
        return res.status(400).json({
          message:
            "Insufficient balance",
        });
      }

      user.balance -=
        total;

      user.revenue +=
        fee;

      await user.save();

      await Transaction.create({
        fromEmail:
          user.email,

        toEmail:
          "External",

        amount:
          withdrawAmount,

        fee,

        netAmount:
          withdrawAmount,

        type:
          "external_withdraw",
      });

      await Log.create({
        action:
          `External withdraw ${withdrawAmount}$`,

        email:
          user.email,
      });

      res.json({
        message:
          "Withdraw completed",

        fee,

        total,

        balance:
          user.balance,
      });

    } catch (err) {
      console.log(
        "WITHDRAW ERROR:",
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
      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

// =========================
// LOGS
// =========================

app.get(
  "/logs",
  adminAuth,
  async (req, res) => {
    try {
      const logs =
        await Log.find().sort({
          createdAt: -1,
        });

      res.json(logs);

    } catch (err) {
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
  adminAuth,
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

      await Log.create({
        action:
          `Admin added ${amount}$ balance`,

        email:
          user.email,
      });

      res.json({
        message:
          "Balance added",

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
  adminAuth,
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

      await Log.create({
        action:
          user.frozen
            ? "User frozen"
            : "User unfrozen",

        email:
          user.email,
      });

      res.json({
        message:
          user.frozen
            ? "User frozen"
            : "User unfrozen",
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
// DELETE USER
// =========================

app.delete(
  "/delete-user/:id",
  adminAuth,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.params.id
        );

      if (user) {
        await Log.create({
          action:
            "User deleted",

          email:
            user.email,
        });
      }

      await User.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "User deleted",
      });

    } catch (err) {
      console.log(
        "DELETE ERROR:",
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

            $options:
              "i",
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
// ADMIN REVENUE
// =========================

app.get(
  "/admin-revenue",
  adminAuth,
  async (req, res) => {
    try {
      const transactions =
        await Transaction.find();

      let totalRevenue =
        0;

      transactions.forEach(
        (tx) => {
          totalRevenue +=
            tx.fee || 0;
        }
      );

      res.json({
        revenue:
          totalRevenue,

        transactions:
          transactions.length,
      });

    } catch (err) {
      console.log(
        "REVENUE ERROR:",
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
// CREATE DEPOSIT REQUEST
// =========================

app.post(
  "/create-deposit-request",
  auth,
  async (req, res) => {
    try {
      const {
        userId,
        email,
        amount,
        method,
      } = req.body;

      if (
  Number(amount) <
  MIN_TRANSFER
) {
  return res.status(400).json({
    message:
      `Minimum request is ${MIN_TRANSFER}$`,
  });
}

if (
  Number(amount) >
  MAX_REQUEST
) {
  return res.status(400).json({
    message:
      `Maximum request is ${MAX_REQUEST}$`,
  });
}
      const request =
        new Request({
          userId,
          email,
          amount,
          method,
          type: "deposit",
        });

      await request.save();

      await Log.create({
        action:
          `Deposit request ${amount}$ via ${method}`,

        email,
      });

      res.json({
        message:
          "Deposit request created",
      });

    } catch (err) {
      console.log(
        "DEPOSIT REQUEST ERROR:",
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
// CREATE WITHDRAW REQUEST
// =========================

app.post(
  "/create-withdraw-request",
  auth,
  async (req, res) => {
    try {
      const {
        userId,
        email,
        amount,
        method,
        wallet,
      } = req.body;

      if (
  Number(amount) <
  MIN_TRANSFER
) {
  return res.status(400).json({
    message:
      `Minimum request is ${MIN_TRANSFER}$`,
  });
}

if (
  Number(amount) >
  MAX_REQUEST
) {
  return res.status(400).json({
    message:
      `Maximum request is ${MAX_REQUEST}$`,
  });
}
      const request =
        new Request({
          userId,
          email,
          amount,
          method,
          wallet,
          type: "withdraw",
        });

      await request.save();

      await Log.create({
        action:
          `Withdraw request ${amount}$ via ${method}`,

        email,
      });

      res.json({
        message:
          "Withdraw request created",
      });

    } catch (err) {
      console.log(
        "WITHDRAW REQUEST ERROR:",
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
// GET ALL REQUESTS
// =========================

app.get(
  "/requests",
  adminAuth,
  async (req, res) => {
    try {
      const requests =
        await Request.find().sort({
          createdAt: -1,
        });

      res.json(requests);

    } catch (err) {
      console.log(
        "REQUESTS ERROR:",
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
// USER REQUESTS
// =========================

app.get(
  "/my-requests/:email",
  auth,
  async (req, res) => {
    try {
      const requests =
        await Request.find({
          email:
            req.params.email,
        }).sort({
          createdAt: -1,
        });

      res.json(requests);

    } catch (err) {
      console.log(
        "MY REQUESTS ERROR:",
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
// APPROVE REQUEST
// =========================

app.post(
  "/approve-request/:id",
  adminAuth,
  async (req, res) => {
    try {
      const request =
        await Request.findById(
          req.params.id
        );

      if (!request) {
        return res.status(404).json({
          message:
            "Request not found",
        });
      }

      if (
        request.status !==
        "pending"
      ) {
        return res.status(400).json({
          message:
            "Already processed",
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

      if (
        request.type ===
        "deposit"
      ) {
        let fee =
          request.amount *
          EXTERNAL_FEE;

        if (
          fee <
          MINIMUM_FEE
        ) {
          fee =
            MINIMUM_FEE;
        }

        const netAmount =
          request.amount -
          fee;

        user.balance +=
          netAmount;

        user.revenue +=
          fee;

        await Transaction.create({
          fromEmail:
            "External",

          toEmail:
            user.email,

          amount:
            request.amount,

          fee,

          netAmount,

          type:
            "deposit_request",
        });
      }

      if (
        request.type ===
        "withdraw"
      ) {
        let fee =
          request.amount *
          EXTERNAL_FEE;

        if (
          fee <
          MINIMUM_FEE
        ) {
          fee =
            MINIMUM_FEE;
        }

        const total =
          request.amount +
          fee;

        if (
          user.balance <
          total
        ) {
          return res.status(400).json({
            message:
              "Insufficient balance",
          });
        }

        user.balance -=
          total;

        user.revenue +=
          fee;

        await Transaction.create({
          fromEmail:
            user.email,

          toEmail:
            "External",

          amount:
            request.amount,

          fee,

          netAmount:
            request.amount,

          type:
            "withdraw_request",
        });
      }

      request.status =
        "approved";

      await request.save();

      await user.save();

      await Log.create({
        action:
          `Request approved ${request.amount}$`,

        email:
          user.email,
      });

      await Notification.create({
  email: user.email,

  message:
    `Your ${request.type} request has been approved`,
});
      res.json({
        message:
          "Request approved",
      });

    } catch (err) {
      console.log(
        "APPROVE ERROR:",
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
// REJECT REQUEST
// =========================

app.post(
  "/reject-request/:id",
  adminAuth,
  async (req, res) => {
    try {
      const request =
        await Request.findById(
          req.params.id
        );

      if (!request) {
        return res.status(404).json({
          message:
            "Request not found",
        });
      }

      request.status =
        "rejected";

      await request.save();

      await Log.create({
        action:
          `Request rejected ${request.amount}$`,

        email:
          request.email,
      });

      await Notification.create({
  email: request.email,

  message:
    `Your ${request.type} request has been rejected`,
});
      res.json({
        message:
          "Request rejected",
      });

    } catch (err) {
      console.log(
        "REJECT ERROR:",
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
// GET NOTIFICATIONS
// =========================

app.get(
  "/notifications/:email",
  auth,
  async (req, res) => {
    try {
      const notifications =
        await Notification.find({
          email:
            req.params.email,
        }).sort({
          createdAt: -1,
        });

      res.json(
        notifications
      );

    } catch (err) {
      console.log(
        "NOTIFICATIONS ERROR:",
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
// ANALYTICS
// =========================

app.get(
  "/analytics/:email",
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
        });

      const requests =
        await Request.find({
          email,
        });

      const notifications =
        await Notification.find({
          email,
        });

      let totalSent =
        0;

      let totalReceived =
        0;

      let totalFees =
        0;

      let deposits =
        0;

      let withdraws =
        0;

      transactions.forEach(
        (tx) => {
          totalFees +=
            tx.fee || 0;

          if (
            tx.fromEmail ===
            email
          ) {
            totalSent +=
              tx.amount;
          }

          if (
            tx.toEmail ===
            email
          ) {
            totalReceived +=
              tx.amount;
          }

          if (
            tx.type?.includes(
              "deposit"
            )
          ) {
            deposits++;
          }

          if (
            tx.type?.includes(
              "withdraw"
            )
          ) {
            withdraws++;
          }
        }
      );

      res.json({
        totalTransactions:
          transactions.length,

        totalRequests:
          requests.length,

        totalNotifications:
          notifications.length,

        totalSent,

        totalReceived,

        totalFees,

        deposits,

        withdraws,
      });

    } catch (err) {
      console.log(
        "ANALYTICS ERROR:",
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
// UPDATE CURRENCY
// =========================

app.post(
  "/update-currency",
  auth,
  async (req, res) => {
    try {
      const {
        userId,
        currency,
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

      user.currency =
        currency;

      await user.save();

      res.json({
        message:
          "Currency updated",
      });

    } catch (err) {
      console.log(
        "CURRENCY ERROR:",
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
// CHANGE PASSWORD
// =========================

app.post(
  "/change-password",
  auth,
  async (req, res) => {
    try {
      const {
        userId,
        oldPassword,
        newPassword,
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

      const isMatch =
        await bcrypt.compare(
          oldPassword,
          user.password
        );

      if (!isMatch) {
        return res.status(400).json({
          message:
            "Wrong old password",
        });
      }

      if (
        newPassword.length <
        6
      ) {
        return res.status(400).json({
          message:
            "Password too short",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );

      user.password =
        hashedPassword;

      await user.save();

      await Log.create({
        action:
          "Password changed",

        email:
          user.email,
      });

      await Notification.create({
        email:
          user.email,

        message:
          "Your password has been changed successfully",
      });

      res.json({
        message:
          "Password updated",
      });

    } catch (err) {
      console.log(
        "PASSWORD ERROR:",
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
// CREATE SUPPORT TICKET
// =========================

app.post(
  "/create-support",
  auth,
  async (req, res) => {
    try {
      const {
        email,
        subject,
        message,
      } = req.body;

      const support =
        new Support({
          email,
          subject,
          message,
        });

      await support.save();

      await Notification.create({
        email,

        message:
          "Your support ticket has been submitted",
      });

      res.json({
        message:
          "Support ticket created",
      });

    } catch (err) {
      console.log(
        "SUPPORT ERROR:",
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
// GET SUPPORT TICKETS
// =========================

app.get(
  "/support-tickets",
  adminAuth,
  async (req, res) => {
    try {
      const tickets =
        await Support.find().sort({
          createdAt: -1,
        });

      res.json(tickets);

    } catch (err) {
      console.log(
        "SUPPORT TICKETS ERROR:",
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
// USER PROFILE
// =========================

app.get(
  "/profile/:email",
  auth,
  async (req, res) => {
    try {
      const email =
        req.params.email;

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
        });

      res.json({
        email:
          user.email,

        balance:
          user.balance,

        revenue:
          user.revenue,

        role:
          user.role,

        frozen:
          user.frozen,

        currency:
          user.currency,

        totalTransactions:
          transactions.length,

        createdAt:
          user._id.getTimestamp(),
      });

    } catch (err) {
      console.log(
        "PROFILE ERROR:",
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