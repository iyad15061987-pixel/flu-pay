const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

console.log("🚀 NEW VERSION WORKING");

// 🔥 Mongo Atlas فقط (بدون localhost)
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(process.env.PORT || 5000, () => {
      console.log("🚀 Server running");
    });
  })
  .catch(err => console.log("❌ Mongo Error:", err));

// Test
app.get("/", (req, res) => {
  res.send("NEW DEPLOY WORKING ✅");
});