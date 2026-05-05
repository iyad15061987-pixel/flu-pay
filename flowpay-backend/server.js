const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ===== MIDDLEWARE =====
app.use(cors({
  origin: "*"
}));
app.use(express.json());

// ===== ENV =====
const MONGO_URI = process.env.MONGO_URI;

// ===== CONNECT =====
console.log("⏳ Connecting to MongoDB...");

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Mongo Error:", err));

// ===== MODEL =====
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 0
  }
});

const User = mongoose.model("User", UserSchema);

// ===== ROOT =====
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ===== TEST (مهم جدًا للتشخيص) =====
app.get("/test", (req, res) => {
  console.log("🔥 TEST HIT");
  res.send("TEST OK");
});

// ===== REGISTER =====
app.post("/register", async (req, res) => {
  try {
    console.log("🔥 BODY RECEIVED:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      console.log("❌ Missing data");
      return res.status(400).json({ message: "Missing email or password" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("❌ User already exists");
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      email,
      password,
    });

    await user.save();

    console.log("✅ User saved");

    res.json({ message: "User created" });

  } catch (err) {
    console.log("❌ REGISTER ERROR FULL:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== LOGIN =====
app.post("/login", async (req, res) => {
  try {
    console.log("🔥 LOGIN BODY:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Wrong password" });
    }

    res.json({ userId: user._id });

  } catch (err) {
    console.log("❌ LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== START =====
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});