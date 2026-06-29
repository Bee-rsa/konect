const express = require("express");
const router = express.Router();
const CompanyRate = require("../models/CompanyRate");
const { protectCompanyUser } = require("../middleware/companyAuthMiddleware");

// ── GET my profile ──────────────────────────────────────────
router.get("/my-rates", protectCompanyUser, async (req, res) => {
  try {
    const profile = await CompanyRate.findOne({ user: req.user._id });
    res.json(profile || null);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// ── CREATE profile ───────────────────────────────────────────
router.post("/", protectCompanyUser, async (req, res) => {
  try {
    const existing = await CompanyRate.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "Profile already exists. Use PATCH to update." });
    }
    const profile = await CompanyRate.create({
      ...req.body,
      user: req.user._id,
      companyName: req.user.companyName,
      email: req.user.email,
    });
    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ message: "Failed to create profile" });
  }
});

// ── UPDATE company info ──────────────────────────────────────
router.patch("/info", protectCompanyUser, async (req, res) => {
  try {
    const allowed = [
      "companyName", "email", "phone", "website", "logoUrl",
      "description", "addressLine1", "addressLine2", "suburb",
      "city", "province", "postalCode", "country",
      "operatingRegions", "serviceModes", "insuranceIncluded",
      "trackingAvailable", "weekendDelivery", "dangerousGoodsSupported",
      "fragileGoodsSupported", "temperatureControlled",
    ];
    const update = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    });
    const profile = await CompanyRate.findOneAndUpdate(
      { user: req.user._id },
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// ── ADD courier rate ─────────────────────────────────────────
router.post("/courier-rate", protectCompanyUser, async (req, res) => {
  try {
    let profile = await CompanyRate.findOne({ user: req.user._id });
    if (!profile) {
      profile = await CompanyRate.create({
        user: req.user._id,
        companyName: req.user.companyName,
        email: req.user.email,
        serviceModes: ["courier"],
      });
    }

    // Ensure courier is in serviceModes
    if (!profile.serviceModes.includes("courier")) {
      await CompanyRate.findOneAndUpdate(
        { user: req.user._id },
        { $addToSet: { serviceModes: "courier" } }
      );
    }

    profile = await CompanyRate.findOneAndUpdate(
      { user: req.user._id },
      { $push: { courierRates: req.body } },
      { new: true, runValidators: true }
    );
    res.json(profile.courierRates);
  } catch (err) {
    res.status(500).json({ message: "Failed to add courier rate" });
  }
});

// ── UPDATE courier rate ──────────────────────────────────────
router.patch("/courier-rate/:index", protectCompanyUser, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const profile = await CompanyRate.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    if (!profile.courierRates[index]) return res.status(404).json({ message: "Rate not found" });
    Object.assign(profile.courierRates[index], req.body);
    await profile.save();
    res.json(profile.courierRates);
  } catch (err) {
    res.status(500).json({ message: "Failed to update courier rate" });
  }
});

// ── DELETE courier rate ──────────────────────────────────────
router.delete("/courier-rate/:index", protectCompanyUser, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const profile = await CompanyRate.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    profile.courierRates.splice(index, 1);
    await profile.save();
    res.json(profile.courierRates);
  } catch (err) {
    res.status(500).json({ message: "Failed to delete courier rate" });
  }
});

// ── ADD truck rate ───────────────────────────────────────────
router.post("/truck-rate", protectCompanyUser, async (req, res) => {
  try {
    let profile = await CompanyRate.findOne({ user: req.user._id });
    if (!profile) {
      profile = await CompanyRate.create({
        user: req.user._id,
        companyName: req.user.companyName,
        email: req.user.email,
        serviceModes: ["truck"],
      });
    }

    // Ensure truck is in serviceModes
    if (!profile.serviceModes.includes("truck")) {
      await CompanyRate.findOneAndUpdate(
        { user: req.user._id },
        { $addToSet: { serviceModes: "truck" } }
      );
    }

    profile = await CompanyRate.findOneAndUpdate(
      { user: req.user._id },
      { $push: { truckRates: req.body } },
      { new: true, runValidators: true }
    );
    res.json(profile.truckRates);
  } catch (err) {
    res.status(500).json({ message: "Failed to add truck rate" });
  }
});

// ── UPDATE truck rate ────────────────────────────────────────
router.patch("/truck-rate/:index", protectCompanyUser, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const profile = await CompanyRate.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    if (!profile.truckRates[index]) return res.status(404).json({ message: "Rate not found" });
    Object.assign(profile.truckRates[index], req.body);
    await profile.save();
    res.json(profile.truckRates);
  } catch (err) {
    res.status(500).json({ message: "Failed to update truck rate" });
  }
});

// ── DELETE truck rate ────────────────────────────────────────
router.delete("/truck-rate/:index", protectCompanyUser, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const profile = await CompanyRate.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    profile.truckRates.splice(index, 1);
    await profile.save();
    res.json(profile.truckRates);
  } catch (err) {
    res.status(500).json({ message: "Failed to delete truck rate" });
  }
});

// ── CUSTOMER SEARCH (public) ─────────────────────────────────
router.get("/search", async (req, res) => {
  try {
    const { serviceMode, vehicleType, zone, serviceLevel, region } = req.query;

    console.log("Search params received:", req.query);

    // Build query — only filter by serviceMode and region
    // vehicleType/zone/serviceLevel are filtered in JS after fetch
    const query = { isActive: true };

    if (serviceMode) {
      query.serviceModes = { $in: [serviceMode] };
    }

    // Only filter by region if provided and non-empty
    if (region && region.trim() !== "") {
      query.operatingRegions = { $in: [new RegExp(region.trim(), "i")] };
    }

    console.log("MongoDB query:", JSON.stringify(query));

    const profiles = await CompanyRate.find(query).lean();

    console.log(`Profiles found: ${profiles.length}`);

    const results = profiles
      .map((profile) => {
        let matchedRates = [];

        if (serviceMode === "courier") {
          matchedRates = profile.courierRates.filter((r) => {
            if (zone && zone !== "" && r.zone !== zone) return false;
            if (serviceLevel && serviceLevel !== "" && r.serviceLevel !== serviceLevel) return false;
            return true;
          });
        } else if (serviceMode === "truck") {
          matchedRates = profile.truckRates.filter((r) => {
            // If vehicleType is empty or "any", return all truck rates
            if (vehicleType && vehicleType !== "" && vehicleType !== "any") {
              if (r.vehicleType !== vehicleType) return false;
            }
            return true;
          });
        } else {
          // No serviceMode — return all rates
          matchedRates = [
            ...profile.courierRates,
            ...profile.truckRates,
          ];
        }

        console.log(`Company: ${profile.companyName} — matched rates: ${matchedRates.length}`);

        if (!matchedRates.length) return null;

        return {
          companyName:             profile.companyName,
          logoUrl:                 profile.logoUrl,
          description:             profile.description,
          phone:                   profile.phone,
          email:                   profile.email,
          website:                 profile.website,
          city:                    profile.city,
          province:                profile.province,
          insuranceIncluded:       profile.insuranceIncluded,
          trackingAvailable:       profile.trackingAvailable,
          weekendDelivery:         profile.weekendDelivery,
          dangerousGoodsSupported: profile.dangerousGoodsSupported,
          temperatureControlled:   profile.temperatureControlled,
          operatingRegions:        profile.operatingRegions,
          matchedRates,
        };
      })
      .filter(Boolean);

    console.log(`Results returned: ${results.length}`);

    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
});

module.exports = router;