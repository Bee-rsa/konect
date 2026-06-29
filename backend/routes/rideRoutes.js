const express = require("express");
const router  = express.Router();
const Driver  = require("../models/Driver");
const Ride    = require("../models/Ride");
const { protect } = require("../middleware/authMiddleware");
const { protectDriver, requireApproved } = require("../middleware/driverAuthMiddleware");

const FARE_TABLE = {
  go:      { base: 12,  perKm: 7.0,  platform: 0.20 },
  comfort: { base: 18,  perKm: 9.0,  platform: 0.20 },
  xl:      { base: 25,  perKm: 11.0, platform: 0.20 },
  courier: { base: 15,  perKm: 8.0,  platform: 0.20 },
  express: { base: 10,  perKm: 7.5,  platform: 0.20 },
};

const calculateFare = (serviceType, distanceKm, surge = 1) => {
  const table       = FARE_TABLE[serviceType] || FARE_TABLE.go;
  const baseFare    = table.base;
  const distanceFare= +(table.perKm * distanceKm).toFixed(2);
  const subtotal    = +(baseFare + distanceFare).toFixed(2);
  const surgeAmount = +(subtotal * (surge - 1)).toFixed(2);
  const total       = +(subtotal + surgeAmount).toFixed(2);
  const platformFee = +(total * table.platform).toFixed(2);
  const driverEarns = +(total - platformFee).toFixed(2);

  return {
    base: baseFare, perKm: table.perKm, surge,
    total,
    breakdown: { baseFare, distanceFare, surgeAmount, platformFee, driverEarns },
  };
};

/* ── CUSTOMER: Request a ride ── */
router.post("/request", protect, async (req, res) => {
  try {
    const {
      serviceType, distanceKm, durationMin,
      pickup, dropoff, stops,
      paymentMethod, scheduledFor,
    } = req.body;

    if (!serviceType || !distanceKm || !pickup || !dropoff) {
      return res.status(400).json({ message: "Missing required ride details." });
    }

    const fare = calculateFare(serviceType, distanceKm);

    const ride = await Ride.create({
      customer:     req.user._id,
      serviceType,
      distanceKm,
      durationMin:  durationMin || 0,
      pickup,
      dropoff,
      stops:        stops || [],
      fare,
      payment:      { method: paymentMethod || "cash" },
      isScheduled:  !!scheduledFor,
      scheduledFor: scheduledFor || null,
      status:       "searching",
    });

    // Emit to socket — handled in server.js
    const io = req.app.get("io");
    if (io) {
      io.emit("ride:new_request_internal", { rideId: ride._id.toString() });
    }

    return res.status(201).json({ message: "Ride requested.", ride });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── DRIVER: Accept a ride ── */
router.patch("/:id/accept", protectDriver, requireApproved, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found." });
    if (ride.status !== "searching") {
      return res.status(400).json({ message: "Ride no longer available." });
    }

    ride.driver           = req.driver._id;
    ride.status           = "accepted";
    ride.timeline.accepted = new Date();
    await ride.save();

    await Driver.findByIdAndUpdate(req.driver._id, { status: "on_trip" });

    const io = req.app.get("io");
    if (io) {
      io.to(`ride:${ride._id}`).emit("ride:accepted", {
        rideId:   ride._id,
        driver: {
          id:       req.driver._id,
          name:     `${req.driver.firstName} ${req.driver.lastName}`,
          phone:    req.driver.phone,
          rating:   req.driver.rating,
          vehicle:  req.driver.vehicle,
          photo:    req.driver.profilePhoto,
        },
      });
    }

    return res.status(200).json({ message: "Ride accepted.", ride });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── DRIVER: Arrived at pickup ── */
router.patch("/:id/arrive", protectDriver, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride || ride.driver?.toString() !== req.driver._id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }

    ride.status          = "arrived";
    ride.timeline.arrived = new Date();
    await ride.save();

    const io = req.app.get("io");
    if (io) io.to(`ride:${ride._id}`).emit("ride:driver_arrived", { rideId: ride._id });

    return res.status(200).json({ message: "Marked as arrived.", ride });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── DRIVER: Start trip ── */
router.patch("/:id/start", protectDriver, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride || ride.driver?.toString() !== req.driver._id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }

    ride.status          = "in_progress";
    ride.timeline.started = new Date();
    await ride.save();

    const io = req.app.get("io");
    if (io) io.to(`ride:${ride._id}`).emit("ride:started", { rideId: ride._id });

    return res.status(200).json({ message: "Trip started.", ride });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── DRIVER: Complete trip ── */
router.patch("/:id/complete", protectDriver, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate("driver");
    if (!ride || ride.driver?._id.toString() !== req.driver._id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }

    ride.status             = "completed";
    ride.timeline.completed  = new Date();
    ride.payment.status     = ride.payment.method === "cash" ? "paid" : "pending";
    ride.payment.paidAt     = new Date();
    await ride.save();

    // Update driver earnings + stats
    const earned = ride.fare.breakdown?.driverEarns || 0;
    await Driver.findByIdAndUpdate(req.driver._id, {
      status:           "offline",
      lastTripAt:        new Date(),
      $inc: {
        "earnings.total":     earned,
        "earnings.today":     earned,
        "earnings.thisWeek":  earned,
        "earnings.thisMonth": earned,
        "stats.totalTrips":   1,
        "stats.totalKm":      ride.distanceKm || 0,
      },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`ride:${ride._id}`).emit("ride:completed", {
        rideId: ride._id,
        fare:   ride.fare,
      });
    }

    return res.status(200).json({ message: "Trip completed.", ride });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── CANCEL ── */
router.patch("/:id/cancel", async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found." });

    ride.status              = "cancelled";
    ride.timeline.cancelled   = new Date();
    ride.cancelledBy         = req.body.cancelledBy || "system";
    ride.cancellationReason  = req.body.reason || "";
    await ride.save();

    if (ride.driver) {
      await Driver.findByIdAndUpdate(ride.driver, { status: "offline" });
    }

    const io = req.app.get("io");
    if (io) {
      io.to(`ride:${ride._id}`).emit("ride:cancelled", {
        rideId:     ride._id,
        cancelledBy:ride.cancelledBy,
      });
    }

    return res.status(200).json({ message: "Ride cancelled.", ride });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── RATE ── */
router.post("/:id/rate", protect, async (req, res) => {
  try {
    const { score, comment } = req.body;
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found." });

    ride.ratings.byCustomer = { score, comment, at: new Date() };
    await ride.save();

    // Recalculate driver average rating
    const allRides = await Ride.find({
      driver: ride.driver,
      "ratings.byCustomer.score": { $exists: true },
    });
    const avg = allRides.reduce((sum, r) => sum + r.ratings.byCustomer.score, 0) / allRides.length;

    await Driver.findByIdAndUpdate(ride.driver, {
      "rating.average": +avg.toFixed(2),
      "rating.count":   allRides.length,
    });

    return res.status(200).json({ message: "Rating submitted." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── DRIVER: My trip history ── */
router.get("/driver/history", protectDriver, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const rides = await Ride.find({ driver: req.driver._id, status: "completed" })
      .sort({ "timeline.completed": -1 })
      .skip(skip)
      .limit(limit)
      .populate("customer", "firstName lastName profilePhoto");

    const total = await Ride.countDocuments({ driver: req.driver._id, status: "completed" });

    return res.status(200).json({ rides, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;