const Onboarding = require("../models/Onboarding");

exports.createOnboarding = async (req, res) => {
  try {
    const { communityName, cityVillage, description, memberCount, contactName, contactEmail } = req.body;
    const record = await Onboarding.create({
      communityName,
      cityVillage,
      description,
      memberCount,
      contactName,
      contactEmail,
      submittedBy: req.user._id
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: "Failed to submit onboarding", error: error.message });
  }
};

exports.getOnboarding = async (req, res) => {
  try {
    const filter = req.user.role === "ADMIN" ? {} : { submittedBy: req.user._id };
    const records = await Onboarding.find(filter).populate("submittedBy", "name email").sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch onboarding requests", error: error.message });
  }
};

exports.updateOnboardingStatus = async (req, res) => {
  try {
    const record = await Onboarding.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Onboarding request not found" });
    }
    const { status } = req.body;
    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    record.status = status;
    await record.save();
    res.json({ message: "Onboarding status updated", record });
  } catch (error) {
    res.status(500).json({ message: "Failed to update onboarding status", error: error.message });
  }
};
