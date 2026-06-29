import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyRates,
  addCourierRate, updateCourierRate, deleteCourierRate,
  addTruckRate,   updateTruckRate,   deleteTruckRate,
   clearSaveSuccess,
} from "../../../redux/slices/companyRateSlice";
import { Trash2, PlusCircle, ChevronDown, ChevronUp } from "lucide-react";

/* ── shared styles ── */
const card  = "rounded-md border border-slate-200 bg-white shadow-sm flex flex-col";
const hdr   = "border-b border-slate-200 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700 bg-slate-50 shrink-0 flex items-center justify-between";
const body  = "p-2 flex-1 overflow-y-auto";
const inp   = "h-[28px] w-full rounded border border-slate-200 bg-white px-2 text-[10px] outline-none focus:border-blue-400 transition";
const sel   = "h-[28px] w-full rounded border border-slate-200 bg-white px-2 text-[10px] outline-none focus:border-blue-400 transition appearance-none";
const lbl   = "text-[10px] font-medium text-slate-500 mb-0.5 block";
const btnSm = "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border transition";

/* ── blank templates ── */
const BLANK_COURIER = {
  zone: "local", serviceLevel: "economy",
  basePrice: "", includedWeightKg: "", extraKgRate: "",
  minimumCharge: "", volumetricDivisor: 5000,
  maxLengthCm: "", maxWidthCm: "", maxHeightCm: "",
};

const BLANK_TRUCK = {
  vehicleType: "bakkie", loadType: "FTL",
  minimumCharge: "", ratePerKm: "", ratePerKg: "",
  includedKm: "", fuelSurchargePercent: "",
  handlingFee: "", capacityKg: "", estimatedDays: "1-3 days",
};

/* ── field helpers ── */
// eslint-disable-next-line react/prop-types
const Field = ({ label, children }) => (
  <div>
    <label className={lbl}>{label}</label>
    {children}
  </div>
);

export default function CompanyRate() {
  const dispatch = useDispatch();
  const { profile, loading, saving, saveSuccess, error } = useSelector((s) => s.companyRate);

  const [tab, setTab]                   = useState("courier");
  const [courierForm, setCourierForm]   = useState(BLANK_COURIER);
  const [truckForm, setTruckForm]       = useState(BLANK_TRUCK);
  const [editCourierIdx, setEditCourierIdx] = useState(null);
  const [editTruckIdx, setEditTruckIdx]     = useState(null);
  const [expandedCourier, setExpandedCourier] = useState(null);
  const [expandedTruck, setExpandedTruck]     = useState(null);

  useEffect(() => {
    dispatch(fetchMyRates());
  }, [dispatch]);

  useEffect(() => {
    if (saveSuccess) {
      const t = setTimeout(() => dispatch(clearSaveSuccess()), 2500);
      return () => clearTimeout(t);
    }
  }, [saveSuccess, dispatch]);

  /* ── courier handlers ── */
  const handleCourierChange = (field, val) =>
    setCourierForm((p) => ({ ...p, [field]: val }));

  const handleCourierSubmit = () => {
    const payload = {
      ...courierForm,
      basePrice:        Number(courierForm.basePrice),
      includedWeightKg: Number(courierForm.includedWeightKg),
      extraKgRate:      Number(courierForm.extraKgRate),
      minimumCharge:    Number(courierForm.minimumCharge),
      volumetricDivisor:Number(courierForm.volumetricDivisor),
      maxLengthCm:      Number(courierForm.maxLengthCm || 0),
      maxWidthCm:       Number(courierForm.maxWidthCm  || 0),
      maxHeightCm:      Number(courierForm.maxHeightCm || 0),
    };
    if (editCourierIdx !== null) {
      dispatch(updateCourierRate({ index: editCourierIdx, payload }));
      setEditCourierIdx(null);
    } else {
      dispatch(addCourierRate(payload));
    }
    setCourierForm(BLANK_COURIER);
  };

  const handleEditCourier = (idx) => {
    setEditCourierIdx(idx);
    setCourierForm(profile.courierRates[idx]);
    setTab("courier");
  };

  /* ── truck handlers ── */
  const handleTruckChange = (field, val) =>
    setTruckForm((p) => ({ ...p, [field]: val }));

  const handleTruckSubmit = () => {
    const payload = {
      ...truckForm,
      minimumCharge:       Number(truckForm.minimumCharge),
      ratePerKm:           Number(truckForm.ratePerKm  || 0),
      ratePerKg:           Number(truckForm.ratePerKg  || 0),
      includedKm:          Number(truckForm.includedKm || 0),
      fuelSurchargePercent:Number(truckForm.fuelSurchargePercent || 0),
      handlingFee:         Number(truckForm.handlingFee || 0),
      capacityKg:          Number(truckForm.capacityKg  || 0),
    };
    if (editTruckIdx !== null) {
      dispatch(updateTruckRate({ index: editTruckIdx, payload }));
      setEditTruckIdx(null);
    } else {
      dispatch(addTruckRate(payload));
    }
    setTruckForm(BLANK_TRUCK);
  };

  const handleEditTruck = (idx) => {
    setEditTruckIdx(idx);
    setTruckForm(profile.truckRates[idx]);
    setTab("truck");
  };

  const courierRates = profile?.courierRates || [];
  const truckRates   = profile?.truckRates   || [];

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-[11px] text-slate-400">
      Loading rates...
    </div>
  );

  return (
    <div className="flex flex-col gap-3 p-2 h-full">

      {/* ── status bar ── */}
      {(saveSuccess || error) && (
        <div className={`px-3 py-1.5 rounded text-[10px] font-medium ${saveSuccess ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
          {saveSuccess ? "Saved successfully." : error}
        </div>
      )}

      {/* ── TAB SELECTOR ── */}
      <div className="flex gap-0 border border-slate-200 rounded-md overflow-hidden w-fit">
        {["courier", "truck"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition ${
              tab === t
                ? "bg-custom-blue text-white"
                : "bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            {t === "courier" ? "Courier Rates" : "Truck Rates"}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════
          COURIER TAB
      ════════════════════════════════ */}
      {tab === "courier" && (
        <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">

          {/* LEFT: Form */}
          <section className={card}>
            <div className={hdr}>
              <span>{editCourierIdx !== null ? `Editing Rate #${editCourierIdx + 1}` : "Add Courier Rate"}</span>
              {editCourierIdx !== null && (
                <button
                  onClick={() => { setCourierForm(BLANK_COURIER); setEditCourierIdx(null); }}
                  className="text-[10px] text-slate-400 hover:text-slate-700 transition"
                >
                  Cancel edit
                </button>
              )}
            </div>
            <div className={`${body} space-y-2`}>

              <div className="grid grid-cols-2 gap-2">
                <Field label="Zone">
                  <select className={sel} value={courierForm.zone} onChange={(e) => handleCourierChange("zone", e.target.value)}>
                    <option value="local">Local</option>
                    <option value="regional">Regional</option>
                    <option value="national">National</option>
                  </select>
                </Field>
                <Field label="Service Level">
                  <select className={sel} value={courierForm.serviceLevel} onChange={(e) => handleCourierChange("serviceLevel", e.target.value)}>
                    <option value="economy">Economy</option>
                    <option value="express">Express</option>
                    <option value="same-day">Same Day</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Field label="Base Price (R)">
                  <input type="number" className={inp} value={courierForm.basePrice} onChange={(e) => handleCourierChange("basePrice", e.target.value)} placeholder="e.g. 65" />
                </Field>
                <Field label="Minimum Charge (R)">
                  <input type="number" className={inp} value={courierForm.minimumCharge} onChange={(e) => handleCourierChange("minimumCharge", e.target.value)} placeholder="e.g. 45" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Field label="Included Weight (kg)">
                  <input type="number" className={inp} value={courierForm.includedWeightKg} onChange={(e) => handleCourierChange("includedWeightKg", e.target.value)} placeholder="e.g. 5" />
                </Field>
                <Field label="Extra kg Rate (R)">
                  <input type="number" className={inp} value={courierForm.extraKgRate} onChange={(e) => handleCourierChange("extraKgRate", e.target.value)} placeholder="e.g. 8" />
                </Field>
              </div>

              <Field label="Volumetric Divisor">
                <input type="number" className={inp} value={courierForm.volumetricDivisor} onChange={(e) => handleCourierChange("volumetricDivisor", e.target.value)} placeholder="5000" />
              </Field>

              <div className="border-t border-slate-100 pt-2">
                <div className={`${lbl} mb-1`}>Max Parcel Dimensions (cm) — optional</div>
                <div className="grid grid-cols-3 gap-2">
                  <Field label="Length">
                    <input type="number" className={inp} value={courierForm.maxLengthCm} onChange={(e) => handleCourierChange("maxLengthCm", e.target.value)} placeholder="L" />
                  </Field>
                  <Field label="Width">
                    <input type="number" className={inp} value={courierForm.maxWidthCm} onChange={(e) => handleCourierChange("maxWidthCm", e.target.value)} placeholder="W" />
                  </Field>
                  <Field label="Height">
                    <input type="number" className={inp} value={courierForm.maxHeightCm} onChange={(e) => handleCourierChange("maxHeightCm", e.target.value)} placeholder="H" />
                  </Field>
                </div>
              </div>

              <button
                onClick={handleCourierSubmit}
                disabled={saving || !courierForm.basePrice || !courierForm.minimumCharge}
                className="w-full flex items-center justify-center gap-1.5 h-[30px] rounded bg-custom-blue text-white text-[10px] font-semibold hover:opacity-90 transition disabled:opacity-50 mt-1"
              >
                <PlusCircle size={12} />
                {editCourierIdx !== null ? "Update Rate" : "Add Rate"}
              </button>
            </div>
          </section>

          {/* RIGHT: Rate list */}
          <section className={card}>
            <div className={hdr}>
              <span>Saved Courier Rates ({courierRates.length})</span>
            </div>
            <div className={`${body} space-y-1.5`}>
              {courierRates.length === 0 && (
                <p className="text-[10px] text-slate-400 p-2">No courier rates added yet.</p>
              )}
              {courierRates.map((r, idx) => (
                <div key={idx} className="border border-slate-200 rounded-md overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 transition text-left"
                    onClick={() => setExpandedCourier(expandedCourier === idx ? null : idx)}
                  >
                    <span className="text-[10px] font-semibold text-slate-700 capitalize">
                      {r.zone} · {r.serviceLevel}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-custom-blue">R{r.basePrice}</span>
                      {expandedCourier === idx ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </div>
                  </button>

                  {expandedCourier === idx && (
                    <div className="px-2.5 py-2 space-y-1 bg-white text-[10px] text-slate-600">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        <span>Base price: <b>R{r.basePrice}</b></span>
                        <span>Minimum: <b>R{r.minimumCharge}</b></span>
                        <span>Included weight: <b>{r.includedWeightKg}kg</b></span>
                        <span>Extra kg: <b>R{r.extraKgRate}/kg</b></span>
                        <span>Vol. divisor: <b>{r.volumetricDivisor}</b></span>
                        {r.maxLengthCm > 0 && (
                          <span>Max dims: <b>{r.maxLengthCm}×{r.maxWidthCm}×{r.maxHeightCm}cm</b></span>
                        )}
                      </div>
                      <div className="flex gap-2 pt-1 border-t border-slate-100">
                        <button onClick={() => handleEditCourier(idx)} className={`${btnSm} border-slate-200 text-slate-600 hover:bg-slate-50`}>
                          Edit
                        </button>
                        <button onClick={() => dispatch(deleteCourierRate(idx))} className={`${btnSm} border-red-200 text-red-500 hover:bg-red-50`}>
                          <Trash2 size={10} /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ════════════════════════════════
          TRUCK TAB
      ════════════════════════════════ */}
      {tab === "truck" && (
        <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">

          {/* LEFT: Form */}
          <section className={card}>
            <div className={hdr}>
              <span>{editTruckIdx !== null ? `Editing Rate #${editTruckIdx + 1}` : "Add Truck Rate"}</span>
              {editTruckIdx !== null && (
                <button
                  onClick={() => { setTruckForm(BLANK_TRUCK); setEditTruckIdx(null); }}
                  className="text-[10px] text-slate-400 hover:text-slate-700 transition"
                >
                  Cancel edit
                </button>
              )}
            </div>
            <div className={`${body} space-y-2`}>

              <div className="grid grid-cols-2 gap-2">
                <Field label="Vehicle Type">
                  <select className={sel} value={truckForm.vehicleType} onChange={(e) => handleTruckChange("vehicleType", e.target.value)}>
                    {["bakkie","half-ton","1-ton","4-ton","8-ton","superlink","flatbed","refrigerated","container"].map((v) => (
                      <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Load Type">
                  <select className={sel} value={truckForm.loadType} onChange={(e) => handleTruckChange("loadType", e.target.value)}>
                    <option value="FTL">FTL — Full Load</option>
                    <option value="LTL">LTL — Part Load</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Field label="Minimum Charge (R)">
                  <input type="number" className={inp} value={truckForm.minimumCharge} onChange={(e) => handleTruckChange("minimumCharge", e.target.value)} placeholder="e.g. 850" />
                </Field>
                <Field label="Rate per km (R)">
                  <input type="number" className={inp} value={truckForm.ratePerKm} onChange={(e) => handleTruckChange("ratePerKm", e.target.value)} placeholder="e.g. 12.50" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Field label="Rate per kg (R)">
                  <input type="number" className={inp} value={truckForm.ratePerKg} onChange={(e) => handleTruckChange("ratePerKg", e.target.value)} placeholder="e.g. 0.80" />
                </Field>
                <Field label="Included km">
                  <input type="number" className={inp} value={truckForm.includedKm} onChange={(e) => handleTruckChange("includedKm", e.target.value)} placeholder="e.g. 50" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Field label="Fuel Surcharge (%)">
                  <input type="number" className={inp} value={truckForm.fuelSurchargePercent} onChange={(e) => handleTruckChange("fuelSurchargePercent", e.target.value)} placeholder="e.g. 8.5" />
                </Field>
                <Field label="Handling Fee (R)">
                  <input type="number" className={inp} value={truckForm.handlingFee} onChange={(e) => handleTruckChange("handlingFee", e.target.value)} placeholder="e.g. 250" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Field label="Capacity (kg)">
                  <input type="number" className={inp} value={truckForm.capacityKg} onChange={(e) => handleTruckChange("capacityKg", e.target.value)} placeholder="e.g. 30000" />
                </Field>
                <Field label="Estimated Transit">
                  <input type="text" className={inp} value={truckForm.estimatedDays} onChange={(e) => handleTruckChange("estimatedDays", e.target.value)} placeholder="e.g. 1-3 days" />
                </Field>
              </div>

              <button
                onClick={handleTruckSubmit}
                disabled={saving || !truckForm.minimumCharge}
                className="w-full flex items-center justify-center gap-1.5 h-[30px] rounded bg-custom-blue text-white text-[10px] font-semibold hover:opacity-90 transition disabled:opacity-50 mt-1"
              >
                <PlusCircle size={12} />
                {editTruckIdx !== null ? "Update Rate" : "Add Rate"}
              </button>
            </div>
          </section>

          {/* RIGHT: Rate list */}
          <section className={card}>
            <div className={hdr}>
              <span>Saved Truck Rates ({truckRates.length})</span>
            </div>
            <div className={`${body} space-y-1.5`}>
              {truckRates.length === 0 && (
                <p className="text-[10px] text-slate-400 p-2">No truck rates added yet.</p>
              )}
              {truckRates.map((r, idx) => (
                <div key={idx} className="border border-slate-200 rounded-md overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 transition text-left"
                    onClick={() => setExpandedTruck(expandedTruck === idx ? null : idx)}
                  >
                    <span className="text-[10px] font-semibold text-slate-700 capitalize">
                      {r.vehicleType} · {r.loadType}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-custom-blue">R{r.minimumCharge} min</span>
                      {expandedTruck === idx ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </div>
                  </button>

                  {expandedTruck === idx && (
                    <div className="px-2.5 py-2 space-y-1 bg-white text-[10px] text-slate-600">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        <span>Min charge: <b>R{r.minimumCharge}</b></span>
                        <span>Rate/km: <b>R{r.ratePerKm}/km</b></span>
                        <span>Rate/kg: <b>R{r.ratePerKg}/kg</b></span>
                        <span>Included km: <b>{r.includedKm}km</b></span>
                        <span>Fuel surcharge: <b>{r.fuelSurchargePercent}%</b></span>
                        <span>Handling: <b>R{r.handlingFee}</b></span>
                        <span>Capacity: <b>{r.capacityKg}kg</b></span>
                        <span>Transit: <b>{r.estimatedDays}</b></span>
                      </div>
                      <div className="flex gap-2 pt-1 border-t border-slate-100">
                        <button onClick={() => handleEditTruck(idx)} className={`${btnSm} border-slate-200 text-slate-600 hover:bg-slate-50`}>
                          Edit
                        </button>
                        <button onClick={() => dispatch(deleteTruckRate(idx))} className={`${btnSm} border-red-200 text-red-500 hover:bg-red-50`}>
                          <Trash2 size={10} /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}