const Driver = require("../models/Driver");
const Ride   = require("../models/Ride");

const INITIAL_RADIUS_KM  = 5;
const MAX_RADIUS_KM      = 20;
const RADIUS_EXPAND_KM   = 5;
const REQUEST_TIMEOUT_MS = 30000; // 30s per attempt
const MAX_DRIVERS_NOTIFIED = 3;

/**
 * Find nearest available drivers for a ride
 */
const findNearbyDrivers = async (coordinates, serviceType, radiusKm, excludeIds = []) => {
  return Driver.find({
    status:   "online",
    isActive: true,
    services: serviceType,
    _id:      { $nin: excludeIds },
    location: {
      $geoWithin: {
        $centerSphere: [coordinates, radiusKm / 6378.1],
      },
    },
  })
  .sort({ "rating.average": -1 }) // prefer higher-rated drivers
  .limit(MAX_DRIVERS_NOTIFIED)
  .select("_id firstName lastName vehicle rating location phone profilePhoto");
};

/**
 * Main matching function — called from Socket.io handler
 * io        : socket.io server instance
 * rideId    : string
 */
const matchRide = async (io, rideId) => {
  const ride = await Ride.findById(rideId);
  if (!ride || ride.status !== "searching") return;

  const pickupCoords  = ride.pickup.coordinates; // [lng, lat]
  let   radiusKm      = INITIAL_RADIUS_KM;
  let   notifiedIds   = [];
  let   matched       = false;

  while (radiusKm <= MAX_RADIUS_KM && !matched) {

    const drivers = await findNearbyDrivers(
      pickupCoords,
      ride.serviceType,
      radiusKm,
      notifiedIds
    );

    if (!drivers.length) {
      radiusKm += RADIUS_EXPAND_KM;
      await Ride.findByIdAndUpdate(rideId, {
        searchRadiusKm: radiusKm,
        $inc: { matchAttempts: 1 },
      });
      continue;
    }

    // Track who we notified
    notifiedIds = [...notifiedIds, ...drivers.map((d) => d._id)];
    await Ride.findByIdAndUpdate(rideId, {
      $addToSet: { driversNotified: { $each: drivers.map((d) => d._id) } },
    });

    // Emit request to each driver's socket room
    drivers.forEach((driver) => {
      io.to(`driver:${driver._id}`).emit("ride:new_request", {
        rideId:      ride._id,
        serviceType: ride.serviceType,
        pickup:      ride.pickup,
        dropoff:     ride.dropoff,
        distanceKm:  ride.distanceKm,
        fare:        ride.fare,
        timeout:     REQUEST_TIMEOUT_MS,
      });
    });

    // Wait for acceptance or timeout
    matched = await waitForAcceptance(ride._id, REQUEST_TIMEOUT_MS);

    if (!matched) {
      radiusKm += RADIUS_EXPAND_KM;
    }
  }

  // If still no match after all attempts
  if (!matched) {
    await Ride.findByIdAndUpdate(rideId, { status: "no_driver" });
    io.to(`ride:${rideId}`).emit("ride:no_driver", { rideId });
  }
};

/**
 * Poll DB every 2s to check if ride was accepted
 */
const waitForAcceptance = (rideId, timeoutMs) => {
  return new Promise((resolve) => {
    const interval = 2000;
    let   elapsed  = 0;

    const timer = setInterval(async () => {
      elapsed += interval;
      const ride = await Ride.findById(rideId).select("status");

      if (ride?.status === "accepted") {
        clearInterval(timer);
        resolve(true);
      } else if (elapsed >= timeoutMs) {
        clearInterval(timer);
        resolve(false);
      }
    }, interval);
  });
};

module.exports = { matchRide, findNearbyDrivers };