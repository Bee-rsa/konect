import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiArrowRight, FiArrowLeft, FiUpload, FiCheck, FiFile } from "react-icons/fi";

const STEPS = ["Personal Info", "Vehicle", "Documents", "Bank Details"];

const DOCS = [
  {
    key:      "idDocument",
    label:    "South African ID / Passport",
    hint:     "Clear photo or scan of both sides",
    required: true,
  },
  {
    key:      "license",
    label:    "Driver's license",
    hint:     "Front and back — must be valid and not expired",
    required: true,
  },
  {
    key:      "registration",
    label:    "Vehicle registration (disc)",
    hint:     "Current year's license disc",
    required: true,
  },
  {
    key:      "roadworthy",
    label:    "Roadworthy certificate",
    hint:     "Valid roadworthy cert for your vehicle",
    required: true,
  },
  {
    key:      "insurance",
    label:    "Vehicle insurance",
    hint:     "Comprehensive or third-party insurance",
    required: true,
  },
  {
    key:      "profilePhoto",
    label:    "Profile photo",
    hint:     "Clear face photo — passengers will see this",
    required: true,
  },
];

const labelCls = "block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5";

const DriverRegisterDocuments = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState({});
  const [errors, setErrors] = useState({});

  const handleFile = (key, file) => {
    if (!file) return;
    setFiles((p) => ({ ...p, [key]: file }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    DOCS.filter((d) => d.required).forEach((d) => {
      if (!files[d.key]) e[d.key] = "This document is required.";
    });
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    // Store files in sessionStorage as base64 for next step
    // In production you'd upload to S3/Cloudinary here
    // For now we just navigate — backend upload happens on final submit
    navigate("/driver-register/bank");
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
                      backgroundColor: i <= 2 ? "#000042" : "#e2e8f0",
                      color: i <= 2 ? "white" : "#94a3b8",
                    }}
                  >
                    {i < 2 ? <FiCheck size={13} /> : i + 1}
                  </div>
                  <p className={`text-[10px] font-semibold mt-1.5 text-center whitespace-nowrap
                    ${i <= 2 ? "text-slate-800" : "text-slate-400"}`}>
                    {step}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px mb-5 mx-2"
                    style={{ backgroundColor: i < 2 ? "#000042" : "#e2e8f0" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          <div className="px-8 py-6 border-b border-slate-100">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest mb-3"
              style={{ backgroundColor: "#FFF7ED", color: "#C2410C" }}
            >
              <FiFile size={11} /> Step 3 of 4
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Upload documents</h1>
            <p className="text-sm text-slate-500 mt-1">
              All documents are reviewed by the Konect team before your account is approved. Accepted formats: JPG, PNG, PDF.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">

            {DOCS.map(({ key, label, hint, required }) => {
              const uploaded = !!files[key];
              return (
                <div key={key}>
                  <label className={labelCls}>
                    {label} {required && <span className="text-red-400">*</span>}
                  </label>
                  <label
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 border-dashed cursor-pointer transition
                      ${uploaded
                        ? "border-green-400 bg-green-50"
                        : errors[key]
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                        ${uploaded ? "bg-green-100" : "bg-white border border-slate-200"}`}
                    >
                      {uploaded
                        ? <FiCheck size={16} className="text-green-600" />
                        : <FiUpload size={16} className="text-slate-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      {uploaded ? (
                        <>
                          <p className="text-sm font-semibold text-green-700 truncate">
                            {files[key].name}
                          </p>
                          <p className="text-xs text-green-500 mt-0.5">
                            {(files[key].size / 1024).toFixed(0)} KB — tap to replace
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-slate-700">
                            Tap to upload
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={(e) => handleFile(key, e.target.files[0])}
                    />
                  </label>
                  {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
                </div>
              );
            })}

            {/* Info note */}
            <div
              className="rounded-xl px-4 py-3 text-xs leading-relaxed"
              style={{ backgroundColor: "#F0F0F8", color: "#000042" }}
            >
              <strong>Document review takes 24–48 hours.</strong> You&apos;ll receive an email once your account is approved and you can start accepting rides.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/driver-register/vehicle")}
                className="flex items-center gap-2 px-5 h-12 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                <FiArrowLeft size={14} /> Back
              </button>
              <button
                type="submit"
                className="flex-1 h-12 rounded-xl text-sm font-bold text-white transition hover:opacity-90 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#000042" }}
              >
                Continue to bank details <FiArrowRight size={15} />
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default DriverRegisterDocuments;