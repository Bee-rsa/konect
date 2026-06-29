const VesselAlert = require("../models/VesselAlert");
const Vessel = require("../models/Vessel");
const Berthing = require("../models/Berthing");
const Notification = require("../models/Notification");

const runVesselBerthNotificationJob = async () => {
  try {
    const now = new Date();

    const dueAlerts = await VesselAlert.find({
      alertType: "berth_reached",
      isSent: false,
      scheduledFor: { $lte: now },
    });

    for (const alert of dueAlerts) {
      const vessel = await Vessel.findById(alert.vessel).lean();
      const berthing = alert.berthing
        ? await Berthing.findById(alert.berthing).lean()
        : null;

      const vesselName =
        vessel?.vesselName || vessel?.name || "Vessel";

      const berthDate = alert.scheduledFor
        ? new Date(alert.scheduledFor).toLocaleString()
        : "the scheduled berth time";

      await Notification.create({
        category: "Vessel Berthing Updates",
        title: `${vesselName} has berthed`,
        message: `${vesselName} has reached berth as of ${berthDate}.`,
        image: "",
        sentBy: null,
        target: "user",
        targetUser: alert.user,
        readBy: [],
      });

      alert.isSent = true;
      alert.sentAt = new Date();
      await alert.save();
    }
  } catch (error) {
    console.error("Vessel berth notification job failed:", error);
  }
};

module.exports = runVesselBerthNotificationJob;