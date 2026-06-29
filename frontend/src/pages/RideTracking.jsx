import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { io } from "socket.io-client";
import {
  FiNavigation2, FiStar, FiPhone, FiX, FiCheckCircle, FiMapPin,
} from "react-icons/fi";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const BASE = import.meta.env.VITE_BACKEND_URL;

const SERVICE_MAP = {
  uberGo:     "go",
  comfort:    "comfort",
  xl:         "xl",
  courierCar: "courier",
  waitSave:   "express",
};

const STATUS = {
  SEARCHING:   "searching",
  ACCEPTED:    "accepted",
  ARRIVED:     "arrived",
  IN_PROGRESS: "in_progress",
  COMPLETED:   "completed",
  NO_DRIVER:   "no_driver",
  CANCELLED:   "cancelled",
};

const RideTracking = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();

  // ── FIXED: your authSlice uses `user` not `userInfo` ──
  const { user } = useSelector((s) => s.auth);

  const mapContainer = useRef(null);
  const map          = useRef(null);
  const socketRef    = useRef(null);
  const driverMarker = useRef(null);
  const hasRequested = useRef(false); // prevent double requests

  const [rideStatus, setRideStatus] = useState(STATUS.SEARCHING);
  const [rideId,     setRideId]     = useState(null);
  const [driver,     setDriver]     = useState(null);
  const [error,      setError]      = useState("");
  const [,  setMapLoaded]  = useState(false);
  const [eta,        setEta]        = useState(null);

  const {
    serviceType, serviceLabel, price, distanceKm,
    pickupText, dropoffText, originCoords, destCoords,
    stopCoords = [], extraStops = [],
  } = state || {};

  /* ── Guard: no state = go back ── */
  useEffect(() => {
    if (!state?.originCoords) {
      navigate("/ride");
    }
  }, []);

  /* ── Guard: not logged in = go to login ── */
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);

  /* ── Map init ── */
  useEffect(() => {
    if (!state?.originCoords || map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style:     "mapbox://styles/mapbox/dark-v11",
      center:    originCoords,
      zoom:      14,
      attributionControl: false,
    });

    map.current.on("load", () => {
      setMapLoaded(true);

      const pickupEl = document.createElement("div");
      pickupEl.style.cssText = "width:16px;height:16px;border-radius:50%;background:#4ade80;border:3px solid white;box-shadow:0 0 0 4px rgba(74,222,128,0.3);";
      new mapboxgl.Marker({ element: pickupEl }).setLngLat(originCoords).addTo(map.current);

      const dropEl = document.createElement("div");
      dropEl.style.cssText = "width:16px;height:16px;border-radius:50%;background:#000042;border:3px solid white;box-shadow:0 0 0 4px rgba(0,0,66,0.3);";
      new mapboxgl.Marker({ element: dropEl }).setLngLat(destCoords).addTo(map.current);

      drawRoute();
    });

    return () => {
      if (map.current) { map.current.remove(); map.current = null; }
    };
  }, []);

  const drawRoute = async () => {
    if (!originCoords || !destCoords || !map.current) return;
    const validStops = (stopCoords || []).filter(Boolean);
    const parts = [
      `${originCoords[0]},${originCoords[1]}`,
      ...validStops.map((c) => `${c[0]},${c[1]}`),
      `${destCoords[0]},${destCoords[1]}`,
    ];
    try {
      const res   = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${parts.join(";")}?geometries=geojson&overview=full&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`);
      const data  = await res.json();
      const route = data.routes?.[0];
      if (!route || !map.current) return;

      map.current.addSource("route", { type: "geojson", data: { type: "Feature", geometry: route.geometry } });
      map.current.addLayer({ id: "route-glow", type: "line", source: "route", paint: { "line-color": "#4ade80", "line-width": 6, "line-opacity": 0.15 } });
      map.current.addLayer({ id: "routeLine",  type: "line", source: "route", paint: { "line-color": "#4ade80", "line-width": 3, "line-dasharray": [2, 2] } });

      const coords = route.geometry.coordinates;
      const bounds = coords.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coords[0], coords[0]));
      map.current.fitBounds(bounds, { padding: { top: 80, bottom: 320, left: 40, right: 40 } });
    } catch (err) {
      console.error("Route error:", err);
    }
  };

  /* ── Request ride — runs once on mount ── */
  useEffect(() => {
    if (!state?.originCoords || !user || hasRequested.current) return;
    hasRequested.current = true;
    requestRide();
  }, [user]);

  const requestRide = async () => {
    try {
      const res = await fetch(`${BASE}/api/rides/request`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${localStorage.getItem("userToken")}`,
        },
        body: JSON.stringify({
          serviceType:   SERVICE_MAP[serviceType] || "go",
          distanceKm:    distanceKm || 0,
          pickup:  { address: pickupText,  coordinates: originCoords },
          dropoff: { address: dropoffText, coordinates: destCoords },
          stops: (stopCoords || []).filter(Boolean).map((c, i) => ({
            address: extraStops[i] || "", coordinates: c,
          })),
          paymentMethod: "cash",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to request ride.");
        setRideStatus(STATUS.CANCELLED);
        return;
      }

      setRideId(data.ride._id);
      setupSocket(data.ride._id);

    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Connection error. Please try again.");
      setRideStatus(STATUS.CANCELLED);
    }
  };

  /* ── Socket setup ── */
  const setupSocket = (id) => {
    if (socketRef.current) socketRef.current.disconnect();

    socketRef.current = io(BASE, {
      auth: { token: localStorage.getItem("userToken") },
    });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("ride:join", { rideId: id });
      socketRef.current.emit("ride:new_request_internal", { rideId: id });
    });

    socketRef.current.on("ride:accepted", ({ driver: d }) => {
      setDriver(d);
      setRideStatus(STATUS.ACCEPTED);
      setEta("4 min");
    });

    socketRef.current.on("ride:driver_arrived", () => {
      setRideStatus(STATUS.ARRIVED);
      setEta(null);
    });

    socketRef.current.on("ride:started", () => {
      setRideStatus(STATUS.IN_PROGRESS);
    });

    socketRef.current.on("ride:completed", () => {
      setRideStatus(STATUS.COMPLETED);
    });

    socketRef.current.on("ride:cancelled", () => {
      setRideStatus(STATUS.CANCELLED);
    });

    socketRef.current.on("ride:no_driver", () => {
      setRideStatus(STATUS.NO_DRIVER);
    });

    socketRef.current.on("driver:location_update", ({ coordinates }) => {
      if (!map.current) return;
      if (driverMarker.current) {
        driverMarker.current.setLngLat(coordinates);
      } else {
        const el = document.createElement("div");
        el.style.cssText = "width:40px;height:40px;border-radius:50%;background:#000042;border:3px solid #4ade80;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px rgba(74,222,128,0.15);";
        el.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`;
        driverMarker.current = new mapboxgl.Marker({ element: el })
          .setLngLat(coordinates)
          .addTo(map.current);
      }
    });
  };

  /* ── Cleanup socket on unmount ── */
  useEffect(() => {
    return () => socketRef.current?.disconnect();
  }, []);

  /* ── Cancel ── */
  const handleCancel = async () => {
    if (!rideId) { navigate(-1); return; }
    try {
      await fetch(`${BASE}/api/rides/${rideId}/cancel`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("userToken")}` },
        body: JSON.stringify({ cancelledBy: "customer", reason: "Customer cancelled" }),
      });
    } catch (err) {
      console.error(err);
    }
    setRideStatus(STATUS.CANCELLED);
    socketRef.current?.disconnect();
  };

  /* ── Try again ── */
  const handleRetry = () => {
    hasRequested.current = false;
    setError("");
    setRideStatus(STATUS.SEARCHING);
    setRideId(null);
    setDriver(null);
    requestRide();
  };

  if (!state?.originCoords) return null;

  return (
    <div className="relative h-[100dvh] w-full font-poppins overflow-hidden">

      {/* FULL SCREEN MAP */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)" }} />

      {/* TOP BAR */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-6">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-md max-w-sm mx-auto"
          style={{ backgroundColor: "rgba(0,0,10,0.75)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
              <p className="text-white/60 text-[10px] truncate">{pickupText?.split(",")[0]}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
              <p className="text-white/60 text-[10px] truncate">{dropoffText?.split(",")[0]}</p>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-white font-black text-base">R{price}</p>
            <p className="text-white/40 text-[10px]">{serviceLabel}</p>
          </div>
        </div>
      </div>

      {/* BOTTOM SHEET */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div
          className="rounded-t-3xl overflow-hidden"
          style={{ backgroundColor: "rgba(0,0,10,0.92)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* Status bar */}
          <div
            className="h-1 w-full"
            style={{
              backgroundColor:
                rideStatus === STATUS.COMPLETED ? "#4ade80" :
                rideStatus === STATUS.CANCELLED || rideStatus === STATUS.NO_DRIVER ? "#ef4444" :
                "#4ade80",
            }}
          />

          <div className="px-5 pt-5 pb-10">

            {/* ── SEARCHING ── */}
            {rideStatus === STATUS.SEARCHING && (
              <div className="flex flex-col items-center text-center py-4">
                <div className="relative w-20 h-20 mb-5">
                  <div
                    className="absolute inset-0 rounded-full animate-spin"
                    style={{ border: "3px solid rgba(74,222,128,0.15)", borderTopColor: "#4ade80" }}
                  />
                  <div
                    className="absolute inset-3 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(74,222,128,0.1)" }}
                  >
                    <FiNavigation2 size={24} style={{ color: "#4ade80" }} />
                  </div>
                </div>
                <p className="text-white font-bold text-lg mb-1">Finding your driver</p>
                <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Searching for {serviceLabel} nearby...
                </p>
                <div className="flex gap-1 mb-6">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>

                {/* Trip summary */}
                <div
                  className="w-full rounded-2xl p-4 mb-5 text-left"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                      Trip summary
                    </p>
                    <p className="text-white font-black">R{price}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                      <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.6)" }}>{pickupText}</p>
                    </div>
                    <div className="ml-1 w-px h-3 bg-white/10" />
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                      <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.6)" }}>{dropoffText}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{distanceKm?.toFixed(1)} km</p>
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Cash payment</p>
                  </div>
                </div>

                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                  style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <FiX size={14} /> Cancel ride
                </button>
              </div>
            )}

            {/* ── ACCEPTED / ARRIVED ── */}
            {(rideStatus === STATUS.ACCEPTED || rideStatus === STATUS.ARRIVED) && driver && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#4ade80" }}>
                      {rideStatus === STATUS.ARRIVED ? "Driver arrived" : "Driver on the way"}
                    </p>
                    <p className="text-white font-bold text-lg">
                      {rideStatus === STATUS.ARRIVED ? "Head to your pickup" : eta ? `Arriving in ${eta}` : "Heading to you"}
                    </p>
                  </div>
                  {rideStatus === STATUS.ARRIVED && (
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(74,222,128,0.15)" }}>
                      <FiCheckCircle size={20} style={{ color: "#4ade80" }} />
                    </div>
                  )}
                </div>

                {/* Driver card */}
                <div
                  className="rounded-2xl p-4 mb-4"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #000042, #1a3a7a)" }}
                    >
                      {driver.name?.charAt(0) || "D"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-base">{driver.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <FiStar size={11} className="text-amber-400" />
                        <span className="text-xs font-semibold text-amber-400">
                          {driver.rating?.average?.toFixed(1) || "5.0"}
                        </span>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                          ({driver.rating?.count || 0} trips)
                        </span>
                      </div>
                      {driver.vehicle && (
                        <p className="text-xs mt-1 truncate" style={{ color: "rgba(255,255,255,0.5)" }}>
                          {driver.vehicle.color} {driver.vehicle.make} {driver.vehicle.model}
                        </p>
                      )}
                    </div>
                    {driver.vehicle?.plate && (
                      <div
                        className="px-3 py-1.5 rounded-xl text-xs font-black text-white flex-shrink-0"
                        style={{ backgroundColor: "rgba(255,255,255,0.1)", letterSpacing: "2px" }}
                      >
                        {driver.vehicle.plate}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {driver.phone && (
                    
                      <a href={`tel:${driver.phone}`}
                      className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition"
                      style={{ backgroundColor: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}
                    >
                      <FiPhone size={15} /> Call driver
                    </a>
                  )}
                  <button
                    onClick={handleCancel}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition"
                    style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)" }}
                  >
                    <FiX size={15} /> Cancel
                  </button>
                </div>

                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                >
                  <div className="flex items-center gap-1.5">
                    <FiMapPin size={12} style={{ color: "rgba(255,255,255,0.4)" }} />
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{distanceKm?.toFixed(1)} km</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white">R{price}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>· Cash</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── IN PROGRESS ── */}
            {rideStatus === STATUS.IN_PROGRESS && driver && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#60a5fa" }}>
                  Trip in progress
                </p>
                <p className="text-white font-bold text-lg mb-4">
                  On your way to {dropoffText?.split(",")[0]}
                </p>
                <div
                  className="rounded-2xl p-4 mb-4"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #000042, #1a3a7a)" }}
                    >
                      {driver.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm">{driver.name}</p>
                      {driver.vehicle?.plate && (
                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "1px" }}>
                          {driver.vehicle.plate}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      <p className="text-xs font-bold text-blue-400">Live</p>
                    </div>
                  </div>
                </div>
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                >
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{distanceKm?.toFixed(1)} km total</p>
                  <p className="text-white font-bold text-sm">R{price}</p>
                </div>
              </div>
            )}

            {/* ── COMPLETED ── */}
            {rideStatus === STATUS.COMPLETED && (
              <div className="flex flex-col items-center text-center py-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                  style={{ backgroundColor: "rgba(74,222,128,0.15)", border: "2px solid rgba(74,222,128,0.3)" }}
                >
                  <FiCheckCircle size={36} style={{ color: "#4ade80" }} />
                </div>
                <p className="text-white font-black text-xl mb-1">You have arrived!</p>
                <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {dropoffText?.split(",")[0]}
                </p>
                <p className="text-2xl font-black mb-6" style={{ color: "#4ade80" }}>R{price}</p>
                {driver && (
                  <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Thanks for riding with {driver.name}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    onClick={() => navigate("/ride")}
                    className="py-3.5 rounded-2xl text-sm font-bold transition"
                    style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    Book again
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="py-3.5 rounded-2xl text-sm font-bold transition hover:opacity-90"
                    style={{ backgroundColor: "#4ade80", color: "#000042" }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* ── NO DRIVER / CANCELLED ── */}
            {(rideStatus === STATUS.NO_DRIVER || rideStatus === STATUS.CANCELLED) && (
              <div className="flex flex-col items-center text-center py-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <FiX size={28} style={{ color: "#f87171" }} />
                </div>
                <p className="text-white font-bold text-lg mb-2">
                  {rideStatus === STATUS.NO_DRIVER ? "No drivers available" : "Ride cancelled"}
                </p>
                <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {rideStatus === STATUS.NO_DRIVER
                    ? "No drivers found nearby. Please try again."
                    : error || "Your ride has been cancelled."}
                </p>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    onClick={() => navigate(-1)}
                    className="py-3.5 rounded-2xl text-sm font-bold transition"
                    style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    Go back
                  </button>
                  <button
                    onClick={handleRetry}
                    className="py-3.5 rounded-2xl text-sm font-bold transition hover:opacity-90"
                    style={{ backgroundColor: "#4ade80", color: "#000042" }}
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default RideTracking;