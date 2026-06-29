const VesselAlert = require("../models/VesselAlert");
const Vessel = require("../models/Vessel");
const Berthing = require("../models/Berthing");

const combineDateAndTime = (dateValue, timeValue) => {
  if (!dateValue) return null;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  let hours = 0;
  let minutes = 0;

  if (timeValue && typeof timeValue === "string") {
    const [h, m] = timeValue.split(":");
    hours = Number(h || 0);
    minutes = Number(m || 0);
  }

  date.setHours(hours, minutes, 0, 0);
  return date;
};

const createVesselBerthAlert = async (req, res) => {
  try {
    const { vesselId, berthingId } = req.body;

    if (!vesselId) {
      return res.status(400).json({ message: "vesselId is required" });
    }

    const vessel = await Vessel.findById(vesselId);
    if (!vessel) {
      return res.status(404).json({ message: "Vessel not found" });
    }

    let berthing = null;

    if (berthingId) {
      berthing = await Berthing.findById(berthingId);
      if (!berthing) {
        return res.status(404).json({ message: "Berthing record not found" });
      }
    } else {
      berthing = await Berthing.findOne({ vessel: vesselId }).sort({ createdAt: -1 });
    }

    if (!berthing) {
      return res.status(404).json({ message: "No berthing record found for this vessel" });
    }

    const scheduledFor = combineDateAndTime(
      berthing.actualDateOfBerthing || berthing.estimatedDateOfBerthing,
      berthing.actualTimeOfBerthing || berthing.estimatedTimeOfBerthing
    );

    if (!scheduledFor) {
      return res.status(400).json({
        message: "This vessel does not have a valid berthing date/time yet",
      });
    }

    const alert = await VesselAlert.findOneAndUpdate(
      {
        user: req.user._id,
        vessel: vessel._id,
        berthing: berthing._id,
        alertType: "berth_reached",
      },
      {
        user: req.user._id,
        vessel: vessel._id,
        berthing: berthing._id,
        alertType: "berth_reached",
        scheduledFor,
        isSent: false,
        sentAt: null,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(201).json({
      message: "Vessel berth alert created successfully",
      alert,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create vessel alert",
      error: error.message,
    });
  }
};

const getMyVesselAlerts = async (req, res) => {
  try {
    const alerts = await VesselAlert.find({ user: req.user._id })
      .populate("vessel", "vesselName name")
      .populate("berthing")
      .sort({ createdAt: -1 });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch vessel alerts",
      error: error.message,
    });
  }
};

const deleteVesselBerthAlert = async (req, res) => {
  try {
    const alert = await VesselAlert.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json({ message: "Alert removed successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove vessel alert",
      error: error.message,
    });
  }
};

module.exports = {
  createVesselBerthAlert,
  getMyVesselAlerts,
  deleteVesselBerthAlert,
};