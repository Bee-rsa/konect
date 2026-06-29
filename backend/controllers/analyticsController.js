const AnalyticsEvent = require("../models/AnalyticsEvent");

const trackAnalyticsEvent = async (req, res) => {
  try {
    const {
      eventType,
      page = "",
      searchQuery = "",
      portName = "",
      countryCode = "",
      deviceType = "unknown",
      sessionId,
      meta = {},
    } = req.body;

    if (!eventType || !sessionId) {
      return res.status(400).json({ message: "eventType and sessionId are required" });
    }

    const userId = req.user ? req.user._id : null;

    const event = await AnalyticsEvent.create({
      eventType,
      page,
      searchQuery,
      portName,
      countryCode,
      deviceType,
      sessionId,
      userId,
      meta,
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("trackAnalyticsEvent error:", error);
    res.status(500).json({ message: "Failed to track analytics event" });
  }
};

module.exports = {
  trackAnalyticsEvent,
};