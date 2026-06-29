import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  updateDriverVehicle,
  updateDriverBank,
  logoutDriver,
} from "../../redux/slices/driverSlice";
import {
  FiArrowLeft, FiUser, FiTruck, FiCreditCard,
  FiFileText, FiStar, FiCheck, FiLogOut, FiShield,
} from "react-icons/fi";

const TABS = [
  { key: "overview",  label: "Overview",  icon: <FiUser size={14} /> },
  { key: "vehicle",   label: "Vehicle",   icon: <FiTruck size={14} /> },
  { key: "documents", label: "Documents", icon: <FiFileText size={14} /> },
  { key: "bank",      label: "Bank",      icon: <FiCreditCard size={14} /> },
];

const fieldCls = "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-custom-blue transition placeholder-slate-400";
const labelCls = "block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5";

const DriverProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { driver, loading } = useSelector((s) => s.driver);

  const [tab,     setTab]     = useState("overview");
  const [success, setSuccess] = useState("");

  const [vehicle, setVehicle] = useState({
    make:     driver?.vehicle?.make     || "",
    model:    driver?.vehicle?.model    || "",
    year:     driver?.vehicle?.year     || "",
    color:    driver?.vehicle?.color    || "",
    plate:    driver?.vehicle?.plate    || "",
    type:     driver?.vehicle?.type     || "sedan",
    capacity: driver?.vehicle?.capacity || 4,
    vin:      driver?.vehicle?.vin      || "",
  });

  const [bank, setBank] = useState({
    bankName:      driver?.bankDetails?.bankName      || "",
    accountHolder: driver?.bankDetails?.accountHolder || "",
    accountNumber: driver?.bankDetails?.accountNumber || "",
    accountType:   driver?.bankDetails?.accountType   || "cheque",
    branchCode:    driver?.bankDetails?.branchCode    || "",
  });

  const handleVehicleSave = async () => {
    const r = await dispatch(updateDriverVehicle({
      ...vehicle,
      year:     Number(vehicle.year),
      capacity: Number(vehicle.capacity),
    }));
    if (!r.error) { setSuccess("Vehicle updated."); setTimeout(() => setSuccess(""), 3000); }
  };

  const handleBankSave = async () => {
    const r = await dispatch(updateDriverBank(bank));
    if (!r.error) { setSuccess("Bank details updated."); setTimeout(() => setSuccess(""), 3000); }
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
          <h1 className="text-white font-bold text-base">My Profile</h1>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            {driver.email}
          </p>
        </div>
        <button
          onClick={() => { dispatch(logoutDriver()); navigate("/driver-login"); }}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition"
        >
          <FiLogOut size={15} />
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: "#000042" }}
          >
            {driver.firstName?.charAt(0)}{driver.lastName?.charAt(0)}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">
              {driver.firstName} {driver.lastName}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-xs text-amber-500">
                <FiStar size={11} />
                {driver.rating?.average?.toFixed(1) || "—"} ({driver.rating?.count || 0} ratings)
              </div>
              <div
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                style={{
                  backgroundColor:
                    driver.status === "online"  ? "#2E7D32" :
                    driver.status === "pending" ? "#C2410C" : "#94a3b8",
                }}
              >
                {driver.status}
              </div>
            </div>
          </div>
        </div>

        {/* Success banner */}
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            <FiCheck size={14} /> {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl border border-slate-100 p-1 mb-5">
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition
                ${tab === key ? "text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              style={tab === key ? { backgroundColor: "#000042" } : {}}
            >
              {icon} <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                Personal details
              </p>
              <div className="space-y-3">
                {[
                  { label: "Full name", value: `${driver.firstName} ${driver.lastName}` },
                  { label: "Email",     value: driver.email },
                  { label: "Phone",     value: driver.phone },
                  { label: "ID number", value: driver.idNumber },
                  { label: "Gender",    value: driver.gender?.replace(/_/g, " ") || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm font-medium text-slate-700 text-right">{value || "—"}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                Performance
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total trips",     value: driver.stats?.totalTrips || 0 },
                  { label: "Total km driven", value: `${driver.stats?.totalKm?.toFixed(0) || 0} km` },
                  { label: "Acceptance rate", value: `${driver.stats?.acceptanceRate || 0}%` },
                  { label: "Total earned",    value: `R${driver.earnings?.total?.toFixed(2) || "0.00"}` },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-xl" style={{ backgroundColor: "#F8FAFC" }}>
                    <p className="text-lg font-bold text-slate-800">{value}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── VEHICLE ── */}
        {tab === "vehicle" && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Vehicle details
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { field: "make",  label: "Make",  placeholder: "Toyota" },
                { field: "model", label: "Model", placeholder: "Corolla" },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className={labelCls}>{label}</label>
                  <input
                    className={fieldCls}
                    value={vehicle[field]}
                    onChange={(e) => setVehicle((p) => ({ ...p, [field]: e.target.value }))}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Year</label>
                <input
                  type="number"
                  className={fieldCls}
                  value={vehicle.year}
                  onChange={(e) => setVehicle((p) => ({ ...p, year: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelCls}>Color</label>
                <input
                  className={fieldCls}
                  value={vehicle.color}
                  onChange={(e) => setVehicle((p) => ({ ...p, color: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>License plate</label>
                <input
                  className={`${fieldCls} uppercase`}
                  value={vehicle.plate}
                  onChange={(e) => setVehicle((p) => ({ ...p, plate: e.target.value.toUpperCase() }))}
                />
              </div>
              <div>
                <label className={labelCls}>Capacity</label>
                <select
                  className={`${fieldCls} appearance-none`}
                  value={vehicle.capacity}
                  onChange={(e) => setVehicle((p) => ({ ...p, capacity: e.target.value }))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n} seats</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleVehicleSave}
              disabled={loading}
              className="w-full h-10 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "#000042" }}
            >
              {loading ? "Saving..." : "Save vehicle"}
            </button>
          </div>
        )}

        {/* ── DOCUMENTS — temporarily simplified ── */}
        {tab === "documents" && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">
              Document verification status
            </p>
            {[
              { label: "SA ID / Passport",       key: "idDocument" },
              { label: "Driver's license",       key: "license" },
              { label: "Vehicle registration",   key: "registration" },
              { label: "Roadworthy certificate", key: "roadworthy" },
              { label: "Vehicle insurance",      key: "insurance" },
              { label: "Profile photo",          key: "profilePhoto" },
            ].map(({ label, key }) => {
              const doc = driver.documents?.[key];
              return (
                <div key={key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <p className="text-sm text-slate-700">{label}</p>
                  <p
                    className="text-[11px] font-bold"
                    style={{ color: doc?.verified ? "#2E7D32" : doc?.url ? "#F59E0B" : "#EF4444" }}
                  >
                    {doc?.verified ? "Verified" : doc?.url ? "Under review" : "Not uploaded"}
                  </p>
                </div>
              );
            })}
            <div
              className="mt-4 flex items-start gap-2.5 rounded-xl px-4 py-3 text-xs"
              style={{ backgroundColor: "#F0F0F8", color: "#000042" }}
            >
              <FiShield size={13} className="flex-shrink-0 mt-0.5" />
              <p>To update a document contact support at <strong>support@konect.co.za</strong></p>
            </div>
          </div>
        )}

        {/* ── BANK ── */}
        {tab === "bank" && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Bank details
            </p>
            <div>
              <label className={labelCls}>Bank</label>
              <input
                className={fieldCls}
                value={bank.bankName}
                onChange={(e) => setBank((p) => ({ ...p, bankName: e.target.value }))}
                placeholder="e.g. FNB"
              />
            </div>
            <div>
              <label className={labelCls}>Account holder name</label>
              <input
                className={fieldCls}
                value={bank.accountHolder}
                onChange={(e) => setBank((p) => ({ ...p, accountHolder: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Account number</label>
              <input
                type="number"
                className={fieldCls}
                value={bank.accountNumber}
                onChange={(e) => setBank((p) => ({ ...p, accountNumber: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Account type</label>
                <select
                  className={`${fieldCls} appearance-none`}
                  value={bank.accountType}
                  onChange={(e) => setBank((p) => ({ ...p, accountType: e.target.value }))}
                >
                  <option value="cheque">Cheque / Current</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Branch code</label>
                <input
                  className={fieldCls}
                  value={bank.branchCode}
                  onChange={(e) => setBank((p) => ({ ...p, branchCode: e.target.value }))}
                  maxLength={6}
                />
              </div>
            </div>
            <div
              className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-xs"
              style={{ backgroundColor: "#F0FDF4", color: "#2E7D32" }}
            >
              <FiShield size={13} className="flex-shrink-0 mt-0.5" />
              <p>Bank details are encrypted and used only for weekly payout transfers.</p>
            </div>
            <button
              onClick={handleBankSave}
              disabled={loading}
              className="w-full h-10 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "#2E7D32" }}
            >
              {loading ? "Saving..." : "Save bank details"}
            </button>
          </div>
        )}

        <div className="h-6" />
      </div>
    </div>
  );
};

export default DriverProfile;