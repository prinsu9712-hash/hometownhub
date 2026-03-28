const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    location: String,
    image: String,

    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    // 🔥 SOFT DELETE FIELD
    isDeleted: {
      type: Boolean,
      default: false
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);