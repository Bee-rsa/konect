const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const permissionSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      enum: [
        "Operations",
        "Rates",
        "Intelligence",
        "Management",
        "Settings",
        "Master Control",
      ],
      required: true,
    },
    services: [{ type: String, trim: true }],
    actions: [
      {
        type: String,
        enum: ["view", "create", "edit", "delete", "approve", "export"],
      },
    ],
  },
  { _id: false }
);

const companyUserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    branchName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      default: "General",
      trim: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["master_holder", "branch_admin", "user", "read_only"],
      default: "user",
    },
    permissions: [permissionSchema],
    favouriteServices: [{ type: String, trim: true }],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyUser",
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Username must be unique only inside the same company
companyUserSchema.index({ company: 1, username: 1 }, { unique: true });

companyUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

companyUserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("CompanyUser", companyUserSchema);

