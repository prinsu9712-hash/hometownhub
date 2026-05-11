const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false },
  hometown: String,
  profilePhoto: {
    type: String,
    default: ""
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  role: {
    type: String,
    enum: ["USER", "MODERATOR", "ADMIN"],
    default: "USER"
  },
  isBlocked: { type: Boolean, default: false },
  lastLoginAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
