const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

console.log("🚀 NEW VERSION WORKING");

// Mongo
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(process.env.PORT || 5000, () => {
      console.log("🚀 Server running");
    });
  })
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("NEW DEPLOY WORKING ✅");
});