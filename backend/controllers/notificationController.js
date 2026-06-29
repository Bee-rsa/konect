const Notification = require("../models/Notification");
const User = require("../models/User");

const createNotification = async (req, res) => {
  try {
    const { category, title, message, image, target, targetUser, type } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (target === "user" && !targetUser) {
      return res.status(400).json({ message: "Target user is required" });
    }

    const notification = await Notification.create({
      category: category || "Notifications",
      title: title?.trim() || "New Notification",
      message: message.trim(),
      image: image || "",
      sentBy: req.user?._id || null,
      target: target || "all",
      targetUser: target === "user" ? targetUser : null,
      type: type || "general",
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create notification",
      error: error.message,
    });
  }
};

const createWelcomeNotificationForUser = async (userId) => {
  const existingWelcome = await Notification.findOne({
    target: "user",
    targetUser: userId,
    type: "welcome",
  });

  if (existingWelcome) return existingWelcome;

  const notification = await Notification.create({
    category: "Cargo Konect Updates",
    title: "Welcome to Cargo Konect",
    message:
      "Welcome to Cargo Konect. Your account is now active and you’ll receive new notifications here as updates become available.",
    image: "",
    sentBy: null,
    target: "user",
    targetUser: userId,
    type: "welcome",
  });

  return notification;
};

const getNotificationsForUser = async (req, res) => {
  try {
    const userId = String(req.user._id);

    const user = await User.findById(req.user._id).select("createdAt");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notifications = await Notification.find({
      $or: [
        {
          target: "all",
          createdAt: { $gte: user.createdAt },
        },
        {
          target: "user",
          targetUser: req.user._id,
        },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedNotifications = notifications.map((item) => ({
      ...item,
      isRead: item.readBy?.some((id) => String(id) === userId) || false,
    }));

    res.json(formattedNotifications);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (
      notification.target === "user" &&
      notification.targetUser &&
      String(notification.targetUser) !== String(req.user._id)
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to read this notification" });
    }

    const alreadyRead = notification.readBy.some(
      (id) => String(id) === String(req.user._id)
    );

    if (!alreadyRead) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

const getUnreadNotificationCount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("createdAt");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notifications = await Notification.find({
      $or: [
        {
          target: "all",
          createdAt: { $gte: user.createdAt },
        },
        {
          target: "user",
          targetUser: req.user._id,
        },
      ],
    }).lean();

    const unreadCount = notifications.filter(
      (item) => !item.readBy?.some((id) => String(id) === String(req.user._id))
    ).length;

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get unread count",
      error: error.message,
    });
  }
};

module.exports = {
  createNotification,
  getNotificationsForUser,
  markNotificationAsRead,
  getUnreadNotificationCount,
  createWelcomeNotificationForUser,
};