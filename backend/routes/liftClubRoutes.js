const express    = require("express");
const router     = express.Router();
const LiftClub   = require("../models/LiftClub");
const { protectDriver, requireApproved } = require("../middleware/driverAuthMiddleware");
const { protect } = require("../middleware/authMiddleware");

/* ── DRIVER: Create lift club ── */
router.post("/", protectDriver, requireApproved, async (req, res) => {
  try {
    const {
      name, description, route,
      schedule, seats, pricePerSeat,
    } = req.body;

    if (!name || !route || !schedule || !seats || !pricePerSeat) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const club = await LiftClub.create({
      driver: req.driver._id,
      name,
      description: description || "",
      route,
      schedule,
      seats: { total: seats, available: seats },
      pricePerSeat,
    });

    return res.status(201).json({ message: "Lift club created.", club });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── DRIVER: Get my lift clubs ── */
router.get("/my", protectDriver, async (req, res) => {
  try {
    const clubs = await LiftClub.find({ driver: req.driver._id })
      .populate("passengers.user", "firstName lastName profilePhoto phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({ clubs });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── PUBLIC: Search lift clubs ── */
router.get("/search", async (req, res) => {
  try {
    const { origin, destination, day } = req.query;

    const query = { status: "active" };
    if (day) query["schedule.days"] = day;

    const clubs = await LiftClub.find(query)
      .populate("driver", "firstName lastName profilePhoto rating vehicle")
      .sort({ pricePerSeat: 1 });

    return res.status(200).json({ clubs });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── PUBLIC: Get single lift club ── */
router.get("/:id", async (req, res) => {
  try {
    const club = await LiftClub.findById(req.params.id)
      .populate("driver", "firstName lastName profilePhoto rating vehicle phone")
      .populate("passengers.user", "firstName lastName profilePhoto");

    if (!club) return res.status(404).json({ message: "Lift club not found." });

    return res.status(200).json({ club });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── DRIVER: Update lift club ── */
router.patch("/:id", protectDriver, async (req, res) => {
  try {
    const club = await LiftClub.findOne({ _id: req.params.id, driver: req.driver._id });
    if (!club) return res.status(404).json({ message: "Lift club not found." });

    const allowed = ["name", "description", "schedule", "pricePerSeat", "route"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) club[field] = req.body[field];
    });

    await club.save();
    return res.status(200).json({ message: "Lift club updated.", club });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── DRIVER: Pause / resume ── */
router.patch("/:id/toggle", protectDriver, async (req, res) => {
  try {
    const club = await LiftClub.findOne({ _id: req.params.id, driver: req.driver._id });
    if (!club) return res.status(404).json({ message: "Lift club not found." });

    club.status = club.status === "active" ? "paused" : "active";
    await club.save();

    return res.status(200).json({
      message: `Lift club ${club.status}.`,
      status:  club.status,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── DRIVER: Delete ── */
router.delete("/:id", protectDriver, async (req, res) => {
  try {
    const club = await LiftClub.findOneAndDelete({ _id: req.params.id, driver: req.driver._id });
    if (!club) return res.status(404).json({ message: "Lift club not found." });

    return res.status(200).json({ message: "Lift club deleted." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── CUSTOMER: Join a lift club ── */
router.post("/:id/join", protect, async (req, res) => {
  try {
    const club = await LiftClub.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Lift club not found." });
    if (club.status !== "active") return res.status(400).json({ message: "Lift club is not active." });
    if (club.seats.available < 1) return res.status(400).json({ message: "No seats available." });

    const alreadyJoined = club.passengers.find(
      (p) => p.user.toString() === req.user._id.toString()
    );
    if (alreadyJoined) return res.status(400).json({ message: "Already joined this lift club." });

    club.passengers.push({
      user:       req.user._id,
      status:     "pending",
      pickupStop: req.body.pickupStop || "",
    });
    club.seats.available -= 1;
    if (club.seats.available === 0) club.status = "full";

    await club.save();

    // Notify driver via socket
    const io = req.app.get("io");
    if (io) {
      io.to(`driver:${club.driver}`).emit("liftclub:new_passenger", {
        liftClubId: club._id,
        userId:     req.user._id,
      });
    }

    return res.status(200).json({ message: "Joined lift club. Awaiting confirmation.", club });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── DRIVER: Confirm or reject a passenger ── */
router.patch("/:id/passengers/:userId", protectDriver, async (req, res) => {
  try {
    const { action } = req.body; // "confirm" | "reject"
    const club = await LiftClub.findOne({ _id: req.params.id, driver: req.driver._id });
    if (!club) return res.status(404).json({ message: "Lift club not found." });

    const passenger = club.passengers.find(
      (p) => p.user.toString() === req.params.userId
    );
    if (!passenger) return res.status(404).json({ message: "Passenger not found." });

    if (action === "confirm") {
      passenger.status = "confirmed";
    } else if (action === "reject") {
      passenger.status = "cancelled";
      club.seats.available += 1;
      if (club.status === "full") club.status = "active";
    } else {
      return res.status(400).json({ message: "Invalid action." });
    }

    await club.save();
    return res.status(200).json({ message: `Passenger ${action}ed.`, club });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;