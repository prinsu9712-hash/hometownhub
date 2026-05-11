const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  acceptFriendRequest,
  getFriendHub,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest
} = require("../controllers/friendController");

router.get("/", protect, getFriendHub);
router.post("/request/:userId", protect, sendFriendRequest);
router.post("/requests/:requestId/accept", protect, acceptFriendRequest);
router.post("/requests/:requestId/reject", protect, rejectFriendRequest);
router.delete("/:userId", protect, removeFriend);

module.exports = router;
