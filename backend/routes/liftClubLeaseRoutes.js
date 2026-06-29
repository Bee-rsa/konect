const express          = require("express");
const router           = express.Router();
const LiftClub         = require("../models/LiftClub");
const { protect }      = require("../middleware/authMiddleware");
const { protectDriver } = require("../middleware/driverAuthMiddleware");

/* ─────────────────────────────────────────────────────────
   IMPORTANT: Static routes MUST come before /:id routes
   to prevent Express matching "leases" as an :id param
───────────────────────────────────────────────────────── */

/* ── CUSTOMER: Get my lease agreements ── */
router.get("/leases/mine", protect, async (req, res) => {
  try {
    const leases = await LeaseAgreement.find({ passenger: req.user._id })
      .populate("liftClub", "name route schedule")
      .populate("driver",   "firstName lastName profilePhoto vehicle rating")
      .sort({ createdAt: -1 });
    return res.status(200).json({ leases });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ── DRIVER: Get all lease agreements for my clubs ── */
router.get("/leases/driver", protectDriver, async (req, res) => {
  try {
    const leases = await LeaseAgreement.find({ driver: req.driver._id })
      .populate("liftClub",  "name route schedule")
      .populate("passenger", "firstName lastName profilePhoto phone")
      .sort({ createdAt: -1 });
    return res.status(200).json({ leases });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ── CUSTOMER: Send a lease request to a driver ── */
router.post("/:id/lease-request", protect, async (req, res) => {
  try {
    const { termMonths, pickupStop = "", notes = "" } = req.body;

    if (![1, 2, 3].includes(Number(termMonths))) {
      return res.status(400).json({ message: "termMonths must be 1, 2, or 3." });
    }

    const club = await LiftClub.findById(req.params.id).populate("driver");
    if (!club)                    return res.status(404).json({ message: "Lift club not found." });
    if (club.status !== "active") return res.status(400).json({ message: "Lift club is not active." });
    if (club.seats.available < 1) return res.status(400).json({ message: "No seats available." });

    const existing = await LeaseAgreement.findOne({
      passenger: req.user._id,
      liftClub:  club._id,
      status:    { $in: ["pending_driver", "pending_payment", "active"] },
    });
    if (existing) {
      return res.status(400).json({ message: "You already have an active or pending lease for this lift club." });
    }

    const months      = Number(termMonths);
    const workingDays = months * 22;
    const discountPct = months === 2 ? 5 : months === 3 ? 10 : 0;
    const totalAmount = club.pricePerSeat * workingDays;
    const discountAmt = parseFloat((totalAmount * discountPct / 100).toFixed(2));
    const finalAmount = parseFloat((totalAmount - discountAmt).toFixed(2));

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + ((8 - startDate.getDay()) % 7 || 7));
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);

    const lease = await LeaseAgreement.create({
      passenger:      req.user._id,
      driver:         club.driver._id,
      liftClub:       club._id,
      termMonths:     months,
      pricePerSeat:   club.pricePerSeat,
      totalAmount,
      discountPct,
      discountAmount: discountAmt,
      finalAmount,
      startDate,
      endDate,
      pickupStop,
      notes,
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`driver:${club.driver._id}`).emit("liftclub:lease_request", {
        liftClubId:    club._id,
        leaseId:       lease._id,
        passengerName: `${req.user.firstName} ${req.user.lastName}`,
        termMonths:    months,
        finalAmount,
        startDate,
      });
    }

    return res.status(201).json({ message: "Lease request sent. Awaiting driver approval.", lease });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ── DRIVER: Accept or reject a lease request ── */
router.patch("/:id/lease-request/:leaseId", protectDriver, async (req, res) => {
  try {
    const { action, reason = "" } = req.body;
    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ message: 'action must be "accept" or "reject".' });
    }

    const lease = await LeaseAgreement.findById(req.params.leaseId)
      .populate("passenger", "firstName lastName")
      .populate("liftClub");

    if (!lease) return res.status(404).json({ message: "Lease not found." });
    if (lease.driver.toString() !== req.driver._id.toString()) {
      return res.status(403).json({ message: "Not authorised." });
    }
    if (lease.status !== "pending_driver") {
      return res.status(400).json({ message: "Lease is no longer pending." });
    }

    if (action === "accept") {
      lease.status = "pending_payment";

      const club = await LiftClub.findById(lease.liftClub._id);
      if (club) {
        const already = club.passengers.find(
          (p) => p.user.toString() === lease.passenger._id.toString()
        );
        if (!already) {
          club.passengers.push({ user: lease.passenger._id, status: "confirmed" });
          club.seats.available = Math.max(0, club.seats.available - 1);
          if (club.seats.available === 0) club.status = "full";
          await club.save();
        }
      }
    } else {
      lease.status             = "rejected";
      lease.cancellationReason = reason;
      lease.cancelledBy        = "driver";
      lease.cancelledAt        = new Date();
    }

    await lease.save();

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${lease.passenger._id}`).emit("liftclub:lease_response", {
        leaseId:    lease._id,
        liftClubId: lease.liftClub._id,
        action,
        status:     lease.status,
      });
    }

    return res.status(200).json({ message: `Lease ${action}ed.`, lease });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ── CUSTOMER: Confirm payment (placeholder — no gateway yet) ── */
router.post("/lease/:leaseId/confirm-payment", protect, async (req, res) => {
  try {
    const lease = await LeaseAgreement.findOne({
      _id:       req.params.leaseId,
      passenger: req.user._id,
      status:    "pending_payment",
    });
    if (!lease) return res.status(404).json({ message: "Lease not found or not awaiting payment." });

    lease.status = "active";
    await lease.save();

    return res.status(200).json({ message: "Payment confirmed. Lift club is now active.", lease });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ── CUSTOMER: Give cancellation notice ── */
router.post("/lease/:leaseId/cancel-notice", protect, async (req, res) => {
  try {
    const lease = await LeaseAgreement.findOne({
      _id:       req.params.leaseId,
      passenger: req.user._id,
    });
    if (!lease)                   return res.status(404).json({ message: "Lease not found." });
    if (lease.status !== "active") return res.status(400).json({ message: "Only active leases can be cancelled." });

    const weeksElapsed = Math.floor(
      (Date.now() - new Date(lease.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    if (weeksElapsed < lease.canCancelAfterWeek) {
      return res.status(400).json({
        message: `Cancellation is only allowed after week ${lease.canCancelAfterWeek} of your lease.`,
        currentWeek: weeksElapsed,
      });
    }

    const notice    = new Date();
    const effective = new Date(notice);
    effective.setDate(effective.getDate() + 7);

    lease.status                    = "cancellation_notice";
    lease.cancellationNoticeGivenAt = notice;
    lease.cancellationEffectiveDate = effective;
    lease.cancellationReason        = req.body.reason || "";
    lease.cancelledBy               = "passenger";

    await lease.save();

    const io = req.app.get("io");
    if (io) {
      io.to(`driver:${lease.driver}`).emit("liftclub:cancellation_notice", {
        leaseId:       lease._id,
        effectiveDate: effective,
        passengerName: `${req.user.firstName} ${req.user.lastName}`,
      });
    }

    return res.status(200).json({
      message:       `Cancellation notice given. Your lease ends on ${effective.toDateString()}`,
      effectiveDate: effective,
      lease,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ── DRIVER: Release a weekly payment ── */
router.post("/lease/:leaseId/release-week", protectDriver, async (req, res) => {
  try {
    const { weekNumber } = req.body;
    const lease = await LeaseAgreement.findOne({
      _id:    req.params.leaseId,
      driver: req.driver._id,
      status: { $in: ["active", "cancellation_notice"] },
    });
    if (!lease) return res.status(404).json({ message: "Lease not found." });

    const week = lease.weeklyReleases.find((w) => w.weekNumber === Number(weekNumber));
    if (!week)                     return res.status(404).json({ message: "Week not found." });
    if (week.status !== "pending") return res.status(400).json({ message: "Week already released." });

    week.status          = "released";
    week.releasedAt      = new Date();
    lease.totalReleased  += week.amount;
    lease.pendingBalance  = parseFloat((lease.pendingBalance - week.amount).toFixed(2));
    lease.currentWeek     = weekNumber + 1;

    if (lease.weeklyReleases.every((w) => w.status === "released")) {
      lease.status = "completed";
    }

    await lease.save();
    return res.status(200).json({ message: `Week ${weekNumber} released.`, lease });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;