import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  toggleDriverStatus,
  fetchDriverProfile,
  updateDriverLocation,
  logoutDriver,
} from "../../redux/slices/driverSlice";
import { io } from "socket.io-client";
import {
  FiTruck, FiStar, FiDollarSign,
  FiMapPin, FiClock, FiChevronRight,
  FiUser, FiSettings, FiLogOut, FiAlertCircle,
  FiCheck, FiX, FiUsers
} from "react-icons/fi";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const DriverHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { driver } = useSelector((s) => s.driver);

  const socketRef   = useRef(null);
  const locationRef = useRef(null);

  const [incomingRide,    setIncomingRide]    = useState(null);
  const [rideTimer,       setRideTimer]       = useState(30);
  const [activeRide,      setActiveRide]      = useState(null);
  const [togglingStatus,  setTogglingStatus]  = useState(false);
  const [accepting,       setAccepting]       = useState(false);

  /* ── Redirect ── */
  useEffect(() => {
    if (!driver) navigate("/driver-login");
  }, [driver, navigate]);

  /* ── Fetch profile ── */
  useEffect(() => {
    dispatch(fetchDriverProfile());
  }, [dispatch]);

  /* ── Socket ── */
  useEffect(() => {
    if (!driver?._id) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("driverToken") },
    });

    socketRef.current.emit("driver:join", { driverId: driver._id });

    socketRef.current.on("ride:new_request", (data) => {
      setIncomingRide(data);
      setRideTimer(30);
    });

    return () => socketRef.current?.disconnect();
  }, [driver?._id]);

  /* ── Countdown ── */
  useEffect(() => {
    if (!incomingRide) return;
    if (rideTimer <= 0) {
      setIncomingRide(null);
      return;
    }
    const t = setInterval(() => setRideTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [incomingRide, rideTimer]);

  /* ── GPS ping ── */
  useEffect(() => {
    if (driver?.status !== "online") {
      clearInterval(locationRef.current);
      return;
    }
    const ping = () => {
      navigator.geolocation?.getCurrentPosition(({ coords }) => {
        dispatch(updateDriverLocation({ lng: coords.longitude, lat: coords.latitude }));
        socketRef.current?.emit("driver:location_update", {
          driverId:    driver._id,
          coordinates: [coords.longitude, coords.latitude],
        });
      });
    };
    ping();
    locationRef.current = setInterval(ping, 10000);
    return () => clearInterval(locationRef.current);
  }, [driver?.status, driver?._id, dispatch]);

  const handleToggleStatus = async () => {
    setTogglingStatus(true);
    await dispatch(toggleDriverStatus());
    await dispatch(fetchDriverProfile());
    setTogglingStatus(false);
  };

  const handleAcceptRide = async () => {
    if (!incomingRide || accepting) return;
    setAccepting(true);
    try {
      const res = await fetch(
        `${SOCKET_URL}/api/rides/${incomingRide.rideId}/accept`,
        {
          method:  "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization:  `Bearer ${localStorage.getItem("driverToken")}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setActiveRide(data.ride);
        setIncomingRide(null);
        socketRef.current?.emit("ride:join", { rideId: incomingRide.rideId });
      }
    } catch (err) {
      console.error("Accept ride error:", err);
    } finally {
      setAccepting(false);
    }
  };

  const handleDeclineRide = () => {
    socketRef.current?.emit("ride:decline", {
      rideId:   incomingRide.rideId,
      driverId: driver._id,
    });
    setIncomingRide(null);
  };

  const handleRideAction = async (action) => {
    if (!activeRide) return;
    try {
      await fetch(`${SOCKET_URL}/api/rides/${activeRide._id}/${action}`, {
        method:  "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${localStorage.getItem("driverToken")}`,
        },
      });
      if (action === "complete") {
        setActiveRide(null);
        await dispatch(fetchDriverProfile());
      }
    } catch (err) {
      console.error(`${action} ride error:`, err);
    }
  };

  const isOnline  = driver?.status === "online";
  const isOnTrip  = driver?.status === "on_trip";
  const isPending = driver?.status === "pending";

  if (!driver) return null;

  /* ════════════════════════════════════════
     INCOMING RIDE — full screen takeover
  ════════════════════════════════════════ */
  if (incomingRide) {
    return (
      <div
        className="fixed inset-0 z-50 font-poppins flex flex-col"
        style={{ background: "linear-gradient(160deg, #000042 0%, #0a1a5c 60%, #1a3a7a 100%)" }}
      >
        {/* Animated background dots */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize:  "28px 28px",
          }}
        />

        {/* Top bar */}
        <div className="relative z-10 px-6 pt-10 pb-6 flex items-center justify-between">
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-1"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Incoming ride request
            </p>
            <p className="text-white font-bold text-lg">New ride for you</p>
          </div>

          {/* Countdown ring */}
          <div className="relative w-16 h-16">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
              <circle
                cx="28" cy="28" r="24"
                fill="none"
                stroke={rideTimer > 10 ? "#4ade80" : "#ef4444"}
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - rideTimer / 30)}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <p
                className="text-xl font-black"
                style={{ color: rideTimer > 10 ? "#4ade80" : "#ef4444" }}
              >
                {rideTimer}
              </p>
            </div>
          </div>
        </div>

        {/* Fare — hero number */}
        <div className="relative z-10 px-6 mb-6">
          <div
            className="rounded-3xl p-6"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              Estimated fare
            </p>
            <p className="text-5xl font-black text-white mb-1">
              R{incomingRide.fare?.total?.toFixed(2) || "—"}
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              {incomingRide.serviceType} · Cash payment
            </p>
          </div>
        </div>

        {/* Route */}
        <div className="relative z-10 px-6 mb-6">
          <div
            className="rounded-3xl p-5"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
              Route
            </p>

            <div className="flex gap-4">
              {/* Dot line */}
              <div className="flex flex-col items-center pt-1 flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="w-px flex-1 my-2" style={{ backgroundColor: "rgba(255,255,255,0.15)", minHeight: "2rem" }} />
                <div className="w-3 h-3 rounded-full bg-red-400" />
              </div>

              {/* Addresses */}
              <div className="flex-1 min-w-0 flex flex-col justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Pickup
                  </p>
                  <p className="text-sm font-semibold text-white leading-snug">
                    {incomingRide.pickup?.address || "Pickup location"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Dropoff
                  </p>
                  <p className="text-sm font-semibold text-white leading-snug">
                    {incomingRide.dropoff?.address || "Dropoff location"}
                  </p>
                </div>
              </div>
            </div>

            {/* Meta chips */}
            <div className="flex gap-3 mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
              >
                <FiMapPin size={11} />
                {incomingRide.distanceKm?.toFixed(1) || "—"} km
              </div>
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
              >
                <FiTruck size={11} />
                {incomingRide.serviceType}
              </div>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Accept / Decline buttons */}
        <div className="relative z-10 px-6 pb-12 space-y-3">
          <button
            onClick={handleAcceptRide}
            disabled={accepting}
            className="w-full h-16 rounded-2xl text-base font-black transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-3"
            style={{ backgroundColor: "#4ade80", color: "#000042" }}
          >
            {accepting ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <FiCheck size={20} /> Accept ride
              </>
            )}
          </button>

          <button
            onClick={handleDeclineRide}
            className="w-full h-14 rounded-2xl text-sm font-bold transition flex items-center justify-center gap-2"
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
              color:           "rgba(255,255,255,0.6)",
              border:          "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <FiX size={16} /> Decline
          </button>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════
     NORMAL DASHBOARD
  ════════════════════════════════════════ */
  return (
    <div className="min-h-screen font-poppins" style={{ backgroundColor: "#f5f5f4" }}>

      {/* TOP NAV */}
      <div
        className="w-full px-5 py-4 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #000042 0%, #1a3a7a 100%)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-sm">
            {driver.firstName?.charAt(0)}{driver.lastName?.charAt(0)}
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-tight">
              {driver.firstName} {driver.lastName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: isOnline ? "#4ade80" : isOnTrip ? "#60a5fa" : isPending ? "#fb923c" : "#94a3b8",
                }}
              />
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                {isOnline ? "Online" : isOnTrip ? "On trip" : isPending ? "Pending approval" : "Offline"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/driver/settings"
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition"
          >
            <FiSettings size={15} />
          </Link>
          <button
            onClick={() => { dispatch(logoutDriver()); navigate("/driver-login"); }}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition"
          >
            <FiLogOut size={15} />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* PENDING BANNER */}
        {isPending && (
          <div
            className="rounded-2xl px-5 py-4 flex items-start gap-3"
            style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}
          >
            <FiAlertCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: "#C2410C" }} />
            <div>
              <p className="text-sm font-bold" style={{ color: "#C2410C" }}>Account pending approval</p>
              <p className="text-xs mt-0.5 text-orange-700">
                Your documents are being reviewed. You will receive an email within 24 to 48 hours.
              </p>
            </div>
          </div>
        )}

        {/* ONLINE TOGGLE */}
        {!isPending && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {isOnline ? "You are online" : isOnTrip ? "On a trip" : "You are offline"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isOnline
                    ? "Accepting ride requests in your area"
                    : isOnTrip
                      ? "Complete your current trip"
                      : "Go online to start receiving requests"}
                </p>
              </div>
              <button
                onClick={handleToggleStatus}
                disabled={togglingStatus || isOnTrip}
                className={`relative w-16 h-8 rounded-full transition-colors duration-300 disabled:opacity-50 ${isOnline ? "bg-green-500" : "bg-slate-200"}`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform duration-300 ${isOnline ? "translate-x-9" : "translate-x-1"}`}
                />
              </button>
            </div>
            {isOnline && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs text-green-600 font-medium">Waiting for ride requests near you</p>
              </div>
            )}
          </div>
        )}

        {/* ACTIVE RIDE */}
        {activeRide && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #000042, #2E7D32)" }} />
            <div className="p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "#000042" }}>
                Active trip
              </p>
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
                  <p className="text-sm text-slate-600 truncate">{activeRide.pickup?.address}</p>
                </div>
                <div className="ml-1 w-px h-4 bg-slate-200" />
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                  <p className="text-sm text-slate-600 truncate">{activeRide.dropoff?.address}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Arrived",  action: "arrive",   color: "#000042" },
                  { label: "Start",    action: "start",    color: "#1565C0" },
                  { label: "Complete", action: "complete",  color: "#2E7D32" },
                ].map(({ label, action, color }) => (
                  <button
                    key={action}
                    onClick={() => handleRideAction(action)}
                    className="h-11 rounded-xl text-xs font-bold text-white transition hover:opacity-90"
                    style={{ backgroundColor: color }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TODAY'S EARNINGS */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">
            Today&apos;s earnings
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Earned", value: `R${driver.earnings?.today?.toFixed(2) || "0.00"}`, icon: <FiDollarSign size={16} />, color: "#2E7D32", bg: "#F0FDF4" },
              { label: "Trips",  value: driver.stats?.totalTrips || 0,                       icon: <FiTruck size={16} />,      color: "#000042", bg: "#F0F0F8" },
              { label: "Rating", value: driver.rating?.average?.toFixed(1) || "—",           icon: <FiStar size={16} />,       color: "#C2410C", bg: "#FFF7ED" },
            ].map(({ label, value, icon, color, bg }) => (
              <div key={label} className="flex flex-col items-center text-center p-3 rounded-xl" style={{ backgroundColor: bg }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: "white", color }}>
                  {icon}
                </div>
                <p className="text-lg font-bold text-slate-800">{value}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { to: "/driver/earnings",   icon: <FiDollarSign size={18} />, label: "Earnings",    desc: "Weekly breakdown",    color: "#000042", bg: "#F0F0F8" },
            { to: "/driver/trips",      icon: <FiClock size={18} />,      label: "Trip history", desc: "All completed rides", color: "#2E7D32", bg: "#F0FDF4" },
            { to: "/driver/lift-clubs", icon: <FiUsers size={18} />,      label: "Lift clubs",   desc: "Manage your clubs",   color: "#1565C0", bg: "#EFF6FF" },
            { to: "/driver/profile",    icon: <FiUser size={18} />,        label: "Profile",      desc: "Account & documents", color: "#C2410C", bg: "#FFF7ED" },
          ].map(({ to, icon, label, desc, color, bg }) => (
            <Link
              key={to}
              to={to}
              className="bg-white rounded-2xl border border-slate-100 p-4 flex items-start gap-3 hover:shadow-sm transition group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: bg, color }}
              >
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
              <FiChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition mt-1 flex-shrink-0" />
            </Link>
          ))}
        </div>

        {/* VEHICLE CARD */}
        {driver.vehicle?.make && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">My vehicle</p>
              <Link to="/driver/profile" className="text-[11px] text-slate-400 hover:text-slate-600">Edit</Link>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#F0F0F8" }}>
                <FiTruck size={20} style={{ color: "#000042" }} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {driver.vehicle.year} {driver.vehicle.make} {driver.vehicle.model}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {driver.vehicle.color} · {driver.vehicle.plate} · {driver.vehicle.capacity} seats
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="h-6" />
      </div>
    </div>
  );
};

export default DriverHome;