const mongoose = require("mongoose");

const LiftClub = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },

  name:        { type: String, required: true, trim: true },
  description: { type: String, default: "" },

  route: {
    origin: {
      address:     { type: String, required: true },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    destination: {
      address:     { type: String, required: true },
      coordinates: { type: [Number], required: true },
    },
    stops: [{
      address:     { type: String },
      coordinates: { type: [Number] },
    }],
    distanceKm:   { type: Number, default: 0 },
    estimatedMin: { type: Number, default: 0 },
  },

  schedule: {
    days:          { type: [String], enum: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], required: true },
    departureTime: { type: String, required: true }, // "07:30"
    returnTime:    { type: String, default: "" },
    isReturn:      { type: Boolean, default: false },
  },

  seats: {
    total:     { type: Number, required: true, min: 1, max: 6 },
    available: { type: Number, required: true },
  },

  pricePerSeat: { type: Number, required: true },
  currency:     { type: String, default: "ZAR" },

  passengers: [{
    user:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status:    { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    joinedAt:  { type: Date, default: Date.now },
    pickupStop:{ type: String, default: "" },
  }],

  status: {
    type:    String,
    enum:    ["active", "paused", "full", "cancelled"],
    default: "active",
  },

}, { timestamps: true });

LiftClub.index({ "route.origin.coordinates": "2dsphere" });
LiftClub.index({ driver: 1 });
LiftClub.index({ status: 1 });

module.exports = mongoose.model("LiftClub", LiftClub);