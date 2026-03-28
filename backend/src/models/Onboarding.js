const mongoose = require("mongoose");

const onboardingSchema = new mongoose.Schema(
  {
    communityName: { type: String, required: true, trim: true },
    cityVillage: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    memberCount: { type: Number, default: 0 },
    contactName: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, trim: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Onboarding", onboardingSchema);
