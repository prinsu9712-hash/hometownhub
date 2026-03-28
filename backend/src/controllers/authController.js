const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, hometown } = req.body;
    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedName = (name || "").trim();
    const normalizedHometown = (hometown || "").trim();

    if (!normalizedName || !normalizedEmail || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      hometown: normalizedHometown
    });

    res.status(201).json({
      message: "User Registered",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isBlocked) return res.status(403).json({ message: "User is blocked" });

    // Support legacy plaintext passwords and auto-upgrade them to bcrypt.
    let match = false;
    if (typeof user.password === "string" && user.password.startsWith("$2")) {
      match = await bcrypt.compare(password, user.password);
    } else {
      match = user.password === password;
      if (match) {
        user.password = await bcrypt.hash(password, 12);
        await user.save();
      }
    }

    if (!match) return res.status(400).json({ message: "Invalid password" });

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};
