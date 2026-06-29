import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft, FiStar, FiClock,
  FiUsers, FiTruck, FiCalendar, FiAlertCircle,
  FiCheckCircle, FiInfo, FiPhone,
} from "react-icons/fi";
import {
  fetchLiftClubById,
  sendLeaseRequest,
  setSelectedMonths,
  setAgreedToTerms,
  calcLeaseCost,
} from "../redux/slices/liftClubSlice.js";

const timeFmt = (t = "") => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`;
};

const fmt = (n) =>
  `R${Number(n).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ── Lease term chip ── */
const LeaseChip = ({ months, pricePerSeat, selected, onSelect }) => {
  const { discountPct, finalAmount } = calcLeaseCost(pricePerSeat, months);
  const active = selected === months;
  return (
    <button
      onClick={() => onSelect(months)}
      className="flex-1 flex flex-col items-center py-4 rounded-2xl border-2 transition"
      style={{
        borderColor:     active ? "#000042" : "#e2e8f0",
        backgroundColor: active ? "#F0F0F8" : "white",
      }}
    >
      <span
        className="text-2xl font-black"
        style={{ color: active ? "#000042" : "#1e293b" }}
      >
        {months}
      </span>
      <span
        className="text-xs font-medium mt-0.5"
        style={{ color: active ? "#4b5fa6" : "#94a3b8" }}
      >
        month{months > 1 ? "s" : ""}
      </span>
      {discountPct > 0 ? (
        <span
          className="text-[10px] font-bold mt-2 px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}
        >
          Save {discountPct}%
        </span>
      ) : (
        <span className="text-[10px] text-slate-300 mt-2">Standard</span>
      )}
      <span
        className="text-xs font-bold mt-1.5"
        style={{ color: active ? "#000042" : "#64748b" }}
      >
        {fmt(finalAmount)}
      </span>
    </button>
  );
};

/* ── Cost breakdown ── */
const CostBreakdown = ({ pricePerSeat, months }) => {
  const { workingDays, discountPct, totalAmount, discountAmt, finalAmount, weeklyRelease } =
    calcLeaseCost(pricePerSeat, months);

  return (
    <div
      className="rounded-2xl p-4 space-y-2"
      style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}
    >
      {[
        { label: "Daily rate",       val: fmt(pricePerSeat) },
        { label: "Working days",     val: `${workingDays} days` },
        { label: "Subtotal",         val: fmt(totalAmount) },
        ...(discountPct > 0
          ? [{ label: `Discount (${discountPct}%)`, val: `-${fmt(discountAmt)}`, green: true }]
          : []),
      ].map(({ label, val, green }) => (
        <div key={label} className="flex justify-between">
          <span className="text-xs text-slate-500">{label}</span>
          <span
            className="text-xs font-medium"
            style={{ color: green ? "#15803D" : "#334155" }}
          >
            {val}
          </span>
        </div>
      ))}
      <div
        className="flex justify-between pt-2"
        style={{ borderTop: "1px solid #E2E8F0" }}
      >
        <span className="text-xs font-bold text-slate-800">Total (upfront)</span>
        <span className="text-xs font-black" style={{ color: "#000042" }}>{fmt(finalAmount)}</span>
      </div>

      <div
        className="flex items-start gap-2 pt-2 rounded-xl px-3 py-2.5 mt-1"
        style={{ backgroundColor: "#EFF6FF" }}
      >
        <FiInfo size={12} style={{ color: "#1D4ED8", marginTop: 1, flexShrink: 0 }} />
        <p className="text-[11px] leading-relaxed" style={{ color: "#1E40AF" }}>
          Konect holds your payment and releases{" "}
          <strong>{fmt(weeklyRelease)}</strong> to the driver after each completed week.
          No payment is taken until the driver accepts.
        </p>
      </div>
    </div>
  );
};

/* ── Agreement modal ── */
const AgreementModal = ({ onClose, months, amount, driverName }) => (
  <div
    className="fixed inset-0 z-50 flex items-end justify-center"
    style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
    onClick={onClose}
  >
    <div
      className="w-full max-w-lg rounded-t-3xl p-6 overflow-y-auto"
      style={{ backgroundColor: "white", maxHeight: "82vh" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-5" />
      <p className="font-black text-slate-900 text-lg mb-5">Lift Club Lease Agreement</p>

      {[
        {
          title: "1. Parties",
          body: `This agreement is between you (the passenger) and ${driverName} (the driver), facilitated by Konect.`,
        },
        {
          title: "2. Lease term & payment",
          body: `This lease runs for ${months} month${months > 1 ? "s" : ""}. The total amount of ${fmt(amount)} is payable upfront before the lease begins. No payment is taken until the driver accepts your request.`,
        },
        {
          title: "3. How funds are held & released",
          body: `Konect holds the full payment securely. The driver receives their weekly amount after each completed week of trips. If you cancel, you are refunded for any weeks that have not yet started.`,
        },
        {
          title: "4. Cancellation policy",
          body: `You may only cancel after completing 3 full weeks of your lease. You must give 7 days written notice via the app before cancellation takes effect. Completed weeks are non-refundable.`,
        },
        {
          title: "5. Driver obligations",
          body: `The driver must operate the agreed route on the agreed days and times. Persistent failure to do so entitles you to cancel without penalty.`,
        },
        {
          title: "6. Governing law",
          body: `This agreement is governed by the laws of the Republic of South Africa.`,
        },
      ].map(({ title, body }) => (
        <div key={title} className="mb-4">
          <p className="text-xs font-bold text-slate-800 mb-1">{title}</p>
          <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
        </div>
      ))}

      <button
        onClick={onClose}
        className="w-full h-12 rounded-2xl font-bold text-white mt-2"
        style={{ backgroundColor: "#000042" }}
      >
        Got it
      </button>
    </div>
  </div>
);

/* ── Main page ── */
export default function LiftClubDetail() {
  const { id }   = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    selectedClub, loadingClub, clubError,
    selectedMonths, agreedToTerms,
    submitting, submitError,
  } = useSelector((s) => s.liftClub);

  const [showAgreement, setShowAgreement] = useState(false);
  const [pickupStop,    setPickupStop]    = useState("");
  const [notes,         setNotes]         = useState("");

  useEffect(() => {
    if (!selectedClub || selectedClub._id !== id) {
      dispatch(fetchLiftClubById(id));
    }
  }, [id]);

  const handleSend = async () => {
    if (!selectedMonths || !agreedToTerms) return;
    const result = await dispatch(
      sendLeaseRequest({ liftClubId: id, termMonths: selectedMonths, pickupStop, notes })
    );
    if (sendLeaseRequest.fulfilled.match(result)) {
      navigate("/lift-clubs/request-sent");
    }
  };

  if (loadingClub) {
    return (
      <div
        className="min-h-screen flex items-center justify-center font-poppins"
        style={{ backgroundColor: "#f5f5f4" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#e2e8f0", borderTopColor: "#000042" }}
          />
          <p className="text-sm text-slate-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (clubError || !selectedClub) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center font-poppins px-6 gap-4"
        style={{ backgroundColor: "#f5f5f4" }}
      >
        <FiAlertCircle size={32} style={{ color: "#B91C1C" }} />
        <p className="text-sm text-slate-600 text-center">{clubError || "Lift club not found."}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-bold"
          style={{ color: "#000042" }}
        >
          Go back
        </button>
      </div>
    );
  }

  const driver = selectedClub.driver   || {};
  const route  = selectedClub.route    || {};
  const sched  = selectedClub.schedule || {};
  const seats  = selectedClub.seats    || {};

  return (
    <div className="min-h-screen font-poppins" style={{ backgroundColor: "#f5f5f4" }}>

      {/* Header */}
      <div
        className="px-5 pt-10 pb-8"
        style={{ background: "linear-gradient(135deg, #000042 0%, #1a3a7a 100%)" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center mb-5"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          <FiArrowLeft size={16} color="white" />
        </button>

        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white" }}
          >
            {driver.profilePhoto
              ? <img src={driver.profilePhoto} alt="" className="w-full h-full object-cover rounded-2xl" />
              : `${driver.firstName?.[0] || ""}${driver.lastName?.[0] || ""}`}
          </div>
          <div>
            <p className="text-white font-black text-xl leading-tight">
              {driver.firstName} {driver.lastName}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <FiStar size={12} style={{ color: "#F59E0B" }} />
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                {driver.rating?.average?.toFixed(1) || "—"}
              </span>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                {driver.vehicle?.year} {driver.vehicle?.make} {driver.vehicle?.model}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-3 pb-12 space-y-4">

        {/* Route & schedule */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Route & schedule</p>

          <div className="flex gap-3 mb-5">
            <div className="flex flex-col items-center pt-1 flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#000042" }} />
              <div className="w-px flex-1 my-1.5 bg-slate-200" style={{ minHeight: 24 }} />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">Pickup</p>
                <p className="text-sm font-medium text-slate-800">{route.origin?.address}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">Dropoff</p>
                <p className="text-sm font-medium text-slate-800">{route.destination?.address}</p>
              </div>
            </div>
          </div>

          <div
            className="grid grid-cols-2 gap-3 pt-4"
            style={{ borderTop: "1px solid #F1F5F9" }}
          >
            {[
              { Icon: FiClock,    label: "Departs",       val: timeFmt(sched.departureTime) },
              { Icon: FiCalendar, label: "Days",          val: sched.days?.join(", ") },
              { Icon: FiUsers,    label: "Seats left",    val: `${seats.available} of ${seats.total}` },
              { Icon: FiTruck,    label: "Plate",         val: driver.vehicle?.plate || "—" },
            ].map(({ Icon, label, val }) => (
              <div key={label} className="flex items-start gap-2">
                <Icon size={13} className="text-slate-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400">{label}</p>
                  <p className="text-xs font-bold text-slate-700">{val}</p>
                </div>
              </div>
            ))}
          </div>

          {sched.isReturn && (
            <div
              className="mt-3 pt-3 flex items-center gap-2"
              style={{ borderTop: "1px solid #F1F5F9" }}
            >
              <FiClock size={12} className="text-slate-300" />
              <p className="text-xs text-slate-500">
                Return trip included · <strong>{timeFmt(sched.returnTime)}</strong>
              </p>
            </div>
          )}

          {driver.phone && (
            <div
              className="mt-3 pt-3 flex items-center gap-2"
              style={{ borderTop: "1px solid #F1F5F9" }}
            >
              <FiPhone size={12} className="text-slate-300" />
              <p className="text-xs text-slate-500">{driver.phone}</p>
            </div>
          )}
        </div>

        {/* Your pickup stop */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            Your pickup stop <span className="font-normal normal-case text-slate-300">(optional)</span>
          </p>
          <p className="text-[11px] text-slate-400 mb-3">
            Tell the driver exactly where to pick you up along the route.
          </p>
          <input
            value={pickupStop}
            onChange={(e) => setPickupStop(e.target.value)}
            placeholder="e.g. Corner of Smith St & West St"
            className="w-full h-10 text-sm text-slate-800 placeholder-slate-300 border border-slate-200 rounded-xl px-4 outline-none focus:border-blue-300 transition"
          />
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            Notes to driver <span className="font-normal normal-case text-slate-300">(optional)</span>
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything the driver should know about you or your schedule…"
            rows={2}
            className="w-full text-sm text-slate-800 placeholder-slate-300 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-300 transition resize-none"
          />
        </div>

        {/* Lease term */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            Lease term
          </p>
          <p className="text-[11px] text-slate-400 mb-4">
            Longer terms cost less per trip. You pay upfront — funds held until each week completes.
          </p>
          <div className="flex gap-2.5">
            {[1, 2, 3].map((m) => (
              <LeaseChip
                key={m}
                months={m}
                pricePerSeat={selectedClub.pricePerSeat}
                selected={selectedMonths}
                onSelect={(v) => dispatch(setSelectedMonths(v))}
              />
            ))}
          </div>
        </div>

        {/* Cost breakdown */}
        {selectedMonths && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
              Cost breakdown
            </p>
            <CostBreakdown pricePerSeat={selectedClub.pricePerSeat} months={selectedMonths} />
          </div>
        )}

        {/* Cancellation policy */}
        <div
          className="rounded-2xl px-4 py-4 flex items-start gap-3"
          style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}
        >
          <FiInfo size={14} style={{ color: "#C2410C", marginTop: 1, flexShrink: 0 }} />
          <div>
            <p className="text-xs font-bold mb-1" style={{ color: "#92400E" }}>
              Cancellation policy
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: "#92400E" }}>
              You may cancel after completing 3 full weeks of your lease. A 7-day notice period
              is required. Completed weeks are non-refundable.
            </p>
          </div>
        </div>

        {/* Agreement checkbox */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-3">
          <button
            onClick={() => dispatch(setAgreedToTerms(!agreedToTerms))}
            className="mt-0.5 w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition"
            style={{
              borderColor:     agreedToTerms ? "#000042" : "#CBD5E1",
              backgroundColor: agreedToTerms ? "#000042" : "white",
            }}
          >
            {agreedToTerms && <FiCheckCircle size={12} color="white" />}
          </button>
          <p className="text-xs text-slate-500 leading-relaxed">
            I have read and agree to the{" "}
            <button
              onClick={() => setShowAgreement(true)}
              className="font-bold underline"
              style={{ color: "#000042" }}
            >
              lift club lease agreement
            </button>
            {selectedMonths && (
              <>
                {" "}and authorise the upfront payment of{" "}
                <strong style={{ color: "#000042" }}>
                  {fmt(calcLeaseCost(selectedClub.pricePerSeat, selectedMonths).finalAmount)}
                </strong>
              </>
            )}.
          </p>
        </div>

        {submitError && (
          <div
            className="rounded-xl px-4 py-3 flex items-start gap-2"
            style={{ backgroundColor: "#FEF2F2" }}
          >
            <FiAlertCircle size={14} style={{ color: "#B91C1C", marginTop: 1 }} />
            <p className="text-sm" style={{ color: "#B91C1C" }}>{submitError}</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleSend}
          disabled={!selectedMonths || !agreedToTerms || submitting}
          className="w-full h-14 rounded-2xl text-base font-black text-white flex items-center justify-center gap-2 transition disabled:opacity-40"
          style={{ backgroundColor: "#000042" }}
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending request…
            </>
          ) : (
            "Send request to driver"
          )}
        </button>

        <p className="text-[11px] text-slate-400 text-center">
          No payment is taken until the driver accepts your request.
        </p>

      </div>

      {showAgreement && (
        <AgreementModal
          onClose={() => setShowAgreement(false)}
          months={selectedMonths || 1}
          amount={selectedMonths
            ? calcLeaseCost(selectedClub.pricePerSeat, selectedMonths).finalAmount
            : 0}
          driverName={`${driver.firstName} ${driver.lastName}`}
        />
      )}
    </div>
  );
}