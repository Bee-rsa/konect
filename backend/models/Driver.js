const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const documentSchema = new mongoose.Schema({
  url:        { type: String, default: "" },
  verified:   { type: Boolean, default: false },
  uploadedAt: { type: Date },
}, { _id: false });

const Driver = new mongoose.Schema({

  /* ── Personal ── */
  firstName:   { type: String, required: true, trim: true },
  lastName:    { type: String, required: true, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:       { type: String, required: true, trim: true },
  password:    { type: String, required: true },
  profilePhoto:{ type: String, default: "" },
  idNumber:    { type: String, required: true, trim: true },
  dateOfBirth: { type: Date },
  gender:      { type: String, enum: ["male", "female", "other", "prefer_not_to_say"] },
  address: {
    street:   { type: String, default: "" },
    suburb:   { type: String, default: "" },
    city:     { type: String, default: "" },
    province: { type: String, default: "" },
    postCode: { type: String, default: "" },
    country:  { type: String, default: "South Africa" },
  },

  /* ── License ── */
  license: {
    number: { type: String, default: "" },
    expiry: { type: Date },
    type:   { type: String, enum: ["B", "C", "EC", "EB", ""], default: "" },
  },

  /* ── Vehicle ── */
  vehicle: {
    make:     { type: String, default: "" },
    model:    { type: String, default: "" },
    year:     { type: Number },
    color:    { type: String, default: "" },
    plate:    { type: String, default: "" },
    type:     {
      type: String,
      enum: ["sedan", "suv", "minivan", "bakkie", "luxury", "motorbike"],
      default: "sedan",
    },
    capacity: { type: Number, default: 4 },
    vin:      { type: String, default: "" },
  },

  /* ── Documents ── */
  documents: {
    idDocument:    { ...documentSchema.obj },
    license:       { ...documentSchema.obj },
    registration:  { ...documentSchema.obj },
    roadworthy:    { ...documentSchema.obj },
    insurance:     { ...documentSchema.obj },
    profilePhoto:  { ...documentSchema.obj },
  },

  /* ── Bank ── */
  bankDetails: {
    bankName:       { type: String, default: "" },
    accountHolder:  { type: String, default: "" },
    accountNumber:  { type: String, default: "" },
    accountType:    { type: String, enum: ["cheque", "savings", ""], default: "" },
    branchCode:     { type: String, default: "" },
  },

  /* ── Status ── */
  status: {
    type: String,
    enum: ["pending", "approved", "suspended", "offline", "online", "on_trip"],
    default: "pending",
  },
  isActive:      { type: Boolean, default: false },
  isVerified:    { type: Boolean, default: false },
  approvedAt:    { type: Date },
  approvedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  suspendReason: { type: String, default: "" },

  /* ── Location (GeoJSON for $geoNear) ── */
  location: {
    type:        { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },

  /* ── Service types this driver offers ── */
  services: {
    type: [String],
    enum: ["go", "comfort", "xl", "courier", "express"],
    default: ["go"],
  },

  /* ── Ratings ── */
  rating: {
    average: { type: Number, default: 0 },
    count:   { type: Number, default: 0 },
  },

  /* ── Earnings ── */
  earnings: {
    total:     { type: Number, default: 0 },
    thisWeek:  { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
    today:     { type: Number, default: 0 },
    lastPayout:{ type: Number, default: 0 },
    lastPayoutDate: { type: Date },
  },

  /* ── Stats ── */
  stats: {
    totalTrips:      { type: Number, default: 0 },
    totalKm:         { type: Number, default: 0 },
    cancelRate:      { type: Number, default: 0 },
    acceptanceRate:  { type: Number, default: 0 },
    onlineHoursTotal:{ type: Number, default: 0 },
  },

  /* ── Session ── */
  lastOnlineAt:  { type: Date },
  lastOfflineAt: { type: Date },
  lastTripAt:    { type: Date },
  lastLoginAt:   { type: Date },

  /* ── OTP ── */
  otp:          { type: String },
  otpExpiresAt: { type: Date },

  /* ── Password reset ── */
  resetToken:          { type: String },
  resetTokenExpiresAt: { type: Date },

}, { timestamps: true });

/* ── Indexes ── */
Driver.index({ location: "2dsphere" }); // required for $geoNear
Driver.index({ status: 1 });
Driver.index({ email: 1 }, { unique: true });

/* ── Hash password before save ── */
Driver.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* ── Compare password ── */
Driver.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

/* ── Virtual: full name ── */
Driver.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("Driver", Driver);