const mongoose = require("mongoose");

const vesselAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    vessel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vessel",
      required: true,
      index: true,
    },
    berthing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Berthing",
      default: null,
      index: true,
    },
    alertType: {
      type: String,
      enum: ["berth_reached"],
      default: "berth_reached",
    },
    scheduledFor: {
      type: Date,
      required: true,
      index: true,
    },
    isSent: {
      type: Boolean,
      default: false,
      index: true,
    },
    sentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

vesselAlertSchema.index(
  { user: 1, vessel: 1, berthing: 1, alertType: 1 },
  { unique: true }
);

module.exports = mongoose.model("VesselAlert", vesselAlertSchema);