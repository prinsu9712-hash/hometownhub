const User = require("../models/User");
const Community = require("../models/Community");
const Event = require("../models/Event");
const Notification = require("../models/Notification");
const Post = require("../models/Post");
const Report = require("../models/Report");

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalUsers = await User.countDocuments();
    const totalCommunities = await Community.countDocuments({ isDeleted: false });
    const totalEvents = await Event.countDocuments({ isDeleted: false });
    const totalPosts = await Post.countDocuments({ isDeleted: false });
    const totalNotifications = await Notification.countDocuments();
    const openReports = await Report.countDocuments({ status: "OPEN" });
    const dailyActiveUsers = await User.countDocuments({ lastLoginAt: { $gte: last24Hours } });
    const newUsers7d = await User.countDocuments({ createdAt: { $gte: last7Days } });

    const events = await Event.find({ isDeleted: false }, { attendees: 1 });
    const totalParticipants = events.reduce((sum, event) => sum + (event.attendees?.length || 0), 0);

    res.json({
      totalUsers,
      totalCommunities,
      totalEvents,
      totalPosts,
      totalNotifications,
      totalParticipants,
      dailyActiveUsers,
      newUsers7d,
      openReports
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "name email role isBlocked hometown createdAt lastLoginAt")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["USER", "MODERATOR", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({ message: "User role updated", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      message: user.isBlocked ? "User blocked" : "User unblocked",
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
