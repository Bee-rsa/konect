const express = require("express");
const router = express.Router();
const {
  createNotification,
  getNotificationsForUser,
  markNotificationAsRead,
  getUnreadNotificationCount,
} = require("../controllers/notificationController");

const { protect, admin } = require("../middleware/authMiddleware");

router.post("/", protect, admin, createNotification);
router.get("/", protect, getNotificationsForUser);
router.get("/unread-count", protect, getUnreadNotificationCount);
router.put("/:id/read", protect, markNotificationAsRead);

module.exports = router;