import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { updateDriverBank } from "../../redux/slices/driverSlice";
import { FiArrowLeft, FiCheck, FiShield } from "react-icons/fi";

const STEPS = ["Personal Info", "Vehicle", "Documents", "Bank Details"];

const SA_BANKS = [
  "ABSA", "Capitec", "FNB", "Nedbank",
  "Standard Bank", "African Bank", "TymeBank",
  "Discovery Bank", "Investec", "Other",
];

const fieldCls = "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none focus:border-custom-blue focus:ring-1 focus:ring-custom-blue/10 transition placeholder-slate-400";
const labelCls = "block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5";
const errorCls = "text-xs text-red-500 mt-1";

const DriverRegisterBank = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.driver);

  const [form, setForm] = useState({
    bankName:      "",
    accountHolder: "",
    accountNumber: "",
    accountType:   "cheque",
    branchCode:    "",
  });

  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.bankName)             e.bankName      = "Please select your bank.";
    if (!form.accountHolder.trim()) e.accountHolder = "Account holder name is required.";
    if (!form.accountNumber.trim()) e.accountNumber = "Account number is required.";
    if (!/^\d{8,18}$/.test(form.accountNumber)) e.accountNumber = "Enter a valid account number.";
    if (!form.branchCode.trim())    e.branchCode    = "Branch code is required.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    const result = await dispatch(updateDriverBank(form));
    if (!result.error) navigate("/driver-register/pending");
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
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: "#000042",
                      color: "white",
                    }}
                  >
                    {i < 3 ? <FiCheck size={13} /> : i + 1}
                  </div>
                  <p className="text-[10px] font-semibold mt-1.5 text-center whitespace-nowrap text-slate-800">
                    {step}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px mb-5 mx-2" style={{ backgroundColor: "#000042" }} />
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
              <FiShield size={11} /> Step 4 of 4
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Bank details</h1>
            <p className="text-sm text-slate-500 mt-1">
              Your earnings will be paid directly to this account every week.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">

            {/* Bank */}
            <div>
              <label className={labelCls}>Bank</label>
              <select
                className={`${fieldCls} appearance-none`}
                value={form.bankName}
                onChange={(e) => set("bankName", e.target.value)}
              >
                <option value="">Select your bank</option>
                {SA_BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              {errors.bankName && <p className={errorCls}>{errors.bankName}</p>}
            </div>

            {/* Account holder */}
            <div>
              <label className={labelCls}>Account holder name</label>
              <input
                className={fieldCls}
                value={form.accountHolder}
                onChange={(e) => set("accountHolder", e.target.value)}
                placeholder="As it appears on your bank statement"
              />
              {errors.accountHolder && <p className={errorCls}>{errors.accountHolder}</p>}
            </div>

            {/* Account number */}
            <div>
              <label className={labelCls}>Account number</label>
              <input
                type="number"
                className={fieldCls}
                value={form.accountNumber}
                onChange={(e) => set("accountNumber", e.target.value)}
                placeholder="Your account number"
              />
              {errors.accountNumber && <p className={errorCls}>{errors.accountNumber}</p>}
            </div>

            {/* Account type + Branch code */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Account type</label>
                <select
                  className={`${fieldCls} appearance-none`}
                  value={form.accountType}
                  onChange={(e) => set("accountType", e.target.value)}
                >
                  <option value="cheque">Cheque / Current</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Branch code</label>
                <input
                  className={fieldCls}
                  value={form.branchCode}
                  onChange={(e) => set("branchCode", e.target.value)}
                  placeholder="e.g. 632005"
                  maxLength={6}
                />
                {errors.branchCode && <p className={errorCls}>{errors.branchCode}</p>}
              </div>
            </div>

            {/* Security note */}
            <div
              className="flex items-start gap-3 rounded-xl px-4 py-3 text-xs leading-relaxed"
              style={{ backgroundColor: "#F0FDF4", color: "#2E7D32" }}
            >
              <FiShield size={14} className="flex-shrink-0 mt-0.5" />
              <p>
                Your bank details are encrypted and stored securely. They are only used for weekly earnings payouts and are never shared with passengers.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/driver-register/documents")}
                className="flex items-center gap-2 px-5 h-12 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                <FiArrowLeft size={14} /> Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#2E7D32" }}
              >
                {loading ? "Submitting..." : "Submit application"}
                {!loading && <FiCheck size={15} />}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default DriverRegisterBank;