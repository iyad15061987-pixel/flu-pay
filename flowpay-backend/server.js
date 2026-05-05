const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// 🔥 حل CORS نهائي
app.use(cors({
  origin: "*"
}));

app.use(express.json());

console.log("🚀 SERVER STARTING...");

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(process.env.PORT || 5000, () => {
      console.log("🚀 Server running");
    });
  })
  .catch(err => console.log(err));

// ================= USER MODEL =================
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  balance: { type: Number, default: 0 }
});

const User = mongoose.model("User", UserSchema);

// ================= REGISTER =================
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = new User({ email, password });
    await user.save();

    res.json({ message: "User created" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.password !== password)
    return res.status(400).json({ message: "Wrong password" });

  res.json({ userId: user._id });
});

// ================= BALANCE =================
app.get("/balance/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json({ balance: user.balance });
});

// ================= ADD =================
app.post("/add-balance", async (req, res) => {
  const { userId, amount } = req.body;

  const user = await User.findById(userId);
  user.balance += amount;
  await user.save();

  res.json({ balance: user.balance });
});

// ================= TEST =================
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});