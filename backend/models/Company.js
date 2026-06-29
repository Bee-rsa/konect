const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    businessType: {
      type: String,
      required: true,
      trim: true,
    },
    cipcNumber: {
      type: String,
      required: false,
      trim: true,
      unique: true,
    },
    taxNumber: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: "South Africa",
    },
    regions: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);

