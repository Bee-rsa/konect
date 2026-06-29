import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiSearch, FiSunrise, FiSun, FiMoon,
  FiArrowRight, FiX,FiInfo,
} from "react-icons/fi";
import { searchLiftClubs, setSearchParams, clearResults } from "../redux/slices/liftClubSlice.js";

const TIME_SLOTS = [
  { id: "morning",   label: "Morning",   sub: "5am – 9am",   Icon: FiSunrise },
  { id: "afternoon", label: "Afternoon", sub: "12pm – 4pm",  Icon: FiSun     },
  { id: "evening",   label: "Evening",   sub: "5pm – 9pm",   Icon: FiMoon    },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function LiftClubSearch() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { searching, searchError } = useSelector((s) => s.liftClub);

  const [origin,      setOrigin]      = useState("");
  const [destination, setDestination] = useState("");
  const [timeSlot,    setTimeSlot]    = useState(null);
  const [day,         setDay]         = useState(null);

  const swap = () => {
    const t = origin;
    setOrigin(destination);
    setDestination(t);
  };

  const handleSearch = async () => {
    if (!origin.trim() || !destination.trim()) return;
    dispatch(clearResults());
    dispatch(setSearchParams({ origin, destination, day, timeSlot }));
    await dispatch(searchLiftClubs({ origin, destination, day, timeSlot }));
    navigate("/lift-clubs/results");
  };

  const ready = origin.trim() && destination.trim();

  return (
    <div className="min-h-screen font-poppins" style={{ backgroundColor: "#f5f5f4" }}>

      {/* Header */}
      <div
        className="px-5 pt-12 pb-10"
        style={{ background: "linear-gradient(135deg, #000042 0%, #1a3a7a 100%)" }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-2"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Konect Lift
        </p>
        <h1 className="text-3xl font-black text-white leading-tight mb-1">
          Find your<br />lift club
        </h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          Daily commutes · shared costs · fixed routes
        </p>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-5 pb-10 space-y-3">

        {/* Route card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
            Your route
          </p>

          {/* Origin */}
          <div className="flex items-center gap-3 mb-1">
            <div className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{ borderColor: "#000042" }} />
            <input
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && document.getElementById("dest-input").focus()}
              placeholder="Pickup location"
              className="flex-1 text-sm text-slate-800 placeholder-slate-300 outline-none bg-transparent"
            />
            {origin && (
              <button onClick={() => setOrigin("")} className="text-slate-300 hover:text-slate-500">
                <FiX size={13} />
              </button>
            )}
          </div>

          <div className="flex items-stretch gap-3 my-1">
            <div className="flex flex-col items-center ml-[5px]">
              <div className="w-px flex-1 bg-slate-200" />
            </div>
            {origin && destination && (
              <button
                onClick={swap}
                className="ml-auto text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 py-1 transition"
              >
                <FiArrowRight size={10} className="rotate-90" /> Swap
              </button>
            )}
          </div>

          {/* Destination */}
          <div className="flex items-center gap-3 mt-1">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: "#000042" }} />
            <input
              id="dest-input"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ready && handleSearch()}
              placeholder="Dropoff location"
              className="flex-1 text-sm text-slate-800 placeholder-slate-300 outline-none bg-transparent"
            />
            {destination && (
              <button onClick={() => setDestination("")} className="text-slate-300 hover:text-slate-500">
                <FiX size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Time slot */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
            When do you travel?
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {TIME_SLOTS.map(({ id, label, sub, Icon }) => {
              const active = timeSlot === id;
              return (
                <button
                  key={id}
                  onClick={() => setTimeSlot(active ? null : id)}
                  className="flex flex-col items-center py-3.5 px-2 rounded-xl border-2 transition"
                  style={{
                    borderColor:     active ? "#000042" : "#e2e8f0",
                    backgroundColor: active ? "#F0F0F8" : "white",
                  }}
                >
                  <Icon
                    size={20}
                    style={{ color: active ? "#000042" : "#94a3b8", marginBottom: 5 }}
                  />
                  <span
                    className="text-xs font-bold"
                    style={{ color: active ? "#000042" : "#475569" }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-[10px] mt-0.5"
                    style={{ color: active ? "#4b5fa6" : "#94a3b8" }}
                  >
                    {sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day filter */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Day <span className="font-normal normal-case text-slate-300">(optional)</span>
            </p>
            {day && (
              <button
                onClick={() => setDay(null)}
                className="text-[10px] text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((d) => {
              const active = day === d;
              return (
                <button
                  key={d}
                  onClick={() => setDay(active ? null : d)}
                  className="w-10 h-10 rounded-xl text-xs font-bold border-2 transition"
                  style={{
                    borderColor:     active ? "#000042" : "#e2e8f0",
                    backgroundColor: active ? "#000042" : "white",
                    color:           active ? "white"   : "#475569",
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Info strip */}
        <div
          className="rounded-2xl px-4 py-3 flex items-start gap-3"
          style={{ backgroundColor: "#EFF6FF" }}
        >
          <FiInfo size={14} style={{ color: "#1D4ED8", marginTop: 1, flexShrink: 0 }} />
          <p className="text-[11px] leading-relaxed" style={{ color: "#1E40AF" }}>
            Lift clubs run fixed daily routes with upfront lease agreements of 1, 2, or 3 months.
            Select a driver, choose your term, and the driver confirms your spot.
          </p>
        </div>

        {searchError && (
          <div
            className="rounded-xl px-4 py-3 text-sm font-medium"
            style={{ backgroundColor: "#FEF2F2", color: "#B91C1C" }}
          >
            {searchError}
          </div>
        )}

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={!ready || searching}
          className="w-full h-14 rounded-2xl text-base font-black text-white flex items-center justify-center gap-2 transition disabled:opacity-40"
          style={{ backgroundColor: "#000042" }}
        >
          {searching ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Searching…
            </>
          ) : (
            <>
              <FiSearch size={18} /> Search lift clubs
            </>
          )}
        </button>

      </div>
    </div>
  );
}