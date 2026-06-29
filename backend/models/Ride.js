const mongoose = require("mongoose");

const coordinateSchema = {
  address:     { type: String, default: "" },
  coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
};

const Ride = new mongoose.Schema({

  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true },
  driver:   { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },

  status: {
    type: String,
    enum: [
      "searching",   // looking for driver
      "accepted",    // driver accepted
      "en_route",    // driver heading to pickup
      "arrived",     // driver at pickup
      "in_progress", // trip underway
      "completed",
      "cancelled",
      "no_driver",   // no driver found
    ],
    default: "searching",
  },

  serviceType: {
    type: String,
    enum: ["go", "comfort", "xl", "courier", "express"],
    required: true,
  },

  pickup:  { ...coordinateSchema },
  dropoff: { ...coordinateSchema },
  stops: [{ ...coordinateSchema }],

  distanceKm:  { type: Number, default: 0 },
  durationMin: { type: Number, default: 0 },

  fare: {
    base:       { type: Number, default: 0 },
    perKm:      { type: Number, default: 0 },
    surge:      { type: Number, default: 1 },    // multiplier
    total:      { type: Number, default: 0 },
    currency:   { type: String, default: "ZAR" },
    breakdown: {
      baseFare:     { type: Number, default: 0 },
      distanceFare: { type: Number, default: 0 },
      surgeAmount:  { type: Number, default: 0 },
      platformFee:  { type: Number, default: 0 },
      driverEarns:  { type: Number, default: 0 },
    },
  },

  payment: {
    method: { type: String, enum: ["cash", "card", "wallet"], default: "cash" },
    status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    paidAt: { type: Date },
  },

  ratings: {
    byCustomer: { score: Number, comment: String, at: Date },
    byDriver:   { score: Number, comment: String, at: Date },
  },

  cancelledBy:     { type: String, enum: ["customer", "driver", "system", ""], default: "" },
  cancellationReason: { type: String, default: "" },

  /* ── Matching ── */
  driversNotified: [{ type: mongoose.Schema.Types.ObjectId, ref: "Driver" }],
  matchAttempts:   { type: Number, default: 0 },
  searchRadiusKm:  { type: Number, default: 5 },

  /* ── Timeline ── */
  timeline: {
    requested:  { type: Date, default: Date.now },
    accepted:   { type: Date },
    arrived:    { type: Date },
    started:    { type: Date },
    completed:  { type: Date },
    cancelled:  { type: Date },
  },

  isLiftClub: { type: Boolean, default: false },
  liftClub:   { type: mongoose.Schema.Types.ObjectId, ref: "LiftClub", default: null },

  scheduledFor: { type: Date, default: null },
  isScheduled:  { type: Boolean, default: false },

}, { timestamps: true });

Ride.index({ customer: 1 });
Ride.index({ driver: 1 });
Ride.index({ status: 1 });
Ride.index({ "pickup.coordinates": "2dsphere" });

module.exports = mongoose.model("Ride", Ride);