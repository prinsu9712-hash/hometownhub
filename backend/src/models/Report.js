const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    targetType: {
      type: String,
      enum: ["POST", "COMMENT", "EVENT", "COMMUNITY", "USER"],
      required: true
    },
    targetId: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    details: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["OPEN", "RESOLVED", "REJECTED"],
      default: "OPEN"
    },
    resolutionNote: {
      type: String,
      default: ""
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
