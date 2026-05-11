const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getConversation,
  getThreads,
  sendMessage
} = require("../controllers/messageController");

router.get("/threads", protect, getThreads);
router.get("/:friendId", protect, getConversation);
router.post("/:friendId", protect, sendMessage);

module.exports = router;
