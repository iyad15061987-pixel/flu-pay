```js
require("dotenv").config();

require(
  "./utils/cronJobs"
);

// =========================
// CORE
// =========================

const express =
  require("express");

const cors =
  require("cors");

const helmet =
  require("helmet");

const compression =
  require("compression");

const rateLimit =
  require(
    "express-rate-limit"
  );

const http =
  require("http");

const mongoose =
  require("mongoose");

const {
  Server,
} = require(
  "socket.io"
);

// =========================
// MIDDLEWARE
// =========================

const requestLogger =
  require(
    "./middleware/requestLogger"
  );

const errorHandler =
  require(
    "./middleware/errorHandler"
  );

// =========================
// UTILS
// =========================

const updateRates =
  require(
    "./utils/exchange"
  );

// =========================
// ROUTES
// =========================

const authRoutes =
  require(
    "./routes/authRoutes"
  );

const transferRoutes =
  require(
    "./routes/transferRoutes"
  );

const transactionRoutes =
  require(
    "./routes/transactionRoutes"
  );

const adminRoutes =
  require(
    "./routes/adminRoutes"
  );

const analyticsRoutes =
  require(
    "./routes/analyticsRoutes"
  );

const profileRoutes =
  require(
    "./routes/profileRoutes"
  );

const freezeRoutes =
  require(
    "./routes/freezeRoutes"
  );

const securityRoutes =
  require(
    "./routes/securityRoutes"
  );

const kycRoutes =
  require(
    "./routes/kycRoutes"
  );

const kycAdminRoutes =
  require(
    "./routes/kycAdminRoutes"
  );

const ledgerRoutes =
  require(
    "./routes/ledgerRoutes"
  );

const currencyRoutes =
  require(
    "./routes/currencyRoutes"
  );

const cryptoRoutes =
  require(
    "./routes/cryptoRoutes"
  );

const cryptoWebhookRoutes =
  require(
    "./routes/cryptoWebhookRoutes"
  );

const cryptoWithdrawRoutes =
  require(
    "./routes/cryptoWithdrawRoutes"
  );

const fraudRoutes =
  require(
    "./routes/fraudRoutes"
  );

const pushRoutes =
  require(
    "./routes/pushRoutes"
  );

const bankRoutes =
  require(
    "./routes/bankRoutes"
  );

const adminWithdrawRoutes =
  require(
    "./routes/adminWithdrawRoutes"
  );

const treasuryRoutes =
  require(
    "./routes/treasuryRoutes"
  );

const complianceRoutes =
  require(
    "./routes/complianceRoutes"
  );

const corporateRoutes =
  require(
    "./routes/corporateRoutes"
  );

const activityRoutes =
  require(
    "./routes/activityRoutes"
  );

const roleRoutes =
  require(
    "./routes/roleRoutes"
  );

const riskRoutes =
  require(
    "./routes/riskRoutes"
  );

const healthRoutes =
  require(
    "./routes/healthRoutes"
  );

const cardRoutes =
  require(
    "./routes/cardRoutes"
  );

const accountingRoutes =
  require(
    "./routes/accountingRoutes"
  );

const kycUploadRoutes =
  require(
    "./routes/kycUploadRoutes"
  );

const cardTransactionRoutes =
  require(
    "./routes/cardTransactionRoutes"
  );

const amlRoutes =
  require(
    "./routes/amlRoutes"
  );

const adminLiveRoutes =
  require(
    "./routes/adminLiveRoutes"
  );

const verifyRoutes =
  require(
    "./routes/verifyRoutes"
  );

const passwordResetRoutes =
  require(
    "./routes/passwordResetRoutes"
  );

const webhookRoutes =
  require(
    "./routes/webhookRoutes"
  );

const apiKeyRoutes =
  require(
    "./routes/apiKeyRoutes"
  );

const merchantRoutes =
  require(
    "./routes/merchantRoutes"
  );

const merchantAnalyticsRoutes =
  require(
    "./routes/merchantAnalyticsRoutes"
  );

const withdrawalRoutes =
  require(
    "./routes/withdrawalRoutes"
  );

const adminWithdrawalRoutes =
  require(
    "./routes/adminWithdrawalRoutes"
  );

const twoFactorRoutes =
  require(
    "./routes/twoFactorRoutes"
  );

const notificationRoutes =
  require(
    "./routes/notificationRoutes"
  );

// =========================
// APP
// =========================

const app =
  express();

// =========================
// TRUST PROXY
// =========================

app.set(
  "trust proxy",
  1
);

// =========================
// HTTP SERVER
// =========================

const server =
  http.createServer(
    app
  );

// =========================
// SOCKET.IO
// =========================

const io =
  new Server(server, {
    cors: {
      origin: "*",

      methods: [
        "GET",
        "POST",
      ],

      credentials:
        true,
    },

    transports: [
      "websocket",
      "polling",
    ],
  });

// =========================
// GLOBAL SOCKET ACCESS
// =========================

global.io = io;

// =========================
// SOCKET CONNECTIONS
// =========================

io.on(
  "connection",

  (socket) => {

    console.log(
      `🔌 Socket connected: ${socket.id}`
    );

    socket.emit(
      "connected",
      {
        success: true,

        socketId:
          socket.id,

        message:
          "Realtime connection established",
      }
    );

    socket.on(
      "join_admin",

      () => {

        socket.join(
          "admins"
        );

      }
    );

    socket.on(
      "join_user",

      (userId) => {

        if (!userId) {
          return;
        }

        socket.join(
          userId
        );

      }
    );

    socket.on(
      "ping_server",

      () => {

        socket.emit(
          "pong_server",
          {
            status:
              "alive",

            timestamp:
              new Date(),
          }
        );

      }
    );

    socket.on(
      "disconnect",

      () => {

        console.log(
          `❌ Socket disconnected: ${socket.id}`
        );

      }
    );

  }
);

// =========================
// SECURITY
// =========================

app.use(
  helmet()
);

app.use(
  helmet.crossOriginResourcePolicy({
    policy:
      "cross-origin",
  })
);

app.use(
  compression()
);

// =========================
// RATE LIMIT
// =========================

const limiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max: 300,

    message:
      "Too many requests",
  });

app.use(
  limiter
);

// =========================
// CORS
// =========================

app.use(
  cors({
    origin: "*",

    credentials:
      true,
  })
);

// =========================
// BODY PARSER
// =========================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// =========================
// REQUEST LOGGER
// =========================

app.use(
  requestLogger
);

// =========================
// STATIC FILES
// =========================

app.use(
  "/uploads",
  express.static(
    "uploads"
  )
);

// =========================
// DATABASE
// =========================

mongoose
  .connect(
    process.env
      .MONGO_URI,

    {
      serverSelectionTimeoutMS:
        30000,

      socketTimeoutMS:
        45000,
    }
  )

  .then(() => {

    console.log(
      "✅ MongoDB Connected"
    );

    updateRates();

    setInterval(
      updateRates,

      1000 *
        60 *
        60
    );
  })

  .catch((err) => {

    console.log(err);

    process.exit(1);
  });

// =========================
// ROUTES
// =========================

app.use("/api", authRoutes);
app.use("/api", transferRoutes);
app.use("/api", notificationRoutes);
app.use("/api", transactionRoutes);
app.use("/api", adminRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", profileRoutes);
app.use("/api", freezeRoutes);
app.use("/api", securityRoutes);
app.use("/api", kycRoutes);
app.use("/api", kycAdminRoutes);
app.use("/api", ledgerRoutes);
app.use("/api", currencyRoutes);
app.use("/api", cryptoRoutes);
app.use("/api", cryptoWebhookRoutes);
app.use("/api", cryptoWithdrawRoutes);
app.use("/api", fraudRoutes);
app.use("/api", pushRoutes);
app.use("/api", bankRoutes);
app.use("/api", adminWithdrawRoutes);
app.use("/api", treasuryRoutes);
app.use("/api", complianceRoutes);
app.use("/api", corporateRoutes);
app.use("/api", activityRoutes);
app.use("/api", roleRoutes);
app.use("/api", riskRoutes);
app.use("/api", healthRoutes);
app.use("/api", cardRoutes);
app.use("/api", accountingRoutes);
app.use("/api", kycUploadRoutes);
app.use("/api", cardTransactionRoutes);
app.use("/api", amlRoutes);
app.use("/api", adminLiveRoutes);
app.use("/api", verifyRoutes);
app.use("/api", passwordResetRoutes);
app.use("/api", webhookRoutes);
app.use("/api", apiKeyRoutes);
app.use("/api", merchantRoutes);
app.use("/api", merchantAnalyticsRoutes);
app.use("/api", withdrawalRoutes);
app.use("/api", adminWithdrawalRoutes);
app.use("/api", twoFactorRoutes);
app.use("/api", notificationRoutes);

// =========================
// ROOT
// =========================

app.get(
  "/",

  (req, res) => {

    res.send(
      "🚀 FlowPay API Running"
    );

  }
);

// =========================
// HEALTH
// =========================

app.get(
  "/health",

  (req, res) => {

    res.json({
      status:
        "OK",

      database:
        mongoose
          .connection
          .readyState ===
        1
          ? "Connected"
          : "Disconnected",

      uptime:
        process.uptime(),

      sockets:
        io.engine
          .clientsCount,
    });

  }
);

// =========================
// ERROR HANDLER
// =========================

app.use(
  errorHandler
);

// =========================
// SERVER
// =========================

console.log(
  "🔥 NEW SERVER FILE LOADED"
);

const PORT = 8080;

server.listen(
  PORT,
  "0.0.0.0",

  () => {

    console.log(
      `🚀 Server running on port ${PORT}`
    );

    console.log(
      `⚡ Realtime server enabled`
    );

  }
);
```
