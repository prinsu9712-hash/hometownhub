const mongoose = require("mongoose");
const FriendRequest = require("../models/FriendRequest");
const Notification = require("../models/Notification");
const User = require("../models/User");

const PUBLIC_USER_FIELDS = "name email hometown role profilePhoto";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const sameId = (a, b) => String(a) === String(b);

const emitToUser = (userId, eventName, payload) => {
  if (global.io && userId) {
    global.io.to(String(userId)).emit(eventName, payload);
  }
};

const createNotification = async (userId, message, type = "SYSTEM") => {
  if (!userId || !message) return;

  try {
    await Notification.create({ user: userId, message, type });
    emitToUser(userId, "notifications:new", { message, type });
  } catch (error) {
    // Notifications should not block friendship workflows.
  }
};

const pairFilter = (firstUserId, secondUserId) => ({
  $or: [
    { requester: firstUserId, recipient: secondUserId },
    { requester: secondUserId, recipient: firstUserId }
  ]
});

exports.getFriendHub = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id)
      .select("friends")
      .populate("friends", PUBLIC_USER_FIELDS);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const [incomingRequests, outgoingRequests] = await Promise.all([
      FriendRequest.find({ recipient: req.user._id, status: "PENDING" })
        .populate("requester", PUBLIC_USER_FIELDS)
        .sort({ createdAt: -1 }),
      FriendRequest.find({ requester: req.user._id, status: "PENDING" })
        .populate("recipient", PUBLIC_USER_FIELDS)
        .sort({ createdAt: -1 })
    ]);

    const search = String(req.query.search || "").trim();
    const userFilter = {
      _id: { $ne: req.user._id },
      isBlocked: false
    };

    if (search) {
      userFilter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { hometown: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(userFilter)
      .select(PUBLIC_USER_FIELDS)
      .sort({ name: 1 })
      .limit(60);

    const friendIds = new Set((currentUser.friends || []).map((friend) => String(friend._id)));
    const incomingByUser = new Map(
      incomingRequests
        .filter((request) => request.requester)
        .map((request) => [String(request.requester._id), request._id])
    );
    const outgoingByUser = new Map(
      outgoingRequests
        .filter((request) => request.recipient)
        .map((request) => [String(request.recipient._id), request._id])
    );

    const people = users.map((person) => {
      const personId = String(person._id);
      let relationship = "none";
      let requestId = null;

      if (friendIds.has(personId)) {
        relationship = "friend";
      } else if (incomingByUser.has(personId)) {
        relationship = "incoming";
        requestId = incomingByUser.get(personId);
      } else if (outgoingByUser.has(personId)) {
        relationship = "outgoing";
        requestId = outgoingByUser.get(personId);
      }

      return {
        ...person.toObject(),
        relationship,
        requestId
      };
    });

    res.json({
      friends: currentUser.friends || [],
      incomingRequests,
      outgoingRequests,
      people
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load friends", error: error.message });
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    const targetUserId = req.params.userId;

    if (!isValidObjectId(targetUserId) || sameId(targetUserId, req.user._id)) {
      return res.status(400).json({ message: "Invalid friend request target" });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.user._id).select("name friends"),
      User.findById(targetUserId).select("name friends isBlocked")
    ]);

    if (!currentUser || !targetUser || targetUser.isBlocked) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyFriends = (currentUser.friends || []).some((friendId) =>
      sameId(friendId, targetUserId)
    );

    if (alreadyFriends) {
      return res.status(400).json({ message: "You are already friends" });
    }

    const existingRequest = await FriendRequest.findOne({
      ...pairFilter(req.user._id, targetUserId),
      status: { $in: ["PENDING", "ACCEPTED"] }
    });

    if (existingRequest) {
      const message =
        existingRequest.status === "ACCEPTED"
          ? "You are already friends"
          : sameId(existingRequest.requester, req.user._id)
            ? "Friend request already sent"
            : "This user already sent you a friend request";
      return res.status(409).json({ message });
    }

    const request = await FriendRequest.create({
      requester: req.user._id,
      recipient: targetUserId
    });

    await createNotification(
      targetUserId,
      `${currentUser.name || "A member"} sent you a friend request.`,
      "SYSTEM"
    );
    emitToUser(targetUserId, "friends:updated", { reason: "request-received" });

    const populatedRequest = await FriendRequest.findById(request._id).populate(
      "recipient",
      PUBLIC_USER_FIELDS
    );

    res.status(201).json({ message: "Friend request sent", request: populatedRequest });
  } catch (error) {
    res.status(500).json({ message: "Failed to send friend request", error: error.message });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const request = await FriendRequest.findOne({
      _id: req.params.requestId,
      recipient: req.user._id,
      status: "PENDING"
    }).populate("requester", PUBLIC_USER_FIELDS);

    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    request.status = "ACCEPTED";
    await request.save();

    await Promise.all([
      User.findByIdAndUpdate(req.user._id, { $addToSet: { friends: request.requester._id } }),
      User.findByIdAndUpdate(request.requester._id, { $addToSet: { friends: req.user._id } })
    ]);

    await createNotification(
      request.requester._id,
      `${req.user.name || "A member"} accepted your friend request.`,
      "SYSTEM"
    );
    emitToUser(request.requester._id, "friends:updated", { reason: "request-accepted" });
    emitToUser(req.user._id, "friends:updated", { reason: "request-accepted" });

    res.json({ message: "Friend request accepted", request });
  } catch (error) {
    res.status(500).json({ message: "Failed to accept friend request", error: error.message });
  }
};

exports.rejectFriendRequest = async (req, res) => {
  try {
    const request = await FriendRequest.findOne({
      _id: req.params.requestId,
      recipient: req.user._id,
      status: "PENDING"
    });

    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    request.status = "REJECTED";
    await request.save();
    emitToUser(request.requester, "friends:updated", { reason: "request-rejected" });

    res.json({ message: "Friend request declined" });
  } catch (error) {
    res.status(500).json({ message: "Failed to decline friend request", error: error.message });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const friendId = req.params.userId;

    if (!isValidObjectId(friendId)) {
      return res.status(400).json({ message: "Invalid friend" });
    }

    await Promise.all([
      User.findByIdAndUpdate(req.user._id, { $pull: { friends: friendId } }),
      User.findByIdAndUpdate(friendId, { $pull: { friends: req.user._id } }),
      FriendRequest.updateMany(
        {
          ...pairFilter(req.user._id, friendId),
          status: "ACCEPTED"
        },
        { $set: { status: "REJECTED" } }
      )
    ]);

    emitToUser(friendId, "friends:updated", { reason: "friend-removed" });
    emitToUser(req.user._id, "friends:updated", { reason: "friend-removed" });

    res.json({ message: "Friend removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove friend", error: error.message });
  }
};
