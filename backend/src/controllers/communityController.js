const Community = require("../models/Community");

const canModerateCommunity = (community, user) =>
  user?.role === "ADMIN" ||
  user?.role === "MODERATOR" ||
  community.createdBy.toString() === user._id.toString();

exports.createCommunity = async (req, res) => {
  try {
    const { name, city, description, rules, guidelines } = req.body;
    const isAdmin = req.user.role === "ADMIN";

    const community = await Community.create({
      name,
      city,
      description,
      rules,
      guidelines,
      createdBy: req.user._id,
      members: isAdmin ? [req.user._id] : [],
      status: isAdmin ? "APPROVED" : "PENDING",
      approvedBy: isAdmin ? req.user._id : undefined
    });

    res.status(201).json({
      message: isAdmin
        ? "Community created successfully"
        : "Community request submitted for admin approval",
      community
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCommunities = async (req, res) => {
  try {
    const { search, city } = req.query;
    const filter = { isDeleted: false, status: "APPROVED" };

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (city) {
      filter.city = city;
    }

    const communities = await Community.find(filter)
      .populate("createdBy", "name email role")
      .populate("members", "name email role")
      .populate("pendingMembers", "name email")
      .sort({ createdAt: -1 });

    res.json(communities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community || community.isDeleted || community.status !== "APPROVED") {
      return res.status(404).json({ message: "Community not found" });
    }

    const userId = req.user._id.toString();
    const memberExists = community.members.some((member) => member.toString() === userId);
    if (memberExists) {
      return res.status(400).json({ message: "Already a member" });
    }

    const pendingExists = community.pendingMembers.some((member) => member.toString() === userId);
    if (pendingExists) {
      return res.status(400).json({ message: "Join request already pending" });
    }

    const autoApprove = canModerateCommunity(community, req.user);
    if (autoApprove) {
      community.members.push(req.user._id);
      await community.save();
      return res.json({ status: "approved", message: "Joined successfully" });
    }

    community.pendingMembers.push(req.user._id);
    await community.save();

    res.status(202).json({ status: "pending", message: "Join request submitted for approval" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community || community.isDeleted || community.status !== "APPROVED") {
      return res.status(404).json({ message: "Community not found" });
    }

    if (community.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Community creator cannot leave" });
    }

    community.members = community.members.filter((user) => user.toString() !== req.user._id.toString());
    community.pendingMembers = community.pendingMembers.filter(
      (user) => user.toString() !== req.user._id.toString()
    );
    await community.save();

    res.json({ message: "Left community successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id).populate("pendingMembers", "name email");
    if (!community || community.isDeleted) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (!canModerateCommunity(community, req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(community.pendingMembers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community || community.isDeleted) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (!canModerateCommunity(community, req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const userId = req.params.userId;
    const pending = community.pendingMembers.some((id) => id.toString() === userId);
    if (!pending) {
      return res.status(404).json({ message: "Request not found" });
    }

    community.pendingMembers = community.pendingMembers.filter((id) => id.toString() !== userId);
    if (!community.members.some((id) => id.toString() === userId)) {
      community.members.push(userId);
    }

    await community.save();
    res.json({ message: "Member approved" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community || community.isDeleted) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (!canModerateCommunity(community, req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const userId = req.params.userId;
    community.pendingMembers = community.pendingMembers.filter((id) => id.toString() !== userId);
    await community.save();

    res.json({ message: "Join request rejected" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCommunityPolicy = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community || community.isDeleted) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (!canModerateCommunity(community, req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { rules, guidelines } = req.body;
    if (typeof rules === "string") community.rules = rules;
    if (typeof guidelines === "string") community.guidelines = guidelines;
    await community.save();

    res.json({ message: "Community policy updated", community });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.softDeleteCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: "Not found" });
    }

    community.isDeleted = true;
    await community.save();

    res.json({ message: "Community deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCommunityRequests = async (req, res) => {
  try {
    const requests = await Community.find({
      isDeleted: false,
      status: { $in: ["PENDING", "REJECTED"] }
    })
      .populate("createdBy", "name email hometown")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCommunityRequestStatus = async (req, res) => {
  try {
    const { status, approvalNote } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid request status" });
    }

    const community = await Community.findById(req.params.id);
    if (!community || community.isDeleted) {
      return res.status(404).json({ message: "Community request not found" });
    }

    community.status = status;
    community.approvalNote = approvalNote || "";
    community.approvedBy = req.user._id;

    if (status === "APPROVED" && !community.members.some((id) => id.toString() === community.createdBy.toString())) {
      community.members.push(community.createdBy);
    }

    await community.save();

    res.json({
      message: status === "APPROVED" ? "Community request approved" : "Community request rejected",
      community
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
