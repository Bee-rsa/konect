const Vessel = require("../models/Vessel");
const Berthing = require("../models/Berthing");

const createVessel = async (req, res) => {
  try {
    const existingIMO = await Vessel.findOne({ imo: req.body.imo.trim() });
    if (existingIMO) {
      return res.status(400).json({ message: "Vessel with this IMO already exists." });
    }

    if (req.body.mmsi) {
      const existingMMSI = await Vessel.findOne({ mmsi: req.body.mmsi.trim() });
      if (existingMMSI) {
        return res.status(400).json({ message: "Vessel with this MMSI already exists." });
      }
    }

    const vessel = await Vessel.create(req.body);
    res.status(201).json(vessel);
  } catch (error) {
    res.status(500).json({ message: "Failed to create vessel.", error: error.message });
  }
};

const getAllVessels = async (_req, res) => {
  try {
    const vessels = await Vessel.find().sort({ updatedAt: -1 });
    res.json(vessels);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vessels.", error: error.message });
  }
};

const searchVessels = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json([]);

    const regex = new RegExp(q, "i");

    const directMatches = await Vessel.find({
      $or: [
        { vesselName: regex },
        { imo: regex },
        { mmsi: regex },
        { callSign: regex },
        { vesselType: regex },
        { operator: regex },
      ],
    })
      .select(
        "vesselName vesselType imo mmsi callSign operator slug flagCountry flagCode vesselImage updatedAt"
      )
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    const berthingMatches = await Berthing.find({
      berthingNumber: regex,
    })
      .select("vessel")
      .limit(20)
      .lean();

    const berthingVesselIds = berthingMatches
      .map((item) => item.vessel)
      .filter(Boolean);

    let berthingNumberMatches = [];

    if (berthingVesselIds.length > 0) {
      berthingNumberMatches = await Vessel.find({
        _id: { $in: berthingVesselIds },
      })
        .select(
          "vesselName vesselType imo mmsi callSign operator slug flagCountry flagCode vesselImage updatedAt"
        )
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean();
    }

    const merged = [...directMatches, ...berthingNumberMatches];

    const unique = merged.filter(
      (item, index, arr) =>
        item?._id &&
        index === arr.findIndex((v) => String(v?._id) === String(item._id))
    );

    res.json(unique);
  } catch (error) {
    res.status(500).json({ message: "Failed to search vessels.", error: error.message });
  }
};

const getVesselById = async (req, res) => {
  try {
    const vessel = await Vessel.findById(req.params.id);
    if (!vessel) return res.status(404).json({ message: "Vessel not found." });

    res.json(vessel);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vessel.", error: error.message });
  }
};

const getVesselBySlug = async (req, res) => {
  try {
    const vessel = await Vessel.findOne({ slug: req.params.slug });
    if (!vessel) return res.status(404).json({ message: "Vessel not found." });

    const visits = await Berthing.find({ vessel: vessel._id })
      .sort({ estimatedDateOfBerthing: -1 })
      .lean();

    res.json({ vessel, visits });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vessel.", error: error.message });
  }
};

const updateVessel = async (req, res) => {
  try {
    const vessel = await Vessel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!vessel) return res.status(404).json({ message: "Vessel not found." });

    res.json(vessel);
  } catch (error) {
    res.status(500).json({ message: "Failed to update vessel.", error: error.message });
  }
};

const deleteVessel = async (req, res) => {
  try {
    const vessel = await Vessel.findById(req.params.id);
    if (!vessel) return res.status(404).json({ message: "Vessel not found." });

    await Berthing.deleteMany({ vessel: vessel._id });
    await vessel.deleteOne();

    res.json({ message: "Vessel and related berthings deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete vessel.", error: error.message });
  }
};

module.exports = {
  createVessel,
  getAllVessels,
  searchVessels,
  getVesselById,
  getVesselBySlug,
  updateVessel,
  deleteVessel,
};