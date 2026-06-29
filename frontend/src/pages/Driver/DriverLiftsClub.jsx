import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  FiArrowLeft, FiPlus, FiUsers, FiMapPin, FiClock,
  FiToggleLeft, FiToggleRight, FiTrash2, FiEdit2,
  FiCheck, FiX, FiBell, FiDollarSign, FiAlertCircle,
  FiCheckCircle, FiXCircle, FiChevronDown, FiChevronUp,
  FiPhone, FiInfo, FiSave,
} from "react-icons/fi";

const BASE       = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const SOCKET_URL = BASE;
const DAYS       = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("driverToken")}`,
});

const fmt = (n = 0) =>
  `R${Number(n).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const timeFmt = (t = "") => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`;
};

const dateFmt = (d, opts = { day: "numeric", month: "short", year: "2-digit" }) =>
  d ? new Date(d).toLocaleDateString("en-ZA", opts) : "—";

const BLANK_FORM = {
  name: "", description: "", originAddress: "", destAddress: "",
  days: [], departureTime: "07:00", returnTime: "", isReturn: false,
  seats: 4, pricePerSeat: "",
};

const STATUS_META = {
  active: { bg: "#F0FDF4", color: "#15803D", label: "Active" },
  paused: { bg: "#FFF7ED", color: "#C2410C", label: "Paused" },
  full:   { bg: "#EFF6FF", color: "#1D4ED8", label: "Full"   },
};

const LEASE_STATUS_META = {
  active:              { bg: "#F0FDF4", color: "#15803D", label: "Active"      },
  cancellation_notice: { bg: "#FFF7ED", color: "#C2410C", label: "Cancelling"  },
  completed:           { bg: "#F0F0F8", color: "#475569", label: "Completed"   },
  rejected:            { bg: "#FEF2F2", color: "#B91C1C", label: "Rejected"    },
  pending_payment:     { bg: "#EFF6FF", color: "#1D4ED8", label: "Pending pay" },
};

const inp = "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-400 transition placeholder-slate-300";
const lbl = "block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1";

/* ══════════════════════════════════════════
   CLUB FORM
══════════════════════════════════════════ */
const ClubForm = ({ initial = BLANK_FORM, onSubmit, onCancel, submitting, error, mode = "create" }) => {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toggleDay = (d) =>
    setForm((p) => ({
      ...p,
      days: p.days.includes(d) ? p.days.filter((x) => x !== d) : [...p.days, d],
    }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="px-5 py-5 space-y-4">

      <div>
        <label className={lbl}>Club name *</label>
        <input className={inp} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Durban North to CBD" />
      </div>

      <div>
        <label className={lbl}>Description</label>
        <input className={inp} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Any extra details passengers should know" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>From *</label>
          <input className={inp} value={form.originAddress} onChange={(e) => set("originAddress", e.target.value)} placeholder="Pickup area" />
        </div>
        <div>
          <label className={lbl}>To *</label>
          <input className={inp} value={form.destAddress} onChange={(e) => set("destAddress", e.target.value)} placeholder="Destination" />
        </div>
      </div>

      <div>
        <label className={lbl}>Operating days *</label>
        <div className="flex gap-1.5 flex-wrap">
          {DAYS.map((d) => (
            <button
              key={d} type="button" onClick={() => toggleDay(d)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border transition"
              style={
                form.days.includes(d)
                  ? { backgroundColor: "#000042", color: "white", borderColor: "#000042" }
                  : { backgroundColor: "white", color: "#64748b", borderColor: "#e2e8f0" }
              }
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Departure time *</label>
          <input type="time" className={inp} value={form.departureTime} onChange={(e) => set("departureTime", e.target.value)} />
        </div>
        <div>
          <label className={lbl}>Return time</label>
          <input type="time" className={inp} value={form.returnTime} onChange={(e) => set("returnTime", e.target.value)} />
        </div>
      </div>

      <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
        <div>
          <p className="text-sm font-bold text-slate-700">Return trip included</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Passenger gets a lift back too</p>
        </div>
        <button type="button" onClick={() => set("isReturn", !form.isReturn)} className="transition">
          {form.isReturn
            ? <FiToggleRight size={28} style={{ color: "#000042" }} />
            : <FiToggleLeft  size={28} className="text-slate-300" />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Available seats *</label>
          <select className={`${inp} appearance-none`} value={form.seats} onChange={(e) => set("seats", e.target.value)}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n} seat{n !== 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl}>Price per trip (R) *</label>
          <input type="number" className={inp} value={form.pricePerSeat} onChange={(e) => set("pricePerSeat", e.target.value)} placeholder="e.g. 50" min="0" />
        </div>
      </div>

      {form.pricePerSeat && (
        <div className="rounded-xl px-3 py-3 space-y-1" style={{ backgroundColor: "#EFF6FF" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <FiInfo size={12} style={{ color: "#1D4ED8" }} />
            <p className="text-[11px] font-bold" style={{ color: "#1E40AF" }}>Lease estimate for passengers</p>
          </div>
          {[1, 2, 3].map((m) => {
            const disc  = m === 2 ? 0.05 : m === 3 ? 0.10 : 0;
            const total = (form.pricePerSeat * m * 22 * (1 - disc)).toFixed(2);
            return (
              <div key={m} className="flex justify-between text-[11px]" style={{ color: "#1E40AF" }}>
                <span>{m} month{m > 1 ? "s" : ""}{disc > 0 ? ` (${disc * 100}% off)` : ""}</span>
                <span className="font-bold">{fmt(total)}</span>
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <div className="rounded-xl px-3 py-2.5 flex items-center gap-2" style={{ backgroundColor: "#FEF2F2" }}>
          <FiAlertCircle size={13} style={{ color: "#B91C1C" }} />
          <p className="text-xs" style={{ color: "#B91C1C" }}>{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 h-11 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
          Cancel
        </button>
        <button
          type="submit" disabled={submitting}
          className="flex-1 h-11 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition disabled:opacity-50"
          style={{ backgroundColor: "#000042" }}
        >
          {submitting
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <><FiSave size={14} /> {mode === "create" ? "Create club" : "Save changes"}</>}
        </button>
      </div>
    </form>
  );
};

/* ══════════════════════════════════════════
   CLUB CARD
══════════════════════════════════════════ */
const ClubCard = ({ club, onToggle, onDelete, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const sm     = STATUS_META[club.status] || STATUS_META.active;
  const conf   = club.passengers?.filter((p) => p.status === "confirmed") || [];
  const pend   = club.passengers?.filter((p) => p.status === "pending")   || [];
  const filled = (club.seats?.total || 0) - (club.seats?.available || 0);
  const pct    = club.seats?.total ? Math.round((filled / club.seats.total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-3">
      <div className="h-1" style={{ background: "linear-gradient(90deg, #000042, #1a3a7a)" }} />
      <div className="p-5">

        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="text-sm font-bold text-slate-800 truncate">{club.name}</p>
              {pend.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: "#C2410C" }}>
                  {pend.length} pending
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block" style={{ backgroundColor: sm.bg, color: sm.color }}>
              {sm.label}
            </span>
          </div>
          <p className="text-lg font-black flex-shrink-0" style={{ color: "#000042" }}>
            R{club.pricePerSeat}<span className="text-xs font-normal text-slate-400">/trip</span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <FiMapPin size={11} className="flex-shrink-0 text-slate-300" />
          <span className="truncate">{club.route?.origin?.address}</span>
          <span className="text-slate-300 flex-shrink-0">→</span>
          <span className="truncate">{club.route?.destination?.address}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <FiClock size={11} className="flex-shrink-0 text-slate-300" />
          <span>
            {timeFmt(club.schedule?.departureTime)}
            {club.schedule?.isReturn && ` · Return ${timeFmt(club.schedule?.returnTime)}`}
          </span>
        </div>

        <div className="flex gap-1 flex-wrap mb-4">
          {club.schedule?.days?.map((d) => (
            <span key={d} className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: "#F0F0F8", color: "#000042" }}>
              {d}
            </span>
          ))}
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>{club.seats?.available} seats left</span>
            <span>{filled} / {club.seats?.total} filled</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: "#000042" }} />
          </div>
        </div>

        {conf.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">Passengers ({conf.length})</p>
            <div className="space-y-2">
              {conf.map((p) => (
                <div key={p._id} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: "#F0F0F8", color: "#000042" }}>
                    {p.user?.firstName?.[0]}{p.user?.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{p.user?.firstName} {p.user?.lastName}</p>
                    {p.pickupStop && <p className="text-[10px] text-slate-400 truncate">{p.pickupStop}</p>}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#F0FDF4", color: "#15803D" }}>
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {pend.length > 0 && (
          <>
            <button onClick={() => setExpanded((p) => !p)} className="flex items-center gap-1.5 text-xs font-bold mb-3 transition" style={{ color: "#C2410C" }}>
              {expanded ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
              {pend.length} pending passenger{pend.length > 1 ? "s" : ""}
            </button>
            {expanded && (
              <div className="space-y-2 mb-4 pl-1">
                {pend.map((p) => (
                  <div key={p._id} className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ backgroundColor: "#FFF7ED" }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: "#FED7AA", color: "#C2410C" }}>
                      {p.user?.firstName?.[0]}{p.user?.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{p.user?.firstName} {p.user?.lastName}</p>
                      {p.user?.phone && (
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <FiPhone size={9} /> {p.user.phone}
                        </p>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 flex-shrink-0">
                      {dateFmt(p.joinedAt, { day: "numeric", month: "short" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid #F1F5F9" }}>
          <button
            onClick={() => onToggle(club._id)}
            className="flex-1 h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
            style={{ backgroundColor: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0" }}
          >
            {club.status === "active"
              ? <><FiToggleRight size={14} style={{ color: "#2E7D32" }} /> Pause</>
              : <><FiToggleLeft  size={14} /> Resume</>}
          </button>
          <button
            onClick={() => onEdit(club)}
            className="flex-1 h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
            style={{ backgroundColor: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0" }}
          >
            <FiEdit2 size={13} /> Edit
          </button>
          <button
            onClick={() => onDelete(club._id)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition"
            style={{ backgroundColor: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA" }}
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   LEASE REQUEST CARD
══════════════════════════════════════════ */
const LeaseRequestCard = ({ lease, onAction }) => {
  const [acting, setActing] = useState(null);
  const passenger = lease.passenger || {};
  const liftClub  = lease.liftClub  || {};

  const handle = async (action) => {
    setActing(action);
    await onAction(lease._id, liftClub._id || lease.liftClub, action);
    setActing(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-3">
      <div className="h-1" style={{ background: "linear-gradient(90deg, #C2410C, #EA580C)" }} />
      <div className="p-5">

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ backgroundColor: "#F0F0F8", color: "#000042" }}>
            {passenger.profilePhoto
              ? <img src={passenger.profilePhoto} alt="" className="w-full h-full object-cover rounded-full" />
              : `${passenger.firstName?.[0] || ""}${passenger.lastName?.[0] || ""}`}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800">{passenger.firstName} {passenger.lastName}</p>
            {passenger.phone && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <FiPhone size={10} /> {passenger.phone}
              </p>
            )}
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: "#FFF7ED", color: "#C2410C" }}>
            New request
          </span>
        </div>

        <div className="rounded-xl px-3 py-2.5 mb-4" style={{ backgroundColor: "#F8FAFC", border: "1px solid #F1F5F9" }}>
          <p className="text-xs font-bold text-slate-700 mb-1">{liftClub.name}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <FiMapPin size={10} />
            <span className="truncate">{liftClub.route?.origin?.address} → {liftClub.route?.destination?.address}</span>
          </div>
          {lease.pickupStop && (
            <p className="text-[11px] text-slate-500 mt-1">Pickup stop: <strong>{lease.pickupStop}</strong></p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Term",   val: `${lease.termMonths} month${lease.termMonths > 1 ? "s" : ""}` },
            { label: "Total",  val: fmt(lease.finalAmount) },
            { label: "Starts", val: dateFmt(lease.startDate, { day: "numeric", month: "short" }) },
          ].map(({ label, val }) => (
            <div key={label} className="text-center rounded-xl py-2.5" style={{ backgroundColor: "#F8FAFC" }}>
              <p className="text-[10px] text-slate-400 mb-0.5">{label}</p>
              <p className="text-xs font-bold text-slate-800">{val}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl px-3 py-2.5 flex items-start gap-2 mb-4" style={{ backgroundColor: "#EFF6FF" }}>
          <FiInfo size={12} style={{ color: "#1D4ED8", marginTop: 1, flexShrink: 0 }} />
          <div>
            <p className="text-[11px] font-bold mb-0.5" style={{ color: "#1E40AF" }}>How you get paid</p>
            <p className="text-[11px]" style={{ color: "#1E40AF" }}>
              {fmt(lease.weeklyAmount || lease.finalAmount / (lease.termMonths * 4))} released after each completed week.
              Konect holds funds until trips are done. A R99 subscription fee applies per lease.
            </p>
          </div>
        </div>

        <div className="rounded-xl px-3 py-2.5 flex items-start gap-2 mb-4" style={{ backgroundColor: "#F0FDF4" }}>
          <FiInfo size={12} style={{ color: "#15803D", marginTop: 1, flexShrink: 0 }} />
          <p className="text-[11px]" style={{ color: "#166534" }}>
            Passenger may cancel after week 3 with 7 days notice. You keep all payments for completed weeks.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handle("accept")} disabled={!!acting}
            className="flex-1 h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition disabled:opacity-60"
            style={{ backgroundColor: "#15803D" }}
          >
            {acting === "accept"
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><FiCheckCircle size={15} /> Accept</>}
          </button>
          <button
            onClick={() => handle("reject")} disabled={!!acting}
            className="flex-1 h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-60"
            style={{ color: "#B91C1C", border: "1.5px solid #FECACA", backgroundColor: "white" }}
          >
            {acting === "reject"
              ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              : <><FiXCircle size={15} /> Decline</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   ACTIVE LEASE CARD
══════════════════════════════════════════ */
const ActiveLeaseCard = ({ lease }) => {
  const [expanded, setExpanded] = useState(false);
  const passenger = lease.passenger || {};
  const liftClub  = lease.liftClub  || {};
  const weeks     = lease.weeklyReleases || [];
  const done      = weeks.filter((w) => w.status === "released").length;
  const total     = weeks.length;
  const pct       = total > 0 ? Math.round((done / total) * 100) : 0;
  const sm        = LEASE_STATUS_META[lease.status] || LEASE_STATUS_META.active;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-3">
      <div className="h-1" style={{ background: "linear-gradient(90deg, #000042, #1a3a7a)" }} />
      <div className="p-5">

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ backgroundColor: "#F0FDF4", color: "#15803D" }}>
            {passenger.firstName?.[0]}{passenger.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800">{passenger.firstName} {passenger.lastName}</p>
            <p className="text-xs text-slate-400 mt-0.5">{lease.termMonths} month lease · {fmt(lease.finalAmount)} total</p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: sm.bg, color: sm.color }}>
            {sm.label}
          </span>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          <FiMapPin size={10} className="inline mr-1 text-slate-300" />
          {liftClub.name || `${liftClub.route?.origin?.address} → ${liftClub.route?.destination?.address}`}
        </p>

        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
            <span>Week {done} of {total} complete</span>
            <span>{fmt(lease.totalReleased)} released</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: "#000042" }} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Pending: {fmt(lease.pendingBalance)}</span>
            <span>{pct}% released</span>
          </div>
        </div>

        {weeks.length > 0 && (
          <>
            <button onClick={() => setExpanded((p) => !p)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition mb-3">
              {expanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
              Weekly payment schedule
            </button>
            {expanded && (
              <div className="space-y-1.5 mb-3">
                {weeks.map((w) => (
                  <div
                    key={w.weekNumber}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs"
                    style={{ backgroundColor: w.status === "released" ? "#F0FDF4" : "#F8FAFC" }}
                  >
                    <div className="flex items-center gap-2">
                      {w.status === "released"
                        ? <FiCheckCircle size={12} style={{ color: "#15803D" }} />
                        : <div className="w-3 h-3 rounded-full border-2 border-slate-200" />}
                      <span className="font-bold text-slate-700">Week {w.weekNumber}</span>
                      {w.releasedAt && (
                        <span className="text-slate-400">· {dateFmt(w.releasedAt, { day: "numeric", month: "short" })}</span>
                      )}
                    </div>
                    <span className="font-bold" style={{ color: w.status === "released" ? "#15803D" : "#64748b" }}>
                      {fmt(w.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="flex justify-between text-[11px] pt-3" style={{ borderTop: "1px solid #F1F5F9" }}>
          <span className="text-slate-400">Started: <strong className="text-slate-700">{dateFmt(lease.startDate)}</strong></span>
          <span className="text-slate-400">Ends: <strong className="text-slate-700">{dateFmt(lease.endDate)}</strong></span>
        </div>

        {lease.status === "cancellation_notice" && (
          <div className="mt-3 rounded-xl px-3 py-2.5 flex items-start gap-2" style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}>
            <FiAlertCircle size={13} style={{ color: "#C2410C", marginTop: 1, flexShrink: 0 }} />
            <div>
              <p className="text-xs font-bold" style={{ color: "#92400E" }}>Cancellation in progress</p>
              <p className="text-[11px] mt-0.5" style={{ color: "#92400E" }}>
                Effective {dateFmt(lease.cancellationEffectiveDate, { day: "numeric", month: "long", year: "numeric" })}.
                You will receive payment for all completed weeks until then.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
const TABS = [
  { id: "clubs",    label: "My clubs",  Icon: FiUsers      },
  { id: "requests", label: "Requests",  Icon: FiBell       },
  { id: "leases",   label: "Leases",    Icon: FiDollarSign },
];

export default function DriverLiftClubs() {
  const navigate   = useNavigate();
  const socketRef  = useRef(null);
  const { driver } = useSelector((s) => s.driver);

  const [activeTab,   setActiveTab]   = useState("clubs");
  const [clubs,       setClubs]       = useState([]);
  const [requests,    setRequests]    = useState([]);
  const [leases,      setLeases]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [toast,       setToast]       = useState(null);
  const [showCreate,  setShowCreate]  = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [formError,   setFormError]   = useState("");
  const [submitting,  setSubmitting]  = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [cRes, lRes] = await Promise.all([
        fetch(`${BASE}/api/lift-clubs/my`,           { headers: authHeader() }),
        fetch(`${BASE}/api/lift-clubs/leases/driver`, { headers: authHeader() }),
      ]);
      const cData = await cRes.json();
      const lData = await lRes.json();
      setClubs(cData.clubs || []);
      const all = lData.leases || [];
      setRequests(all.filter((l) => l.status === "pending_driver"));
      setLeases(all.filter((l) => l.status !== "pending_driver"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!driver) { navigate("/driver-login"); return; }
    load();
  }, [driver]);

  useEffect(() => {
    if (!driver?._id) return;
    socketRef.current = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("driverToken") },
    });
    socketRef.current.emit("driver:join", { driverId: driver._id });
    socketRef.current.on("liftclub:lease_request", (data) => {
      showToast(`New request from ${data.passengerName}`);
      setActiveTab("requests");
      load();
    });
    return () => socketRef.current?.disconnect();
  }, [driver?._id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  };

  const handleCreate = async (form) => {
    if (!form.name || !form.originAddress || !form.destAddress || !form.days.length || !form.pricePerSeat) {
      setFormError("Please fill in all required fields and select at least one day.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch(`${BASE}/api/lift-clubs`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          route: {
            origin:      { address: form.originAddress, coordinates: [0, 0] },
            destination: { address: form.destAddress,   coordinates: [0, 0] },
          },
          schedule: {
            days: form.days, departureTime: form.departureTime,
            returnTime: form.returnTime, isReturn: form.isReturn,
          },
          seats:        Number(form.seats),
          pricePerSeat: Number(form.pricePerSeat),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.message); return; }
      setClubs((p) => [data.club, ...p]);
      setShowCreate(false);
      showToast("Lift club created!");
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (form) => {
    if (!editingClub) return;
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch(`${BASE}/api/lift-clubs/${editingClub._id}`, {
        method: "PATCH",
        headers: authHeader(),
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          route: {
            origin:      { address: form.originAddress, coordinates: editingClub.route?.origin?.coordinates      || [0, 0] },
            destination: { address: form.destAddress,   coordinates: editingClub.route?.destination?.coordinates || [0, 0] },
          },
          schedule: {
            days: form.days, departureTime: form.departureTime,
            returnTime: form.returnTime, isReturn: form.isReturn,
          },
          pricePerSeat: Number(form.pricePerSeat),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.message); return; }
      setClubs((p) => p.map((c) => c._id === editingClub._id ? data.club : c));
      setEditingClub(null);
      showToast("Changes saved.");
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (clubId) => {
    try {
      const res  = await fetch(`${BASE}/api/lift-clubs/${clubId}/toggle`, { method: "PATCH", headers: authHeader() });
      const data = await res.json();
      setClubs((p) => p.map((c) => c._id === clubId ? { ...c, status: data.status } : c));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (clubId) => {
    if (!window.confirm("Delete this lift club? All passenger data will be removed. This cannot be undone.")) return;
    try {
      await fetch(`${BASE}/api/lift-clubs/${clubId}`, { method: "DELETE", headers: authHeader() });
      setClubs((p) => p.filter((c) => c._id !== clubId));
      showToast("Lift club deleted.");
    } catch (err) { console.error(err); }
  };

  const handleLeaseAction = async (leaseId, clubId, action) => {
    try {
      await fetch(`${BASE}/api/lift-clubs/${clubId}/lease-request/${leaseId}`, {
        method: "PATCH",
        headers: authHeader(),
        body: JSON.stringify({ action }),
      });
      load();
      showToast(action === "accept" ? "Request accepted!" : "Request declined.");
    } catch (err) { console.error(err); }
  };

  const openEdit = (club) => {
    setFormError("");
    setEditingClub(club);
    setShowCreate(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pendingCount = requests.length;
  if (!driver) return null;

  return (
    <div className="min-h-screen font-poppins" style={{ backgroundColor: "#f5f5f4" }}>

      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-xl flex items-center gap-2" style={{ backgroundColor: "#000042" }}>
          <FiCheck size={14} /> {toast}
        </div>
      )}

      <div className="px-5 pt-10 pb-6" style={{ background: "linear-gradient(135deg, #000042 0%, #1a3a7a 100%)" }}>
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate("/driver-home")} className="w-9 h-9 rounded-full flex items-center justify-center transition" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
            <FiArrowLeft size={16} color="white" />
          </button>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Driver dashboard</p>
            <p className="text-white font-black text-lg">Lift clubs</p>
          </div>
          <button
            onClick={() => { setShowCreate((p) => !p); setEditingClub(null); setFormError(""); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <FiPlus size={14} /> New club
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Clubs",         val: clubs.length,                                       alert: false },
            { label: "Requests",      val: pendingCount,                                       alert: pendingCount > 0 },
            { label: "Active leases", val: leases.filter((l) => l.status === "active").length, alert: false },
          ].map(({ label, val, alert }) => (
            <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              <p className="text-xl font-black text-white">{val}</p>
              <p className="text-[10px] mt-0.5" style={{ color: alert ? "#FCD34D" : "rgba(255,255,255,0.5)" }}>
                {label}{alert ? " ●" : ""}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex border-b sticky top-0 z-10 bg-white" style={{ borderColor: "#F1F5F9" }}>
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id} onClick={() => setActiveTab(id)}
            className="flex-1 py-3.5 flex flex-col items-center gap-0.5 text-[11px] font-bold relative transition"
            style={{ color: activeTab === id ? "#000042" : "#94a3b8" }}
          >
            <div className="relative">
              <Icon size={16} />
              {id === "requests" && pendingCount > 0 && (
                <div className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white" style={{ backgroundColor: "#EF4444" }}>
                  {pendingCount}
                </div>
              )}
            </div>
            {label}
            {activeTab === id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full" style={{ backgroundColor: "#000042" }} />
            )}
          </button>
        ))}
      </div>

      <div className="max-w-lg mx-auto px-4 py-5">

        {showCreate && activeTab === "clubs" && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4">
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #F1F5F9" }}>
              <p className="text-sm font-bold text-slate-800">Create new lift club</p>
              <button onClick={() => { setShowCreate(false); setFormError(""); }} className="text-slate-400 hover:text-slate-600">
                <FiX size={16} />
              </button>
            </div>
            <ClubForm onSubmit={handleCreate} onCancel={() => { setShowCreate(false); setFormError(""); }} submitting={submitting} error={formError} mode="create" />
          </div>
        )}

        {editingClub && activeTab === "clubs" && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4">
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #F1F5F9" }}>
              <p className="text-sm font-bold text-slate-800">Edit: {editingClub.name}</p>
              <button onClick={() => { setEditingClub(null); setFormError(""); }} className="text-slate-400 hover:text-slate-600">
                <FiX size={16} />
              </button>
            </div>
            <ClubForm
              initial={{
                name:          editingClub.name,
                description:   editingClub.description || "",
                originAddress: editingClub.route?.origin?.address || "",
                destAddress:   editingClub.route?.destination?.address || "",
                days:          editingClub.schedule?.days || [],
                departureTime: editingClub.schedule?.departureTime || "07:00",
                returnTime:    editingClub.schedule?.returnTime || "",
                isReturn:      editingClub.schedule?.isReturn || false,
                seats:         editingClub.seats?.total || 4,
                pricePerSeat:  editingClub.pricePerSeat || "",
              }}
              onSubmit={handleEdit}
              onCancel={() => { setEditingClub(null); setFormError(""); }}
              submitting={submitting}
              error={formError}
              mode="edit"
            />
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "#e2e8f0", borderTopColor: "#000042" }} />
            <p className="text-sm text-slate-400">Loading…</p>
          </div>
        ) : (
          <>
            {activeTab === "clubs" && (
              <>
                {clubs.length === 0 && !showCreate ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "#F0F0F8" }}>
                      <FiUsers size={28} style={{ color: "#000042" }} />
                    </div>
                    <p className="font-bold text-slate-800 mb-1">No lift clubs yet</p>
                    <p className="text-sm text-slate-400 max-w-xs mb-6">Create a recurring shared ride and earn from regular passengers on your daily route.</p>
                    <button onClick={() => setShowCreate(true)} className="px-6 py-3 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: "#000042" }}>
                      Create your first club
                    </button>
                  </div>
                ) : (
                  <>
                    {clubs.map((c) => (
                      <ClubCard key={c._id} club={c} onToggle={handleToggle} onDelete={handleDelete} onEdit={openEdit} />
                    ))}
                    {clubs.length > 0 && !showCreate && !editingClub && (
                      <button
                        onClick={() => { setShowCreate(true); setEditingClub(null); }}
                        className="w-full h-12 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 mt-1 transition"
                        style={{ border: "1.5px dashed #CBD5E1", color: "#94a3b8" }}
                      >
                        <FiPlus size={15} /> Add another club
                      </button>
                    )}
                  </>
                )}
              </>
            )}

            {activeTab === "requests" && (
              <>
                {requests.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "#F0F0F8" }}>
                      <FiBell size={28} style={{ color: "#000042" }} />
                    </div>
                    <p className="font-bold text-slate-800 mb-1">No pending requests</p>
                    <p className="text-sm text-slate-400">When a passenger requests to join your lift club it will appear here.</p>
                  </div>
                ) : (
                  requests.map((l) => (
                    <LeaseRequestCard key={l._id} lease={l} onAction={handleLeaseAction} />
                  ))
                )}
              </>
            )}

            {activeTab === "leases" && (
              <>
                {leases.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "#F0F0F8" }}>
                      <FiDollarSign size={28} style={{ color: "#000042" }} />
                    </div>
                    <p className="font-bold text-slate-800 mb-1">No lease agreements yet</p>
                    <p className="text-sm text-slate-400">Once you accept a passenger request, their lease and payment schedule will appear here.</p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-2xl px-4 py-3.5 flex items-start gap-3 mb-4" style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                      <FiInfo size={15} style={{ color: "#1D4ED8", marginTop: 1, flexShrink: 0 }} />
                      <div>
                        <p className="text-xs font-bold mb-0.5" style={{ color: "#1E40AF" }}>Subscription fee</p>
                        <p className="text-[11px]" style={{ color: "#1E40AF" }}>
                          R99 per active lease per month. You have{" "}
                          <strong>{leases.filter((l) => l.status === "active").length} active lease{leases.filter((l) => l.status === "active").length !== 1 ? "s" : ""}</strong>{" "}
                          this month.
                        </p>
                      </div>
                    </div>
                    {leases.map((l) => <ActiveLeaseCard key={l._id} lease={l} />)}
                  </>
                )}
              </>
            )}
          </>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}