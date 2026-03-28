const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");

const {
  createCommunity,
  getAllCommunities,
  joinCommunity,
  leaveCommunity,
  getPendingRequests,
  approveRequest,
  rejectRequest,
  updateCommunityPolicy,
  softDeleteCommunity
} = require("../controllers/communityController");

router.post("/", protect, authorize("ADMIN"), createCommunity);
router.get("/", getAllCommunities);
router.post("/:id/join", protect, joinCommunity);
router.post("/:id/leave", protect, leaveCommunity);
router.get("/:id/requests", protect, getPendingRequests);
router.post("/:id/requests/:userId/approve", protect, approveRequest);
router.post("/:id/requests/:userId/reject", protect, rejectRequest);
router.put("/:id/policy", protect, updateCommunityPolicy);
router.delete("/:id", protect, authorize("ADMIN"), softDeleteCommunity);

module.exports = router;
