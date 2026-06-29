const mongoose = require("mongoose");
const slugify = require("slugify");

const vesselSchema = new mongoose.Schema(
  {
    vesselName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    vesselDescription: {
      type: String,
      default: "",
      trim: true,
    },
    vesselType: {
      type: String,
      required: true,
      trim: true,
    },
    flagCountry: {
      type: String,
      required: true,
      trim: true,
    },
    flagCode: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    imo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    mmsi: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    callSign: {
      type: String,
      default: "",
      trim: true,
    },
    vesselImage: {
      type: String,
      default: "",
      trim: true,
    },
    operator: {
      type: String,
      default: "",
      trim: true,
    },
    grossTonnage: {
      type: Number,
      default: 0,
    },
    deadweightTonnage: {
      type: Number,
      default: 0,
    },
    lengthOverall: {
      type: Number,
      default: 0,
    },
    beam: {
      type: Number,
      default: 0,
    },
    yearBuilt: {
      type: Number,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

vesselSchema.pre("validate", function (next) {
  if (this.vesselName) {
    this.slug = slugify(this.vesselName, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Vessel", vesselSchema);