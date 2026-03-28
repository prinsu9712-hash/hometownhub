const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createPost,
  getPosts,
  getHighlightedPosts,
  likePost,
  commentPost,
  sharePost,
  deletePost,
  deleteComment,
  pinPost
} = require("../controllers/postController");

router.post("/", protect, createPost);
router.get("/highlights", getHighlightedPosts);
router.get("/:communityId", getPosts);
router.post("/:id/like", protect, likePost);
router.post("/:id/comment", protect, commentPost);
router.post("/:id/share", protect, sharePost);
router.put("/:id/pin", protect, pinPost);
router.delete("/:id", protect, deletePost);
router.delete("/:id/comment/:commentId", protect, deleteComment);

module.exports = router;
