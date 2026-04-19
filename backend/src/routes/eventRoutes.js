const express = require("express");
const router = express.Router();
const { getAllEventsAdmin } = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  createEvent,
  getPublicEvents,
  getEvents,
  joinEvent,
  leaveEvent,
  deleteEvent,
  restoreEvent
} = require("../controllers/eventController");

router.get("/public", getPublicEvents);

// Any authenticated user can create an event
router.post("/", protect, createEvent);

// Get events by community
router.get("/community/:communityId", protect, getEvents);

// Join event
router.post("/:id/join", protect, joinEvent);

// Leave event
router.post("/:id/leave", protect, leaveEvent);

// 🔥 Soft delete (ADMIN only)
router.put("/:id/delete", protect, authorize("ADMIN"), deleteEvent);

// 🔥 Restore (ADMIN only)
router.put("/:id/restore", protect, authorize("ADMIN"), restoreEvent);
router.get("/admin/all", protect, authorize("ADMIN"), getAllEventsAdmin);
module.exports = router;
