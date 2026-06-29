import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft, FiDollarSign, FiTrendingUp,
  FiCalendar, FiDownload, FiClock,
} from "react-icons/fi";

const BASE = import.meta.env.VITE_BACKEND_URL;

const PERIODS = ["Today", "This Week", "This Month", "All Time"];

const DriverEarnings = () => {
  const navigate = useNavigate();
  const { driver } = useSelector((s) => s.driver);

  const [period,   setPeriod]   = useState("This Week");
  const [trips,    setTrips]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [hasMore,  setHasMore]  = useState(false);

  useEffect(() => {
    if (!driver) navigate("/driver-login");
  }, [driver, navigate]);

  useEffect(() => {
    fetchTrips(1);
  }, []);

  const fetchTrips = async (p = 1) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE}/api/rides/driver/history?page=${p}&limit=15`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("driverToken")}`,
          },
        }
      );
      const data = await res.json();
      if (p === 1) setTrips(data.rides || []);
      else         setTrips((prev) => [...prev, ...(data.rides || [])]);
      setHasMore(p < (data.pages || 1));
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const earnings = {
    today:     driver?.earnings?.today     || 0,
    thisWeek:  driver?.earnings?.thisWeek  || 0,
    thisMonth: driver?.earnings?.thisMonth || 0,
    total:     driver?.earnings?.total     || 0,
  };

  const displayEarning = () => {
    if (period === "Today")      return earnings.today;
    if (period === "This Week")  return earnings.thisWeek;
    if (period === "This Month") return earnings.thisMonth;
    return earnings.total;
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-ZA", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const formatTime = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleTimeString("en-ZA", {
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  };

  if (!driver) return null;

  return (
    <div className="min-h-screen font-poppins" style={{ backgroundColor: "#f5f5f4" }}>

      {/* Header */}
      <div
        className="w-full px-5 py-4 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg, #000042 0%, #1a3a7a 100%)" }}
      >
        <button
          onClick={() => navigate("/driver-home")}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
        >
          <FiArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-base">Earnings</h1>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            {driver.firstName} {driver.lastName}
          </p>
        </div>
        <button className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition">
          <FiDownload size={15} />
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Period selector */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition
                ${period === p
                  ? "text-white border-transparent"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
              style={period === p ? { backgroundColor: "#000042" } : {}}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Main earnings card */}
        <div
          className="rounded-2xl p-6 text-white overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #000042 0%, #1a3a7a 100%)" }}
        >
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize:  "24px 24px",
            }}
          />
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1"
              style={{ color: "rgba(255,255,255,0.5)" }}>
              {period}
            </p>
            <p className="text-4xl font-bold mb-1">
              R{displayEarning().toFixed(2)}
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              {driver.stats?.totalTrips || 0} total trips completed
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Today",
              value: `R${earnings.today.toFixed(2)}`,
              icon:  <FiCalendar size={16} />,
              color: "#2E7D32", bg: "#F0FDF4",
            },
            {
              label: "This week",
              value: `R${earnings.thisWeek.toFixed(2)}`,
              icon:  <FiTrendingUp size={16} />,
              color: "#000042", bg: "#F0F0F8",
            },
            {
              label: "This month",
              value: `R${earnings.thisMonth.toFixed(2)}`,
              icon:  <FiDollarSign size={16} />,
              color: "#1565C0", bg: "#EFF6FF",
            },
            {
              label: "All time",
              value: `R${earnings.total.toFixed(2)}`,
              icon:  <FiTrendingUp size={16} />,
              color: "#C2410C", bg: "#FFF7ED",
            },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: bg, color }}
              >
                {icon}
              </div>
              <p className="text-lg font-bold text-slate-800">{value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">
            Earnings breakdown
          </p>
          <div className="space-y-3">
            {[
              { label: "Gross fares",    value: `R${(earnings.thisWeek * 1.25).toFixed(2)}` },
              { label: "Platform fee (20%)", value: `-R${(earnings.thisWeek * 0.25).toFixed(2)}` },
              { label: "Net earnings",   value: `R${earnings.thisWeek.toFixed(2)}`, bold: true },
            ].map(({ label, value, bold }) => (
              <div key={label} className="flex items-center justify-between">
                <p className={`text-sm ${bold ? "font-bold text-slate-800" : "text-slate-500"}`}>
                  {label}
                </p>
                <p className={`text-sm ${bold ? "font-bold text-slate-800" : "text-slate-500"}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 mt-4 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Next payout</p>
              <p className="text-xs font-bold text-slate-700">Every Monday</p>
            </div>
          </div>
        </div>

        {/* Trip history */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
            Trip history
          </p>

          {loading && trips.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-white rounded-2xl border border-slate-100 animate-pulse" />
              ))}
            </div>
          ) : trips.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
              <FiClock size={28} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No trips yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Completed trips will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {trips.map((trip) => (
                <div
                  key={trip._id}
                  className="bg-white rounded-2xl border border-slate-100 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-white"
                          style={{ backgroundColor: "#000042" }}
                        >
                          {trip.serviceType}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {formatDate(trip.timeline?.completed)}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                          <p className="text-xs text-slate-600 truncate">
                            {trip.pickup?.address || "Pickup"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                          <p className="text-xs text-slate-600 truncate">
                            {trip.dropoff?.address || "Dropoff"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-2">
                        <p className="text-[11px] text-slate-400">
                          {trip.distanceKm?.toFixed(1)} km
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatTime(trip.timeline?.completed)}
                        </p>
                        {trip.ratings?.byCustomer?.score && (
                          <p className="text-[11px] text-amber-500">
                            ★ {trip.ratings.byCustomer.score}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold" style={{ color: "#000042" }}>
                        R{trip.fare?.breakdown?.driverEarns?.toFixed(2) || "0.00"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">earned</p>
                    </div>
                  </div>
                </div>
              ))}

              {hasMore && (
                <button
                  onClick={() => fetchTrips(page + 1)}
                  disabled={loading}
                  className="w-full py-3 rounded-2xl text-sm font-semibold border border-slate-200 text-slate-500 hover:bg-white transition disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Load more"}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
};

export default DriverEarnings;