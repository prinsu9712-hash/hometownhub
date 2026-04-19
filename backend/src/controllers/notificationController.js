const Notification = require("../models/Notification");

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

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

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      message: "All notifications marked as read"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update notifications",
      error: error.message
    });
  }
};
