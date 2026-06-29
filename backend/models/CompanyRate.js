const mongoose = require("mongoose");

const courierRateSchema = new mongoose.Schema(
  {
    zone: {
      type: String,
      enum: ["local", "regional", "national"],
      required: true,
    },
    serviceLevel: {
      type: String,
      enum: ["economy", "express", "same-day"],
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
      default: 0,
    },
    includedWeightKg: {
      type: Number,
      required: true,
      default: 0,
    },
    extraKgRate: {
      type: Number,
      required: true,
      default: 0,
    },
    volumetricDivisor: {
      type: Number,
      default: 5000,
    },
    minimumCharge: {
      type: Number,
      default: 0,
    },
    maxLengthCm: {
      type: Number,
      default: 0,
    },
    maxWidthCm: {
      type: Number,
      default: 0,
    },
    maxHeightCm: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const truckRateSchema = new mongoose.Schema(
  {
    vehicleType: {
      type: String,
      enum: [
        "bakkie",
        "half-ton",
        "1-ton",
        "4-ton",
        "8-ton",
        "superlink",
        "flatbed",
        "refrigerated",
        "container",
      ],
      required: true,
    },
    loadType: {
      type: String,
      enum: ["FTL", "LTL"],
      required: true,
    },
    minimumCharge: {
      type: Number,
      required: true,
      default: 0,
    },
    ratePerKm: {
      type: Number,
      default: 0,
    },
    ratePerKg: {
      type: Number,
      default: 0,
    },
    includedKm: {
      type: Number,
      default: 0,
    },
    fuelSurchargePercent: {
      type: Number,
      default: 0,
    },
    handlingFee: {
      type: Number,
      default: 0,
    },
    capacityKg: {
      type: Number,
      default: 0,
    },
    estimatedDays: {
      type: String,
      default: "1-3 days",
    },
  },
  { _id: false }
);

const companyRateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    logoUrl: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    serviceModes: [
      {
        type: String,
        enum: ["courier", "truck"],
      },
    ],

    addressLine1: {
      type: String,
      trim: true,
      default: "",
    },

    addressLine2: {
      type: String,
      trim: true,
      default: "",
    },

    suburb: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    province: {
      type: String,
      trim: true,
      default: "",
    },

    postalCode: {
      type: String,
      trim: true,
      default: "",
    },

    country: {
      type: String,
      trim: true,
      default: "South Africa",
    },

    operatingRegions: [
      {
        type: String,
        trim: true,
      },
    ],

    insuranceIncluded: {
      type: Boolean,
      default: false,
    },

    trackingAvailable: {
      type: Boolean,
      default: true,
    },

    weekendDelivery: {
      type: Boolean,
      default: false,
    },

    dangerousGoodsSupported: {
      type: Boolean,
      default: false,
    },

    fragileGoodsSupported: {
      type: Boolean,
      default: true,
    },

    temperatureControlled: {
      type: Boolean,
      default: false,
    },

    courierRates: [courierRateSchema],
    truckRates: [truckRateSchema],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompanyRate", companyRateSchema);