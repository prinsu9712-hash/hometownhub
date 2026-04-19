const Event = require("../models/Event");
const Community = require("../models/Community");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

/* ===============================
   CREATE EVENT
=============================== */
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location, community } = req.body;
    const normalizedTitle = String(title || "").trim();
    const normalizedDescription = String(description || "").trim();
    const normalizedLocation = String(location || "").trim();

    if (!normalizedTitle || !date || !community) {
      return res.status(400).json({ message: "Title, date and community are required" });
    }

    const communityData = await Community.findById(community);
    if (!communityData || communityData.isDeleted || communityData.status !== "APPROVED") {
      return res.status(404).json({ message: "Community not found" });
    }

    const event = await Event.create({
      title: normalizedTitle,
      description: normalizedDescription,
      date,
      location: normalizedLocation,
      image: req.file ? req.file.filename : null,
      community,
      createdBy: req.user._id,
      attendees: [req.user._id]
    });

    if (communityData) {
      for (let memberId of communityData.members) {
        if (memberId.toString() !== req.user._id.toString()) {

          const notification = await Notification.create({
            user: memberId,
            message: `New event created: ${normalizedTitle}`,
            type: "EVENT"
          });

          // 🔥 Real-time emit
          if (global.io) {
            global.io
              .to(memberId.toString())
              .emit("newNotification", notification);
          }
        }
      }
    }

    res.status(201).json(event);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPublicEvents = async (req, res) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isNaN(requestedLimit)
      ? 4
      : Math.min(Math.max(requestedLimit, 1), 12);

    const upcomingEvents = await Event.find({
      isDeleted: false,
      date: { $gte: new Date() }
    })
      .populate("community", "name city")
      .sort({ date: 1, createdAt: -1 })
      .limit(limit);

    res.json(upcomingEvents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* ===============================
   GET EVENTS (FILTER + HIDE DELETED)
=============================== */
exports.getEvents = async (req, res) => {
  try {
    const { search, date } = req.query;

    if (!mongoose.Types.ObjectId.isValid(req.params.communityId)) {
      return res.json([]);
    }

    let filter = {
      community: req.params.communityId,
      isDeleted: false
    };

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    if (date) {
      filter.date = new Date(date);
    }

    const events = await Event.find(filter)
      .populate("createdBy", "name")
      .populate("attendees", "name")
      .sort({ createdAt: -1 });

    res.json(events);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* ===============================
   JOIN EVENT
=============================== */
exports.joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event || event.isDeleted)
      return res.status(404).json({ message: "Event not found" });

    const alreadyJoined = event.attendees.some(
      (user) => user.toString() === req.user._id.toString()
    );

    if (alreadyJoined)
      return res.status(400).json({ message: "Already joined" });

    event.attendees.push(req.user._id);
    await event.save();

    res.json({ message: "Joined event successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* ===============================
   LEAVE EVENT
=============================== */
exports.leaveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event || event.isDeleted)
      return res.status(404).json({ message: "Event not found" });

    event.attendees = event.attendees.filter(
      (user) => user.toString() !== req.user._id.toString()
    );

    await event.save();

    res.json({ message: "Left event successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* ===============================
   SOFT DELETE EVENT (ADMIN)
=============================== */
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event)
      return res.status(404).json({ message: "Event not found" });

    event.isDeleted = true;
    await event.save();

    res.json({ message: "Event soft deleted" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* ===============================
   RESTORE EVENT (ADMIN)
=============================== */
exports.restoreEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event)
      return res.status(404).json({ message: "Event not found" });

    event.isDeleted = false;
    await event.save();

    res.json({ message: "Event restored" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/* ===============================
   GET ALL EVENTS (ADMIN PANEL)
=============================== */
exports.getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("community", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(events);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
