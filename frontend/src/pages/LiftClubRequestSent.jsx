import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  FiClock, FiCheckCircle, FiXCircle,
  FiMapPin, FiArrowRight, FiCalendar,
  FiDollarSign, FiInfo,
} from "react-icons/fi";
import { updateLeaseStatus, clearPendingLease } from "../redux/slices/liftClubSlice";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const fmt = (n) =>
  `R${Number(n).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const dateFmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }) : "—";

const STATES = {
  pending_driver: {
    Icon:  FiClock,
    bg:    "#FFF7ED",
    color: "#C2410C",
    title: "Awaiting driver response",
    sub:   "Your request has been sent. Drivers typically respond within a few hours.",
  },
  pending_payment: {
    Icon:  FiCheckCircle,
    bg:    "#F0FDF4",
    color: "#15803D",
    title: "Driver accepted!",
    sub:   "Your spot is reserved. Complete your payment to activate the lift club.",
  },
  rejected: {
    Icon:  FiXCircle,
    bg:    "#FEF2F2",
    color: "#B91C1C",
    title: "Request declined",
    sub:   "The driver couldn't take on a new passenger. Try another lift club.",
  },
};

export default function LiftClubRequestSent() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const socketRef = useRef(null);

  const { pendingLease }   = useSelector((s) => s.liftClub);
  const { user }           = useSelector((s) => s.auth);   // ← fixed: was s.auth || s.user || {}

  useEffect(() => {
    if (!pendingLease?._id) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("userToken") },   // ← fixed: was "token"
    });

    const userId = user?._id || localStorage.getItem("userId");
    if (userId) socketRef.current.emit("user:join", { userId });

    socketRef.current.on("liftclub:lease_response", ({ leaseId, status }) => {
      dispatch(updateLeaseStatus({ leaseId, status }));
    });

    return () => socketRef.current?.disconnect();
  }, [pendingLease?._id]);

  useEffect(() => {
    if (!pendingLease) navigate("/lift-clubs");
  }, [pendingLease]);

  if (!pendingLease) return null;

  const status   = pendingLease.status || "pending_driver";
  const cfg      = STATES[status] || STATES.pending_driver;
  const { Icon } = cfg;
  const liftClub = pendingLease.liftClub || {};
  const driver   = pendingLease.driver   || {};
  const weeks    = pendingLease.termMonths * 4;
  const weekly   = pendingLease.weeklyAmount || (pendingLease.finalAmount / weeks);

  return (
    <div className="min-h-screen font-poppins" style={{ backgroundColor: "#f5f5f4" }}>

      <div className="px-5 pt-12 pb-10 flex flex-col items-center text-center" style={{ background: "linear-gradient(135deg, #000042 0%, #1a3a7a 100%)" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
          <Icon size={28} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Konect Lift</p>
        <h1 className="text-xl font-black text-white mb-2">{cfg.title}</h1>
        <p className="text-sm max-w-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{cfg.sub}</p>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 pb-12 space-y-4">

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Your request</p>

          <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: "1px solid #F1F5F9" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ backgroundColor: "#F0F0F8", color: "#000042" }}>
              {driver.profilePhoto
                ? <img src={driver.profilePhoto} alt="" className="w-full h-full object-cover rounded-xl" />
                : `${driver.firstName?.[0] || ""}${driver.lastName?.[0] || ""}`}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{driver.firstName} {driver.lastName}</p>
              <p className="text-xs text-slate-400 mt-0.5">{driver.vehicle?.make} {driver.vehicle?.model} · {driver.vehicle?.plate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <FiMapPin size={12} className="text-slate-300 flex-shrink-0" />
            <span className="text-xs text-slate-600 truncate">{liftClub.route?.origin?.address || "Origin"}</span>
            <FiArrowRight size={11} className="text-slate-300 flex-shrink-0" />
            <span className="text-xs text-slate-600 truncate">{liftClub.route?.destination?.address || "Destination"}</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <FiCalendar size={12} className="text-slate-300 flex-shrink-0" />
            <span className="text-xs text-slate-600">
              {liftClub.schedule?.days?.join(", ")} · {liftClub.schedule?.departureTime}
            </span>
          </div>

          <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: "#F8FAFC" }}>
            {[
              { label: "Lease term",      val: `${pendingLease.termMonths} month${pendingLease.termMonths > 1 ? "s" : ""}` },
              { label: "Starts",          val: dateFmt(pendingLease.startDate) },
              { label: "Ends",            val: dateFmt(pendingLease.endDate) },
              ...(pendingLease.discountPct > 0
                ? [{ label: `Discount (${pendingLease.discountPct}%)`, val: `-${fmt(pendingLease.discountAmount)}`, green: true }]
                : []),
              { label: "Total (upfront)", val: fmt(pendingLease.finalAmount), bold: true },
            ].map(({ label, val, bold, green }) => (
              <div key={label} className="flex justify-between">
                <span className="text-xs text-slate-400">{label}</span>
                <span className={`text-xs ${bold ? "font-bold text-slate-900" : "text-slate-600"}`} style={green ? { color: "#15803D" } : {}}>
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl px-4 py-4 flex items-start gap-3" style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <FiDollarSign size={15} style={{ color: "#1D4ED8", marginTop: 1, flexShrink: 0 }} />
          <div>
            <p className="text-xs font-bold mb-1" style={{ color: "#1E40AF" }}>How your money is protected</p>
            <p className="text-[11px] leading-relaxed" style={{ color: "#1E40AF" }}>
              Konect holds the full {fmt(pendingLease.finalAmount)} and releases{" "}
              <strong>{fmt(weekly)}</strong> to the driver only after each completed week of trips over {weeks} weeks.
              You are refunded for any uncompleted weeks if you cancel.
            </p>
          </div>
        </div>

        <div className="rounded-2xl px-4 py-4 flex items-start gap-3" style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}>
          <FiInfo size={15} style={{ color: "#C2410C", marginTop: 1, flexShrink: 0 }} />
          <div>
            <p className="text-xs font-bold mb-1" style={{ color: "#92400E" }}>Cancellation policy</p>
            <p className="text-[11px] leading-relaxed" style={{ color: "#92400E" }}>
              You may cancel after 3 completed weeks with 7 days notice. Completed weeks are non-refundable.
              Your remaining balance is refunded after the effective cancellation date.
            </p>
          </div>
        </div>

        {status === "pending_driver" && (
          <div className="space-y-3">
            <button
              onClick={() => navigate("/lift-clubs/results")}
              className="w-full py-3.5 rounded-2xl text-sm font-bold border-2 transition"
              style={{ borderColor: "#000042", color: "#000042", backgroundColor: "white" }}
            >
              Browse other lift clubs
            </button>
            <button
              onClick={() => { dispatch(clearPendingLease()); navigate("/lift-clubs"); }}
              className="w-full text-xs text-slate-400 py-2"
            >
              Start a new search
            </button>
          </div>
        )}

        {status === "pending_payment" && (
          <div className="space-y-3">
            <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
              <FiCheckCircle size={24} style={{ color: "#15803D", margin: "0 auto 10px" }} />
              <p className="text-sm font-bold mb-1" style={{ color: "#15803D" }}>Payment gateway coming soon</p>
              <p className="text-xs leading-relaxed" style={{ color: "#166534" }}>
                Your spot is reserved. Payment collection will be enabled once our gateway is live. We will notify you.
              </p>
            </div>
            <button onClick={() => navigate("/")} className="w-full h-14 rounded-2xl text-base font-black text-white" style={{ backgroundColor: "#000042" }}>
              Back to home
            </button>
          </div>
        )}

        {status === "rejected" && (
          <div className="space-y-3">
            <button onClick={() => navigate("/lift-clubs/results")} className="w-full h-14 rounded-2xl text-base font-black text-white" style={{ backgroundColor: "#000042" }}>
              See other lift clubs
            </button>
            <button onClick={() => { dispatch(clearPendingLease()); navigate("/lift-clubs"); }} className="w-full text-sm font-bold py-3 text-slate-400">
              Start a new search
            </button>
          </div>
        )}

      </div>
    </div>
  );
}