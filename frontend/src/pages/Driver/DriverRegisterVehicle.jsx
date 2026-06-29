import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { updateDriverVehicle } from "../../redux/slices/driverSlice";
import { FiArrowRight, FiArrowLeft, FiTruck, FiCheck } from "react-icons/fi";

const STEPS = ["Personal Info", "Vehicle", "Documents", "Bank Details"];

const VEHICLE_TYPES = [
  { key: "sedan",    label: "Sedan",     desc: "Standard 4-door car" },
  { key: "suv",      label: "SUV",       desc: "Sport utility vehicle" },
  { key: "minivan",  label: "Minivan",   desc: "6–8 passenger van" },
  { key: "bakkie",   label: "Bakkie",    desc: "Pickup truck" },
  { key: "luxury",   label: "Luxury",    desc: "Premium vehicle" },
  { key: "motorbike",label: "Motorbike", desc: "2-wheel delivery" },
];

const SA_COLORS = [
  "White", "Silver", "Black", "Grey", "Blue",
  "Red", "Green", "Yellow", "Orange", "Brown",
];

const fieldCls = "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none focus:border-custom-blue focus:ring-1 focus:ring-custom-blue/10 transition placeholder-slate-400";
const labelCls = "block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5";
const errorCls = "text-xs text-red-500 mt-1";

const DriverRegisterVehicle = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.driver);

  const [form, setForm] = useState({
    make:     "",
    model:    "",
    year:     "",
    color:    "",
    plate:    "",
    type:     "sedan",
    capacity: 4,
    vin:      "",
  });

  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.make.trim())  e.make  = "Vehicle make is required.";
    if (!form.model.trim()) e.model = "Vehicle model is required.";
    if (!form.year)         e.year  = "Year is required.";
    if (form.year < 2005 || form.year > new Date().getFullYear() + 1)
      e.year = "Enter a valid vehicle year.";
    if (!form.color)        e.color = "Please select a color.";
    if (!form.plate.trim()) e.plate = "License plate is required.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    const result = await dispatch(updateDriverVehicle({
      ...form,
      year:     Number(form.year),
      capacity: Number(form.capacity),
    }));

    if (!result.error) navigate("/driver-register/documents");
  };

  return (
    <div className="min-h-screen font-poppins" style={{ backgroundColor: "#f5f5f4" }}>

      <div
        className="w-full px-6 py-5 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #000042 0%, #1a3a7a 100%)" }}
      >
        <Link to="/" className="text-white font-bold text-lg tracking-tight">
          Konect <span style={{ color: "#4ade80" }}>Drive</span>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition`}
                    style={{
                      backgroundColor: i <= 1 ? "#000042" : "#e2e8f0",
                      color: i <= 1 ? "white" : "#94a3b8",
                    }}
                  >
                    {i < 1 ? <FiCheck size={13} /> : i + 1}
                  </div>
                  <p className={`text-[10px] font-semibold mt-1.5 text-center whitespace-nowrap
                    ${i <= 1 ? "text-slate-800" : "text-slate-400"}`}>
                    {step}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px mb-5 mx-2" style={{ backgroundColor: i < 1 ? "#000042" : "#e2e8f0" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          <div className="px-8 py-6 border-b border-slate-100">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest mb-3"
              style={{ backgroundColor: "#F0FDF4", color: "#2E7D32" }}
            >
              <FiTruck size={11} /> Step 2 of 4
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Vehicle details</h1>
            <p className="text-sm text-slate-500 mt-1">
              Tell us about the vehicle you&apos;ll be driving. It must be roadworthy and insured.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">

            {/* Vehicle type selector */}
            <div>
              <label className={labelCls}>Vehicle type</label>
              <div className="grid grid-cols-3 gap-2">
                {VEHICLE_TYPES.map(({ key, label, desc }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set("type", key)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition
                      ${form.type === key
                        ? "border-transparent text-white"
                        : "border-slate-200 hover:border-slate-300 bg-white"}`}
                    style={form.type === key ? { backgroundColor: "#000042" } : {}}
                  >
                    <p className={`text-xs font-bold mb-0.5 ${form.type === key ? "text-white" : "text-slate-700"}`}>
                      {label}
                    </p>
                    <p className={`text-[10px] ${form.type === key ? "text-white/70" : "text-slate-400"}`}>
                      {desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Make + Model */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Make</label>
                <input
                  className={fieldCls}
                  value={form.make}
                  onChange={(e) => set("make", e.target.value)}
                  placeholder="e.g. Toyota"
                />
                {errors.make && <p className={errorCls}>{errors.make}</p>}
              </div>
              <div>
                <label className={labelCls}>Model</label>
                <input
                  className={fieldCls}
                  value={form.model}
                  onChange={(e) => set("model", e.target.value)}
                  placeholder="e.g. Corolla"
                />
                {errors.model && <p className={errorCls}>{errors.model}</p>}
              </div>
            </div>

            {/* Year + Color */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Year</label>
                <input
                  type="number"
                  className={fieldCls}
                  value={form.year}
                  onChange={(e) => set("year", e.target.value)}
                  placeholder="e.g. 2020"
                  min="2005"
                  max={new Date().getFullYear() + 1}
                />
                {errors.year && <p className={errorCls}>{errors.year}</p>}
              </div>
              <div>
                <label className={labelCls}>Color</label>
                <select
                  className={`${fieldCls} appearance-none`}
                  value={form.color}
                  onChange={(e) => set("color", e.target.value)}
                >
                  <option value="">Select color</option>
                  {SA_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.color && <p className={errorCls}>{errors.color}</p>}
              </div>
            </div>

            {/* Plate + Capacity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>License plate</label>
                <input
                  className={`${fieldCls} uppercase`}
                  value={form.plate}
                  onChange={(e) => set("plate", e.target.value.toUpperCase())}
                  placeholder="e.g. CA 123 456"
                />
                {errors.plate && <p className={errorCls}>{errors.plate}</p>}
              </div>
              <div>
                <label className={labelCls}>Passenger capacity</label>
                <select
                  className={`${fieldCls} appearance-none`}
                  value={form.capacity}
                  onChange={(e) => set("capacity", e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n} passenger{n !== 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* VIN (optional) */}
            <div>
              <label className={labelCls}>VIN number <span className="text-slate-300">(optional)</span></label>
              <input
                className={fieldCls}
                value={form.vin}
                onChange={(e) => set("vin", e.target.value.toUpperCase())}
                placeholder="17-character VIN"
                maxLength={17}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/driver-register")}
                className="flex items-center gap-2 px-5 h-12 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                <FiArrowLeft size={14} /> Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#000042" }}
              >
                {loading ? "Saving..." : "Continue to documents"}
                {!loading && <FiArrowRight size={15} />}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default DriverRegisterVehicle;