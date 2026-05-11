const mongoose = require("mongoose");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const User = require("../models/User");

const PUBLIC_USER_FIELDS = "name email hometown role profilePhoto";

const sameId = (a, b) => String(a) === String(b);

const emitToUser = (userId, eventName, payload) => {
  if (global.io && userId) {
    global.io.to(String(userId)).emit(eventName, payload);
  }
};

const getOtherParticipant = (message, currentUserId) =>
  sameId(message.sender, currentUserId) ? message.recipient : message.sender;

const ensureFriend = async (currentUserId, friendId) => {
  if (!mongoose.Types.ObjectId.isValid(friendId) || sameId(currentUserId, friendId)) {
    return null;
  }

  const currentUser = await User.findById(currentUserId).select("friends name");
  if (!currentUser) return null;

  const isFriend = (currentUser.friends || []).some((id) => sameId(id, friendId));
  if (!isFriend) return null;

  return User.findById(friendId).select(PUBLIC_USER_FIELDS);
};

exports.getThreads = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id)
      .select("friends")
      .populate("friends", PUBLIC_USER_FIELDS);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const messages = await Message.find({ participants: req.user._id })
      .sort({ createdAt: -1 })
      .limit(300);

    const latestByFriend = new Map();
    for (const message of messages) {
      const otherId = String(getOtherParticipant(message, req.user._id));
      if (!latestByFriend.has(otherId)) {
        latestByFriend.set(otherId, message);
      }
    }

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          recipient: req.user._id,
          readAt: null
        }
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 }
        }
      }
    ]);
    const unreadByFriend = new Map(
      unreadCounts.map((item) => [String(item._id), item.count])
    );

    const threads = (currentUser.friends || []).map((friend) => {
      const friendId = String(friend._id);
      return {
        friend,
        lastMessage: latestByFriend.get(friendId) || null,
        unreadCount: unreadByFriend.get(friendId) || 0
      };
    });

    threads.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    res.json({ threads, friendIds });
  } catch (error) {
    res.status(500).json({ message: "Failed to load message threads", error: error.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const friend = await ensureFriend(req.user._id, req.params.friendId);
    if (!friend) {
      return res.status(403).json({ message: "You can only message accepted friends" });
    }

    const messages = await Message.find({
      participants: { $all: [req.user._id, friend._id] }
    })
      .sort({ createdAt: 1 })
      .limit(250)
      .populate("sender", PUBLIC_USER_FIELDS)
      .populate("recipient", PUBLIC_USER_FIELDS);

    await Message.updateMany(
      {
        sender: friend._id,
        recipient: req.user._id,
        readAt: null
      },
      { $set: { readAt: new Date() } }
    );

    res.json({ friend, messages });
  } catch (error) {
    res.status(500).json({ message: "Failed to load conversation", error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const friend = await ensureFriend(req.user._id, req.params.friendId);
    if (!friend) {
      return res.status(403).json({ message: "You can only message accepted friends" });
    }

    const text = String(req.body.text || "").trim();
    if (!text) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const message = await Message.create({
      participants: [req.user._id, friend._id],
      sender: req.user._id,
      recipient: friend._id,
      text
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", PUBLIC_USER_FIELDS)
      .populate("recipient", PUBLIC_USER_FIELDS);

    const notification = await Notification.create({
      user: friend._id,
      message: `${req.user.name || "A friend"} sent you a message.`,
      type: "SYSTEM"
    });

    emitToUser(friend._id, "messages:new", { message: populatedMessage });
    emitToUser(req.user._id, "messages:new", { message: populatedMessage });
    emitToUser(friend._id, "notifications:new", { notification });

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
};
