const mongoose = require("mongoose");

const berthingCounterSchema = new mongoose.Schema(
  {
    portCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BerthingCounter", berthingCounterSchema);