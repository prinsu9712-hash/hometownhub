const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  getMyNotifications,
  markAsRead
} = require("../controllers/notificationController");

/* ==============================
   GET MY NOTIFICATIONS
============================== */

router.get("/", protect, getMyNotifications);

/* ==============================
   MARK AS READ
============================== */

router.patch("/:id/read", protect, markAsRead);

module.exports = router;