const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const Driver  = require("../models/Driver");
const { protectDriver } = require("../middleware/driverAuthMiddleware");

const createToken = (driverId) =>
  jwt.sign({ driverId }, process.env.JWT_SECRET, { expiresIn: "30d" });

const sanitizeDriver = (driver) => ({
  _id:         driver._id,
  firstName:   driver.firstName,
  lastName:    driver.lastName,
  email:       driver.email,
  phone:       driver.phone,
  profilePhoto:driver.profilePhoto,
  status:      driver.status,
  isActive:    driver.isActive,
  isVerified:  driver.isVerified,
  vehicle:     driver.vehicle,
  services:    driver.services,
  rating:      driver.rating,
  earnings:    driver.earnings,
  stats:       driver.stats,
  documents:   driver.documents,
  bankDetails: driver.bankDetails,
  license:     driver.license,
  address:     driver.address,
  createdAt:   driver.createdAt,
});

/* ── REGISTER ── */
router.post("/register", async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone,
      password, idNumber, dateOfBirth, gender,
    } = req.body;

    if (!firstName || !lastName || !email || !phone || !password || !idNumber) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const exists = await Driver.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const driver = await Driver.create({
      firstName:   firstName.trim(),
      lastName:    lastName.trim(),
      email:       email.trim().toLowerCase(),
      phone:       phone.trim(),
      password,
      idNumber:    idNumber.trim(),
      dateOfBirth: dateOfBirth || undefined,
      gender:      gender || undefined,
      status:      "pending",
    });

    return res.status(201).json({
      message: "Registration successful. Complete your profile to go live.",
      token:  createToken(driver._id),
      driver: sanitizeDriver(driver),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already registered." });
    }
    return res.status(500).json({ message: error.message });
  }
});

/* ── LOGIN ── */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const driver = await Driver.findOne({ email: email.toLowerCase() });
    if (!driver || !(await driver.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    driver.lastLoginAt = new Date();
    await driver.save();

    return res.status(200).json({
      token:  createToken(driver._id),
      driver: sanitizeDriver(driver),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── GET ME ── */
router.get("/me", protectDriver, async (req, res) => {
  return res.status(200).json({ driver: sanitizeDriver(req.driver) });
});

/* ── UPDATE VEHICLE ── */
router.patch("/vehicle", protectDriver, async (req, res) => {
  try {
    const { make, model, year, color, plate, type, capacity, vin } = req.body;
    const driver = await Driver.findById(req.driver._id);

    driver.vehicle = {
      make:     make     || driver.vehicle.make,
      model:    model    || driver.vehicle.model,
      year:     year     || driver.vehicle.year,
      color:    color    || driver.vehicle.color,
      plate:    plate    || driver.vehicle.plate,
      type:     type     || driver.vehicle.type,
      capacity: capacity || driver.vehicle.capacity,
      vin:      vin      || driver.vehicle.vin,
    };

    await driver.save();
    return res.status(200).json({ message: "Vehicle updated.", vehicle: driver.vehicle });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── UPDATE BANK DETAILS ── */
router.patch("/bank", protectDriver, async (req, res) => {
  try {
    const { bankName, accountHolder, accountNumber, accountType, branchCode } = req.body;
    const driver = await Driver.findById(req.driver._id);

    driver.bankDetails = { bankName, accountHolder, accountNumber, accountType, branchCode };
    await driver.save();

    return res.status(200).json({ message: "Bank details updated." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── UPDATE LICENSE ── */
router.patch("/license", protectDriver, async (req, res) => {
  try {
    const { number, expiry, type } = req.body;
    const driver = await Driver.findById(req.driver._id);

    driver.license = { number, expiry, type };
    await driver.save();

    return res.status(200).json({ message: "License updated.", license: driver.license });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── UPDATE LOCATION ── */
router.patch("/location", protectDriver, async (req, res) => {
  try {
    const { lng, lat } = req.body;
    if (!lng || !lat) return res.status(400).json({ message: "Coordinates required." });

    await Driver.findByIdAndUpdate(req.driver._id, {
      location: { type: "Point", coordinates: [lng, lat] },
    });

    return res.status(200).json({ message: "Location updated." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ── TOGGLE ONLINE / OFFLINE ── */
router.patch("/status/toggle", protectDriver, async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver._id);

    if (!driver.isActive) {
      return res.status(403).json({
        message: "Account not yet approved. You cannot go online.",
      });
    }

    const goingOnline = driver.status === "offline" || driver.status === "approved";
    driver.status = goingOnline ? "online" : "offline";

    if (goingOnline) driver.lastOnlineAt  = new Date();
    else             driver.lastOfflineAt = new Date();

    await driver.save();

    return res.status(200).json({
      message: goingOnline ? "You are now online." : "You are now offline.",
      status:  driver.status,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;