const express = require("express");
const router = express.Router();
const { trackAnalyticsEvent } = require("../controllers/analyticsController");

router.post("/track", trackAnalyticsEvent);

module.exports = router;