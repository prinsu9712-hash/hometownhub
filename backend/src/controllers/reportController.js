const Report = require("../models/Report");

exports.createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, details } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ message: "targetType, targetId and reason are required" });
    }

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      reason,
      details
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: "Failed to create report", error: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const reports = await Report.find(filter)
      .populate("reporter", "name email")
      .populate("resolvedBy", "name")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reports", error: error.message });
  }
};

exports.resolveReport = async (req, res) => {
  try {
    const { status, resolutionNote } = req.body;
    if (!["RESOLVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "status must be RESOLVED or REJECTED" });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.status = status;
    report.resolutionNote = resolutionNote || "";
    report.resolvedBy = req.user._id;
    await report.save();

    res.json({ message: "Report updated", report });
  } catch (error) {
    res.status(500).json({ message: "Failed to resolve report", error: error.message });
  }
};
