const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        "Cargo Konect Updates",
        "Vessel Berthing Updates",
        "Latest Case Study Updates",
        "Notifications",
      ],
      default: "Notifications",
      trim: true,
    },
    title: {
      type: String,
      default: "New Notification",
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    target: {
      type: String,
      enum: ["all", "user"],
      default: "all",
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      enum: ["general", "welcome"],
      default: "general",
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);