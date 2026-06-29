const mongoose = require("mongoose");

const AnalyticsEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ["visit", "search", "page_view"],
      required: true,
    },
    page: {
      type: String,
      default: "",
    },
    searchQuery: {
      type: String,
      default: "",
    },
    portName: {
      type: String,
      default: "",
    },
    countryCode: {
      type: String,
      default: "",
    },
    deviceType: {
      type: String,
      enum: ["mobile", "tablet", "desktop", "unknown"],
      default: "unknown",
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    meta: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AnalyticsEvent", AnalyticsEventSchema);