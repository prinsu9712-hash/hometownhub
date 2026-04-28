const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* ===============================
   PROTECT MIDDLEWARE
================================ */

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    const isExpiredToken = error?.name === "TokenExpiredError";

    return res.status(401).json({
      message: isExpiredToken ? "Session expired. Please log in again." : "Invalid token"
    });
  }
};

/* ===============================
   AUTHORIZE MIDDLEWARE
================================ */

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};
