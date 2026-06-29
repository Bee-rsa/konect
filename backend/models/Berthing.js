const mongoose = require("mongoose");

const berthingSchema = new mongoose.Schema(
  {
    vessel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vessel",
      required: true,
      index: true,
    },
    previousPortOfDeparture: {
      type: String,
      required: true,
      trim: true,
    },
    destinationCountry: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    destinationPortCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    destinationPortName: {
      type: String,
      required: true,
      trim: true,
    },
    estimatedDateOfBerthing: {
      type: Date,
      required: true,
      index: true,
    },
    estimatedTimeOfBerthing: {
      type: String,
      required: true,
      trim: true,
    },
    actualDateOfBerthing: {
      type: Date,
      default: null,
    },
    actualTimeOfBerthing: {
      type: String,
      default: "",
      trim: true,
    },
    departureDate: {
      type: Date,
      default: null,
    },
    departureTime: {
      type: String,
      default: "",
      trim: true,
    },
    containersToDischarge: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    containersToLoad: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    berthingShed: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    comments: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Expected", "Berthed", "Delayed", "Departed", "Cancelled"],
      default: "Expected",
    },
    berthingSequence: {
      type: Number,
      required: true,
    },
    berthingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

berthingSchema.pre("save", function (next) {
  this.lastUpdatedAt = new Date();
  next();
});


// 🚀 ADD THESE COMPOUND INDEXES (CRITICAL FOR SPEED)

// Main query (country + port + date range)
berthingSchema.index({
  destinationCountry: 1,
  destinationPortCode: 1,
  estimatedDateOfBerthing: 1,
});

// Port + terminal filtering
berthingSchema.index({
  destinationPortCode: 1,
  berthingShed: 1,
  estimatedDateOfBerthing: 1,
});

// Vessel-based lookups
berthingSchema.index({
  vessel: 1,
  estimatedDateOfBerthing: 1,
});

// Sorting optimization (date + time)
berthingSchema.index({
  estimatedDateOfBerthing: 1,
  estimatedTimeOfBerthing: 1,
});

// Fast "recent updates"
berthingSchema.index({
  lastUpdatedAt: -1,
});

// Optional (only if you search these often)
berthingSchema.index({ previousPortOfDeparture: 1 });
berthingSchema.index({ comments: 1 });


module.exports = mongoose.model("Berthing", berthingSchema);

