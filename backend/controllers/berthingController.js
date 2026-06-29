const mongoose = require("mongoose");
const Berthing = require("../models/Berthing");
const Vessel = require("../models/Vessel");
const generateBerthingNumber = require("../utils/generateBerthingNumber");
const SADC_PORTS = require("../constants/sadcPorts");

const findPortDetails = (portCode) => {
  return SADC_PORTS.find(
    (port) => port.portCode.toUpperCase() === portCode.toUpperCase()
  );
};

const createBerthing = async (req, res) => {
  try {
    const {
      vessel,
      previousPortOfDeparture,
      destinationCountry,
      destinationPortCode,
      estimatedDateOfBerthing,
      estimatedTimeOfBerthing,
      containersToDischarge,
      containersToLoad,
      berthingShed,
      comments,
      status,
      actualDateOfBerthing,
      actualTimeOfBerthing,
      departureDate,
      departureTime,
    } = req.body;

    const vesselExists = await Vessel.findById(vessel).lean();
    if (!vesselExists) {
      return res.status(404).json({ message: "Selected vessel not found." });
    }

    const port = findPortDetails(destinationPortCode);
    if (!port) {
      return res.status(400).json({ message: "Invalid destination port code." });
    }

    const { berthingNumber, berthingSequence } =
      await generateBerthingNumber(destinationPortCode);

    const berthing = await Berthing.create({
      vessel,
      previousPortOfDeparture,
      destinationCountry: destinationCountry || port.country,
      destinationPortCode: port.portCode,
      destinationPortName: port.portName,
      estimatedDateOfBerthing,
      estimatedTimeOfBerthing,
      containersToDischarge,
      containersToLoad,
      berthingShed,
      comments,
      status,
      actualDateOfBerthing,
      actualTimeOfBerthing,
      departureDate,
      departureTime,
      berthingNumber,
      berthingSequence,
      lastUpdatedAt: new Date(),
    });

    const populated = await Berthing.findById(berthing._id)
      .populate("vessel", "vesselName slug imo mmsi callSign")
      .lean();

    res.status(201).json(populated);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create berthing.", error: error.message });
  }
};

const getAllBerthings = async (req, res) => {
  try {
    const vesselSearch = (req.query.vesselSearch || "").trim();
    const generalSearch = (req.query.generalSearch || "").trim();
    const country = (req.query.country || "").trim();
    const portCode = (req.query.portCode || "").trim().toUpperCase();
    const terminal = (req.query.terminal || "").trim();
    const vesselId = (req.query.vesselId || "").trim();
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);

    const today = new Date();

    const from = new Date(today);
    from.setDate(today.getDate() - 7);
    from.setHours(0, 0, 0, 0);

    const to = new Date(today);
    to.setDate(today.getDate() + 21);
    to.setHours(23, 59, 59, 999);

    const query = {
      estimatedDateOfBerthing: { $gte: from, $lte: to },
    };

    if (country) query.destinationCountry = country;
    if (portCode) query.destinationPortCode = portCode;
    if (terminal) query.berthingShed = terminal;

    if (vesselId && mongoose.Types.ObjectId.isValid(vesselId)) {
      query.vessel = vesselId;
    }

    if (vesselSearch) {
      const vesselRegex = new RegExp(vesselSearch, "i");

      const matchingVessels = await Vessel.find({
        $or: [
          { vesselName: vesselRegex },
          { imo: vesselRegex },
          { mmsi: vesselRegex },
          { callSign: vesselRegex },
        ],
      })
        .select("_id")
        .limit(200)
        .lean();

      const vesselIds = matchingVessels.map((v) => v._id);

      query.$or = [
        { vessel: { $in: vesselIds } },
        { berthingNumber: vesselRegex },
      ];
    }

    if (generalSearch) {
      const generalRegex = new RegExp(generalSearch, "i");

      const matchingVessels = await Vessel.find({
        vesselName: generalRegex,
      })
        .select("_id")
        .limit(200)
        .lean();

      const vesselIds = matchingVessels.map((v) => v._id);

      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { destinationCountry: generalRegex },
          { destinationPortCode: generalRegex },
          { destinationPortName: generalRegex },
          { previousPortOfDeparture: generalRegex },
          { berthingShed: generalRegex },
          { comments: generalRegex },
          { vessel: { $in: vesselIds } },
        ],
      });
    }

    const berthings = await Berthing.find(query)
      .select(
        [
          "vessel",
          "berthingNumber",
          "estimatedDateOfBerthing",
          "estimatedTimeOfBerthing",
          "containersToDischarge",
          "containersToLoad",
          "berthingShed",
          "comments",
          "status",
          "destinationCountry",
          "destinationPortCode",
          "destinationPortName",
          "previousPortOfDeparture",
          "lastUpdatedAt",
        ].join(" ")
      )
      .populate("vessel", "vesselName slug imo mmsi callSign")
      .sort({ estimatedDateOfBerthing: 1, estimatedTimeOfBerthing: 1 })
      .limit(limit)
      .lean();

    let lastUpdatedAt = null;

    if (berthings.length > 0) {
      lastUpdatedAt = berthings.reduce((latest, item) => {
        const current = item.lastUpdatedAt
          ? new Date(item.lastUpdatedAt).getTime()
          : 0;
        return current > latest ? current : latest;
      }, 0);
    }

    res.json({
      lastUpdatedAt,
      count: berthings.length,
      results: berthings,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch berthings.",
      error: error.message,
    });
  }
};

const getBerthingById = async (req, res) => {
  try {
    const berthing = await Berthing.findById(req.params.id)
      .populate("vessel", "vesselName slug imo mmsi callSign")
      .lean();

    if (!berthing) {
      return res.status(404).json({ message: "Berthing not found." });
    }

    res.json(berthing);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch berthing.", error: error.message });
  }
};

const updateBerthing = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      lastUpdatedAt: new Date(),
    };

    if (updateData.destinationPortCode) {
      const port = findPortDetails(updateData.destinationPortCode);
      if (!port) {
        return res.status(400).json({ message: "Invalid destination port code." });
      }

      updateData.destinationCountry = port.country;
      updateData.destinationPortName = port.portName;
      updateData.destinationPortCode = port.portCode;
    }

    const berthing = await Berthing.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("vessel", "vesselName slug imo mmsi callSign")
      .lean();

    if (!berthing) {
      return res.status(404).json({ message: "Berthing not found." });
    }

    res.json(berthing);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update berthing.", error: error.message });
  }
};

const deleteBerthing = async (req, res) => {
  try {
    const berthing = await Berthing.findById(req.params.id);
    if (!berthing) {
      return res.status(404).json({ message: "Berthing not found." });
    }

    await berthing.deleteOne();
    res.json({ message: "Berthing deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete berthing.", error: error.message });
  }
};

const getBerthingsByPort = async (req, res) => {
  try {
    const { country, portCode } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);

    const today = new Date();

    const from = new Date(today);
    from.setDate(today.getDate() - 7);
    from.setHours(0, 0, 0, 0);

    const to = new Date(today);
    to.setDate(today.getDate() + 21);
    to.setHours(23, 59, 59, 999);

    const results = await Berthing.find({
      destinationCountry: decodeURIComponent(country),
      destinationPortCode: portCode.toUpperCase(),
      estimatedDateOfBerthing: { $gte: from, $lte: to },
    })
      .select(
        "vessel berthingNumber estimatedDateOfBerthing estimatedTimeOfBerthing containersToDischarge containersToLoad berthingShed comments status lastUpdatedAt"
      )
      .populate("vessel", "vesselName slug imo mmsi callSign")
      .sort({ estimatedDateOfBerthing: 1, estimatedTimeOfBerthing: 1 })
      .limit(limit)
      .lean();

    res.json(results);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch port berthings.", error: error.message });
  }
};

const getVesselVisitHistory = async (req, res) => {
  try {
    const history = await Berthing.find({ vessel: req.params.vesselId })
      .select(
        "vessel berthingNumber destinationCountry destinationPortCode destinationPortName estimatedDateOfBerthing estimatedTimeOfBerthing actualDateOfBerthing actualTimeOfBerthing departureDate departureTime status berthingShed comments containersToDischarge containersToLoad lastUpdatedAt"
      )
      .populate("vessel", "vesselName slug imo mmsi callSign")
      .sort({ estimatedDateOfBerthing: -1 })
      .lean();

    res.json(history);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch vessel history.", error: error.message });
  }
};

module.exports = {
  createBerthing,
  getAllBerthings,
  getBerthingById,
  updateBerthing,
  deleteBerthing,
  getBerthingsByPort,
  getVesselVisitHistory,
};