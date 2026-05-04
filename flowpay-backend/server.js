const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/flowpay";

console.log("⏳ Connecting to MongoDB...");

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log("🚀 Server running on port " + PORT);
    });
  })
  .catch((err) => console.log("❌ Mongo Error:", err));

// Test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});