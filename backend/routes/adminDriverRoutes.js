const express = require("express");
const router  = express.Router();
const Driver  = require("../models/Driver");
const Ride    = require("../models/Ride");
const { protect, admin } = require("../middleware/authMiddleware");

/* ── GET all drivers with filters ── */
router.get("/", protect, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName:  { $regex: search, $options: "i" } },
        { lastName:   { $regex: search, $options: "i" } },
        { email:      { $regex: search, $options: "i" } },
        { phone:      { $regex: search, $options: "i" } },
        { "vehicle.plate": { $regex: search, $options: "i" } },
      ];
    }

    const [drivers, total] = await Promise.all([
      Driver.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Driver.countDocuments(query),
    ]);

    return res.status(200).json({
      drivers,
      total,
      page:  parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── GET single driver with full detail ── */
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).select("-password");
    if (!driver) return res.status(404).json({ message: "Driver not found." });

    const [totalTrips, recentTrips] = await Promise.all([
      Ride.countDocuments({ driver: driver._id, status: "completed" }),
      Ride.find({ driver: driver._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("customer", "firstName lastName"),
    ]);

    return res.status(200).json({ driver, totalTrips, recentTrips });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── APPROVE driver ── */
router.patch("/:id/approve", protect, admin, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found." });

    driver.status     = "offline"; // approved and ready to go online
    driver.isActive   = true;
    driver.isVerified = true;
    driver.approvedAt = new Date();
    driver.approvedBy = req.user._id;
    await driver.save();

    return res.status(200).json({ message: "Driver approved.", driver });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── SUSPEND driver ── */
router.patch("/:id/suspend", protect, admin, async (req, res) => {
  try {
    const { reason } = req.body;
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found." });

    driver.status        = "suspended";
    driver.isActive      = false;
    driver.suspendReason = reason || "No reason provided.";
    await driver.save();

    return res.status(200).json({ message: "Driver suspended.", driver });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── REACTIVATE driver ── */
router.patch("/:id/reactivate", protect, admin, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found." });

    driver.status        = "offline";
    driver.isActive      = true;
    driver.suspendReason = "";
    await driver.save();

    return res.status(200).json({ message: "Driver reactivated.", driver });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── VERIFY a specific document ── */
router.patch("/:id/documents/:docType/verify", protect, admin, async (req, res) => {
  try {
    const { docType } = req.params;
    const validDocs   = ["idDocument", "license", "registration", "roadworthy", "insurance", "profilePhoto"];

    if (!validDocs.includes(docType)) {
      return res.status(400).json({ message: "Invalid document type." });
    }

    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found." });

    driver.documents[docType].verified = true;
    await driver.save();

    return res.status(200).json({
      message:   `${docType} verified.`,
      documents: driver.documents,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── DELETE driver ── */
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found." });

    return res.status(200).json({ message: "Driver deleted." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── GET platform stats summary ── */
router.get("/stats/summary", protect, admin, async (req, res) => {
  try {
    const [
      totalDrivers,
      pendingDrivers,
      activeDrivers,
      onlineDrivers,
      suspendedDrivers,
      totalRides,
      completedRides,
      cancelledRides,
    ] = await Promise.all([
      Driver.countDocuments(),
      Driver.countDocuments({ status: "pending" }),
      Driver.countDocuments({ isActive: true }),
      Driver.countDocuments({ status: "online" }),
      Driver.countDocuments({ status: "suspended" }),
      Ride.countDocuments(),
      Ride.countDocuments({ status: "completed" }),
      Ride.countDocuments({ status: "cancelled" }),
    ]);

    return res.status(200).json({
      drivers: { total: totalDrivers, pending: pendingDrivers, active: activeDrivers, online: onlineDrivers, suspended: suspendedDrivers },
      rides:   { total: totalRides, completed: completedRides, cancelled: cancelledRides },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;