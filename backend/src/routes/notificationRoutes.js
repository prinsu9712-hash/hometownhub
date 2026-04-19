const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead
} = require("../controllers/notificationController");

/* ==============================
   GET MY NOTIFICATIONS
============================== */

router.get("/", protect, getMyNotifications);

/* ==============================
   MARK AS READ
============================== */

router.patch("/:id/read", protect, markAsRead);
router.patch("/read-all", protect, markAllAsRead);

module.exports = router;
