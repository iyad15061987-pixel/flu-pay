const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

// ===== CONNECT =====
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// ===== MODEL =====
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  balance: { type: Number, default: 0 }
});

const User = mongoose.model("User", UserSchema);

// ===== TEST =====
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ===== REGISTER =====
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

// ===== LOGIN =====
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.password !== password)
    return res.status(400).json({ message: "Wrong password" });

  res.json({ userId: user._id });
});

// ===== START =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));