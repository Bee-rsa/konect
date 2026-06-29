const express = require("express");
const router = express.Router();
const {
  getAdminDashboardAnalytics,
} = require("../controllers/adminAnalyticsController");

// const { protect, admin } = require("../middleware/authMiddleware");

router.get("/dashboard", /* protect, admin, */ getAdminDashboardAnalytics);

module.exports = router;