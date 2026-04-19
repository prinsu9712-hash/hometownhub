const Post = require("../models/Post");
const Community = require("../models/Community");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

const canModeratePost = (user, postAuthorId) =>
  user?.role === "ADMIN" || user?.role === "MODERATOR" || postAuthorId.toString() === user._id.toString();

const parseBoolean = (value) =>
  value === true ||
  value === "true" ||
  value === 1 ||
  value === "1";

exports.createPost = async (req, res) => {
  try {
    const { community, content, isAnnouncement, category, tags } = req.body;

    if (!community || !content?.trim()) {
      return res.status(400).json({ message: "Community and content are required" });
    }

    const communityData = await Community.findById(community);
    if (!communityData || communityData.isDeleted || communityData.status !== "APPROVED") {
      return res.status(404).json({ message: "Community not found" });
    }

    const post = await Post.create({
      community,
      author: req.user._id,
      content: content.trim(),
      isAnnouncement: parseBoolean(isAnnouncement),
      category: typeof category === "string" ? category.trim() : "",
      tags: Array.isArray(tags)
        ? tags.map((tag) => String(tag).trim()).filter(Boolean)
        : typeof tags === "string"
          ? tags.split(",").map((tag) => tag.trim()).filter(Boolean)
          : [],
      image: req.file ? req.file.filename : null
    });

    for (const memberId of communityData.members) {
      if (memberId.toString() !== req.user._id.toString()) {
        await Notification.create({
          user: memberId,
          message: post.isAnnouncement
            ? `New announcement in ${communityData.name}`
            : `New post in ${communityData.name}`,
          type: "COMMUNITY"
        });
      }
    }

    const created = await Post.findById(post._id)
      .populate("author", "name hometown role")
      .populate("comments.user", "name");

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: "Failed to create post", error: error.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { search, announcementOnly } = req.query;

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return res.json([]);
    }

    const filter = {
      community: communityId,
      isDeleted: false
    };

    if (search) {
      filter.content = { $regex: search, $options: "i" };
    }

    if (announcementOnly === "true") {
      filter.isAnnouncement = true;
    }

    const posts = await Post.find(filter)
      .populate("author", "name hometown role")
      .populate("comments.user", "name")
      .sort({ isPinned: -1, createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts", error: error.message });
  }
};

exports.getHighlightedPosts = async (req, res) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isNaN(requestedLimit)
      ? 3
      : Math.min(Math.max(requestedLimit, 1), 12);

    const filter = {
      isDeleted: false
    };

    if (req.query.communityId) {
      filter.community = req.query.communityId;
    }

    const posts = await Post.find(filter)
      .populate("author", "name hometown role")
      .populate("community", "name city")
      .populate("comments.user", "name")
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch highlighted posts", error: error.message });
  }
};

exports.sharePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: "Post not found" });
    }
    post.shares += 1;
    await post.save();
    res.json({ message: "Post share count updated", shares: post.shares });
  } catch (error) {
    res.status(500).json({ message: "Failed to share post", error: error.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.isDeleted) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likesCount: post.likes.length
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to like post", error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!canModeratePost(req.user, post.author)) {
      return res.status(403).json({ message: "Access denied" });
    }

    post.isDeleted = true;
    await post.save();
    res.json({ message: "Post removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove post", error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const canDelete =
      req.user.role === "ADMIN" ||
      req.user.role === "MODERATOR" ||
      comment.user.toString() === req.user._id.toString() ||
      post.author.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({ message: "Access denied" });
    }

    comment.deleteOne();
    await post.save();
    res.json({ message: "Comment removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove comment", error: error.message });
  }
};

exports.pinPost = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN" && req.user.role !== "MODERATOR") {
      return res.status(403).json({ message: "Access denied" });
    }

    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.isPinned = !post.isPinned;
    await post.save();
    res.json({ message: post.isPinned ? "Post pinned" : "Post unpinned", isPinned: post.isPinned });
  } catch (error) {
    res.status(500).json({ message: "Failed to update pin state", error: error.message });
  }
};

exports.commentPost = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      user: req.user._id,
      text: text.trim()
    });
    await post.save();

    const updated = await Post.findById(post._id)
      .populate("author", "name hometown role")
      .populate("comments.user", "name");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to comment on post", error: error.message });
  }
};
