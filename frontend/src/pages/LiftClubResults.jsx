import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft, FiStar, FiMapPin, FiClock,
  FiUsers, FiChevronRight, FiAlertCircle,
} from "react-icons/fi";
import { searchLiftClubs, fetchLiftClubById, clearSelectedClub } from "../redux/slices/liftClubSlice";

const timeFmt = (t = "") => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`;
};

const matchScore = (club) => {
  const seats  = club.seats?.available > 0 ? 30 : 0;
  const rating = Math.round((club.driver?.rating?.average || 4) * 14);
  return Math.min(seats + rating, 99);
};

const STATUS = {
  active: { label: "Available", bg: "#F0FDF4", color: "#15803D" },
  full:   { label: "Full",      bg: "#FEF2F2", color: "#B91C1C" },
  paused: { label: "Paused",    bg: "#FFF7ED", color: "#C2410C" },
};

const Avatar = ({ driver }) => {
  const initials = `${driver?.firstName?.[0] || ""}${driver?.lastName?.[0] || ""}`;
  return (
    <div
      className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0"
      style={{ backgroundColor: "#F0F0F8", color: "#000042" }}
    >
      {driver?.profilePhoto
        ? <img src={driver.profilePhoto} alt="" className="w-full h-full object-cover rounded-2xl" />
        : initials}
    </div>
  );
};

const ClubCard = ({ club, onSelect }) => {
  const score  = matchScore(club);
  const sp     = STATUS[club.status] || STATUS.active;
  const driver = club.driver || {};
  const seats  = club.seats  || {};

  return (
    <button
      onClick={() => onSelect(club._id)}
      className="w-full bg-white rounded-2xl border border-slate-100 p-5 text-left hover:shadow-md transition group mb-3"
    >
      {/* Driver row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar driver={driver} />
          <div>
            <p className="text-sm font-bold text-slate-800">
              {driver.firstName} {driver.lastName}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <FiStar size={11} style={{ color: "#F59E0B" }} />
              <span className="text-[11px] text-slate-500">
                {driver.rating?.average?.toFixed(1) || "—"}
              </span>
              <span className="text-[11px] text-slate-300 mx-1">·</span>
              <span className="text-[11px] text-slate-500">
                {driver.vehicle?.make} {driver.vehicle?.model}
              </span>
            </div>
          </div>
        </div>
        <FiChevronRight
          size={16}
          className="text-slate-300 group-hover:text-slate-600 transition mt-1 flex-shrink-0"
        />
      </div>

      {/* Route */}
      <div className="flex items-center gap-2 mb-3">
        <FiMapPin size={12} className="text-slate-300 flex-shrink-0" />
        <span className="text-xs text-slate-600 truncate">
          {club.route?.origin?.address}
        </span>
        <span className="text-slate-300 text-xs flex-shrink-0">→</span>
        <span className="text-xs text-slate-600 truncate">
          {club.route?.destination?.address}
        </span>
      </div>

      {/* Pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1"
          style={{ backgroundColor: "#F0F0F8", color: "#000042" }}
        >
          <FiClock size={9} /> {timeFmt(club.schedule?.departureTime)}
          {club.schedule?.isReturn && ` · Return ${timeFmt(club.schedule?.returnTime)}`}
        </span>
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
          style={{ backgroundColor: "#F0F0F8", color: "#000042" }}
        >
          {club.schedule?.days?.join(", ")}
        </span>
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
          style={{ backgroundColor: "#F0FDF4", color: "#15803D" }}
        >
          {score}% match
        </span>
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
          style={{ backgroundColor: sp.bg, color: sp.color }}
        >
          {sp.label}
        </span>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: "1px solid #F1F5F9" }}
      >
        <div className="flex items-center gap-1.5">
          <FiUsers size={12} className="text-slate-300" />
          <span className="text-xs text-slate-500">
            {seats.available} seat{seats.available !== 1 ? "s" : ""} left
          </span>
        </div>
        <p className="text-base font-black" style={{ color: "#000042" }}>
          R{club.pricePerSeat}
          <span className="text-xs font-normal text-slate-400"> /trip</span>
        </p>
      </div>
    </button>
  );
};

export default function LiftClubResults() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { results, searching, searchError, searchParams } = useSelector((s) => s.liftClub);

  useEffect(() => {
    if (!results.length && !searching && searchParams.origin) {
      dispatch(searchLiftClubs(searchParams));
    }
  }, []);

  const handleSelect = async (id) => {
    dispatch(clearSelectedClub());
    await dispatch(fetchLiftClubById(id));
    navigate(`/lift-clubs/${id}`);
  };

  const available = results.filter((c) => c.status === "active");
  const rest      = results.filter((c) => c.status !== "active");

  return (
    <div className="min-h-screen font-poppins" style={{ backgroundColor: "#f5f5f4" }}>

      {/* Header */}
      <div
        className="px-5 pt-10 pb-6"
        style={{ background: "linear-gradient(135deg, #000042 0%, #1a3a7a 100%)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate("/lift-clubs")}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <FiArrowLeft size={16} color="white" />
          </button>
          <div className="min-w-0">
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Konect Lift
            </p>
            <p className="text-white font-bold text-sm truncate">
              {searchParams.origin
                ? `${searchParams.origin} → ${searchParams.destination}`
                : "Lift clubs"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {searchParams.timeSlot && (
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full capitalize"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}
            >
              {searchParams.timeSlot}
            </span>
          )}
          {searchParams.day && (
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}
            >
              {searchParams.day}
            </span>
          )}
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}
          >
            {searching ? "Searching…" : `${results.length} found`}
          </span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5">

        {/* Loading */}
        {searching && (
          <div className="flex flex-col items-center py-20 gap-4">
            <div
              className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: "#e2e8f0", borderTopColor: "#000042" }}
            />
            <p className="text-sm text-slate-400">Finding lift clubs…</p>
          </div>
        )}

        {/* Error */}
        {!searching && searchError && (
          <div
            className="rounded-xl px-4 py-4 flex items-start gap-3"
            style={{ backgroundColor: "#FEF2F2" }}
          >
            <FiAlertCircle size={15} style={{ color: "#B91C1C", marginTop: 1 }} />
            <p className="text-sm" style={{ color: "#B91C1C" }}>{searchError}</p>
          </div>
        )}

        {/* Empty */}
        {!searching && !searchError && results.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: "#F0F0F8" }}
            >
              <FiMapPin size={28} style={{ color: "#000042" }} />
            </div>
            <p className="font-bold text-slate-800 mb-2">No lift clubs found</p>
            <p className="text-sm text-slate-400 max-w-xs mb-6">
              No drivers are running this route yet. Try adjusting your search or removing the day filter.
            </p>
            <button
              onClick={() => navigate("/lift-clubs")}
              className="px-6 py-3 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: "#000042" }}
            >
              Adjust search
            </button>
          </div>
        )}

        {/* Available */}
        {!searching && available.length > 0 && (
          <>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              {available.length} available
            </p>
            {available.map((c) => (
              <ClubCard key={c._id} club={c} onSelect={handleSelect} />
            ))}
          </>
        )}

        {/* Full / paused */}
        {!searching && rest.length > 0 && (
          <>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 mt-4">
              Not available right now
            </p>
            {rest.map((c) => (
              <div key={c._id} className="opacity-40 pointer-events-none">
                <ClubCard club={c} onSelect={() => {}} />
              </div>
            ))}
          </>
        )}

      </div>
    </div>
  );
}