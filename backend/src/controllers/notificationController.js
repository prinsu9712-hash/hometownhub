const Notification = require("../models/Notification");

/* =================================
   GET MY NOTIFICATIONS
================================= */

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id
    })
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message
    });
  }
};

/* =================================
   MARK NOTIFICATION AS READ
================================= */

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    // Security check → user can only update their own notifications
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      message: "Notification marked as read"
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update notification",
      error: error.message
    });
  }
};