const express = require("express");
const User = require("../models/User");
const Notification = require("../models/Notification");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const getRedirectPath = (user) => {
  if (user.role === "admin") {
    return "/admin-dashboard";
  }

  if (user.role === "company") {
    return "/company-home";
  }

  return "/user-home";
};

const buildUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  hasAcceptedTerms: user.hasAcceptedTerms,
  hasSeenWelcome: user.hasSeenWelcome,
  redirectTo: getRedirectPath(user),
});

const createWelcomeNotificationIfNeeded = async (user) => {
  // Only create this for normal customers
  if (user.role !== "customer") return;

  const existingWelcome = await Notification.findOne({
    target: "user",
    targetUser: user._id,
    type: "welcome",
  });

  if (existingWelcome) {
    if (!user.hasReceivedWelcomeNotification) {
      user.hasReceivedWelcomeNotification = true;
      await user.save();
    }
    return;
  }

  await Notification.create({
    category: "Cargo Konect Updates",
    title: "Welcome to Cargo Konect",
    message:
      "Welcome to Cargo Konect. Explore terminal berthing, case studies, and logistics tools built to support smarter decisions.",
    image: "",
    sentBy: null,
    target: "user",
    targetUser: user._id,
    type: "welcome",
    readBy: [],
  });

  user.hasReceivedWelcomeNotification = true;
  await user.save();
};

// @route POST /api/users/register
// @desc Register a new user
// @access Public
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Only allow public registration for customer or company
    const safeRole =
      role === "company" ? "company" : "customer";

    user = new User({
      name,
      email,
      password,
      role: safeRole,
      hasAcceptedTerms: true,
hasSeenWelcome: true,
      hasReceivedWelcomeNotification: false,
    });

    await user.save();

    await createWelcomeNotificationIfNeeded(user);

    const payload = {
      user: {
        id: user._id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "40h" },
      (err, token) => {
        if (err) throw err;

        res.status(201).json({
          user: buildUserResponse(user),
          token,
        });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

// @route POST /api/users/login
// @desc Authenticate user
// @access Public
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Optional: enforce selected login type matches account role
    if (role && user.role !== role) {
      return res.status(400).json({
        message: `This account is registered as ${user.role}, not ${role}`,
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    await createWelcomeNotificationIfNeeded(user);

    const payload = {
      user: {
        id: user._id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "40h" },
      (err, token) => {
        if (err) throw err;

        res.json({
          user: buildUserResponse(user),
          token,
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// @route GET /api/users/profile
// @desc Get logged-in user's profile
// @access Private
router.get("/profile", protect, async (req, res) => {
  res.json(buildUserResponse(req.user));
});

// @route PATCH /api/users/accept-terms
// @desc Mark terms and conditions as accepted
// @access Private
router.patch("/accept-terms", protect, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { hasAcceptedTerms: true },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(buildUserResponse(updatedUser));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update terms status" });
  }
});

// @route PATCH /api/users/welcome-complete
// @desc Mark welcome guide as completed
// @access Private
router.patch("/welcome-complete", protect, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { hasSeenWelcome: true },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(buildUserResponse(updatedUser));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update welcome status" });
  }
});

module.exports = router;

