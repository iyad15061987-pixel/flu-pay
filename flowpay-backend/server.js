const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

console.log("🚀 SERVER STARTING...");

// 🔥 مهم جدًا: لا يوجد localhost نهائيًا
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.log("❌ ERROR: MONGO_URI NOT FOUND");
  process.exit(1);
}

console.log("🔗 Using Mongo URI:", MONGO_URI.substring(0, 30) + "...");

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(process.env.PORT || 5000, () => {
      console.log("🚀 Server running");
    });
  })
  .catch((err) => {
    console.log("❌ Mongo Error:", err);
  });

app.get("/", (req, res) => {
  res.send("DEPLOY WORKING ✅");
});