import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerDriver } from "../../redux/slices/driverSlice";
import {
  FiMail, FiPhone, FiLock, FiEye, FiEyeOff,
  FiArrowRight, FiCheck, FiShield, FiDollarSign, FiClock,
} from "react-icons/fi";

const STEPS = ["Personal", "Vehicle", "Documents", "Bank"];
const GENDER_OPTIONS = ["male", "female", "other", "prefer_not_to_say"];

const inp = "h-11 w-full rounded-xl border border-white/15 bg-white/8 px-4 text-sm text-white outline-none focus:border-white/40 focus:bg-white/12 transition placeholder-white/30";
const lbl = "block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1.5";
const err = "text-[11px] text-red-300 mt-1";

/* ── Konect branded car SVG ── */
const KonectCar = () => (
  <svg viewBox="0 0 500 280" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md">
    {/* Road / ground */}
    <rect x="0" y="230" width="500" height="50" fill="rgba(255,255,255,0.04)" rx="4" />
    <rect x="60" y="243" width="80" height="4" fill="rgba(255,255,255,0.12)" rx="2" />
    <rect x="210" y="243" width="80" height="4" fill="rgba(255,255,255,0.12)" rx="2" />
    <rect x="360" y="243" width="80" height="4" fill="rgba(255,255,255,0.12)" rx="2" />

    {/* Car shadow */}
    <ellipse cx="252" cy="236" rx="165" ry="10" fill="rgba(0,0,0,0.3)" />

    {/* Car body — main */}
    <path
      d="M60 200 L60 155 Q62 140 75 132 L155 100 Q175 88 210 85 L295 83 Q330 83 355 95 L415 130 Q430 140 435 155 L440 200 Z"
      fill="#000042"
      stroke="rgba(255,255,255,0.15)"
      strokeWidth="1.5"
    />

    {/* Car body — lower skirt */}
    <path
      d="M55 198 Q55 215 70 218 L430 218 Q445 215 445 198 L440 200 L60 200 Z"
      fill="#00003a"
      stroke="rgba(255,255,255,0.1)"
      strokeWidth="1"
    />

    {/* Roof */}
    <path
      d="M160 100 Q180 60 215 52 L290 50 Q325 50 345 70 L380 100"
      fill="none"
      stroke="rgba(255,255,255,0.08)"
      strokeWidth="1"
    />
    <path
      d="M160 100 Q180 62 215 54 L290 52 Q323 52 343 72 L378 100 Z"
      fill="#000050"
      stroke="rgba(255,255,255,0.12)"
      strokeWidth="1"
    />

    {/* Windscreen */}
    <path
      d="M168 99 Q185 68 216 61 L286 59 Q316 59 335 77 L368 99 Z"
      fill="rgba(100,180,255,0.15)"
      stroke="rgba(100,180,255,0.3)"
      strokeWidth="1.5"
    />
    {/* Windscreen glare */}
    <path
      d="M185 95 Q198 72 220 66 L255 64"
      fill="none"
      stroke="rgba(255,255,255,0.2)"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Side windows */}
    <path
      d="M162 99 L155 100 L153 130 L168 130 Z"
      fill="rgba(100,180,255,0.12)"
      stroke="rgba(100,180,255,0.2)"
      strokeWidth="1"
    />
    <path
      d="M378 99 L385 100 L387 130 L372 130 Z"
      fill="rgba(100,180,255,0.12)"
      stroke="rgba(100,180,255,0.2)"
      strokeWidth="1"
    />

    {/* Door lines */}
    <line x1="270" y1="88" x2="272" y2="200" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
    <line x1="155" y1="100" x2="153" y2="200" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    <line x1="385" y1="100" x2="387" y2="200" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

    {/* Door handles */}
    <rect x="195" y="158" width="22" height="4" rx="2" fill="rgba(255,255,255,0.25)" />
    <rect x="305" y="158" width="22" height="4" rx="2" fill="rgba(255,255,255,0.25)" />

    {/* Headlights */}
    <path d="M60 165 Q58 155 65 148 L85 143 Q95 143 98 152 L100 165 Z" fill="rgba(255,240,180,0.9)" stroke="rgba(255,200,0,0.5)" strokeWidth="1" />
    <path d="M62 166 L55 170 L50 180 L65 175 Z" fill="rgba(255,240,180,0.3)" />
    {/* Headlight inner */}
    <ellipse cx="80" cy="156" rx="10" ry="7" fill="rgba(255,255,200,0.95)" />
    <ellipse cx="80" cy="156" rx="5" ry="3.5" fill="white" />

    {/* Tail lights */}
    <path d="M440 165 Q442 155 435 148 L415 143 Q405 143 402 152 L400 165 Z" fill="rgba(255,60,60,0.8)" stroke="rgba(255,0,0,0.4)" strokeWidth="1" />
    <ellipse cx="420" cy="156" rx="9" ry="6" fill="rgba(255,80,80,0.9)" />
    <ellipse cx="420" cy="156" rx="4" ry="3" fill="rgba(255,150,150,0.9)" />

    {/* Front bumper */}
    <path d="M58 198 Q55 210 65 216 L110 218 L108 198 Z" fill="#00003a" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    {/* Front grille */}
    <path d="M65 185 Q63 175 68 170 L100 168 L102 185 Z" fill="rgba(0,0,20,0.8)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
    {/* Grille lines */}
    <line x1="72" y1="170" x2="74" y2="185" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
    <line x1="80" y1="169" x2="82" y2="185" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
    <line x1="88" y1="169" x2="90" y2="185" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
    <line x1="96" y1="169" x2="98" y2="185" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

    {/* Rear bumper */}
    <path d="M442 198 Q445 210 435 216 L390 218 L392 198 Z" fill="#00003a" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

    {/* Konect branding stripe */}
    <rect x="100" y="160" width="300" height="22" rx="3" fill="rgba(74,222,128,0.12)" />
    <rect x="100" y="160" width="300" height="3" rx="1.5" fill="#4ade80" opacity="0.8" />
    <rect x="100" y="179" width="300" height="3" rx="1.5" fill="#4ade80" opacity="0.8" />

    {/* KONECT text on car */}
    <text
      x="250"
      y="175"
      textAnchor="middle"
      fontSize="13"
      fontWeight="800"
      fontFamily="Poppins, sans-serif"
      letterSpacing="4"
      fill="rgba(255,255,255,0.85)"
    >
      KONECT
    </text>

    {/* Wheels */}
    {/* Front wheel */}
    <circle cx="148" cy="222" r="32" fill="#0a0a1a" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
    <circle cx="148" cy="222" r="24" fill="#111128" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
    <circle cx="148" cy="222" r="14" fill="#000042" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
    <circle cx="148" cy="222" r="5" fill="rgba(255,255,255,0.6)" />
    {/* Wheel spokes */}
    {[0, 60, 120, 180, 240, 300].map((angle) => (
      <line
        key={angle}
        x1={148 + 7 * Math.cos((angle * Math.PI) / 180)}
        y1={222 + 7 * Math.sin((angle * Math.PI) / 180)}
        x2={148 + 21 * Math.cos((angle * Math.PI) / 180)}
        y2={222 + 21 * Math.sin((angle * Math.PI) / 180)}
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    ))}

    {/* Rear wheel */}
    <circle cx="352" cy="222" r="32" fill="#0a0a1a" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
    <circle cx="352" cy="222" r="24" fill="#111128" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
    <circle cx="352" cy="222" r="14" fill="#000042" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
    <circle cx="352" cy="222" r="5" fill="rgba(255,255,255,0.6)" />
    {[0, 60, 120, 180, 240, 300].map((angle) => (
      <line
        key={angle}
        x1={352 + 7 * Math.cos((angle * Math.PI) / 180)}
        y1={222 + 7 * Math.sin((angle * Math.PI) / 180)}
        x2={352 + 21 * Math.cos((angle * Math.PI) / 180)}
        y2={222 + 21 * Math.sin((angle * Math.PI) / 180)}
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    ))}

    {/* Speed lines */}
    <line x1="10" y1="185" x2="50" y2="185" stroke="rgba(74,222,128,0.3)" strokeWidth="2" strokeLinecap="round" />
    <line x1="20" y1="195" x2="50" y2="195" stroke="rgba(74,222,128,0.2)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="5" y1="175" x2="45" y2="175" stroke="rgba(74,222,128,0.15)" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

const DriverRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.driver);

  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    idNumber: "", dateOfBirth: "", gender: "",
    password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "", form: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim())  e.firstName  = "First name is required.";
    if (!form.lastName.trim())   e.lastName   = "Last name is required.";
    if (!form.email.trim())      e.email      = "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.phone.trim())      e.phone      = "Phone number is required.";
    if (!form.idNumber.trim())   e.idNumber   = "ID number is required.";
    if (!form.password)          e.password   = "Password is required.";
    if (form.password.length < 8) e.password  = "Min 8 characters.";
    if (!form.confirmPassword)   e.confirmPassword = "Please confirm your password.";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    const result = await dispatch(registerDriver({
      firstName:   form.firstName.trim(),
      lastName:    form.lastName.trim(),
      email:       form.email.trim().toLowerCase(),
      phone:       form.phone.trim(),
      idNumber:    form.idNumber.trim(),
      dateOfBirth: form.dateOfBirth || undefined,
      gender:      form.gender      || undefined,
      password:    form.password,
    }));
    if (!result.error) navigate("/driver-register/vehicle");
  };

  return (
    <div
      className="min-h-screen font-poppins flex flex-col lg:flex-row"
      style={{ background: "linear-gradient(135deg, #000042 0%, #0a1a5c 60%, #1a3a7a 100%)" }}
    >

      {/* ══════════════════════════
          LEFT — Branding panel
      ══════════════════════════ */}
      <div className="w-full lg:w-[48%] flex flex-col px-8 md:px-14 pt-12 pb-10 lg:min-h-screen">

        {/* Logo */}
        <Link to="/" className="text-white font-black text-2xl tracking-tight mb-auto">
          Konect <span style={{ color: "#4ade80" }}>Drive</span>
        </Link>

        {/* Main content */}
        <div className="flex flex-col justify-center flex-1 py-12">

          {/* Pill */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest mb-8 w-fit"
            style={{ backgroundColor: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}
          >
            Driver Registration
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tight mb-5">
            Drive smarter.<br />
            Earn <span style={{ color: "#4ade80" }}>more.</span>
          </h1>

          <p className="text-sm leading-relaxed mb-10 max-w-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            Join Konect Drive and connect with passengers across South Africa. Set your own schedule, grow your income, and be part of a platform built for drivers.
          </p>

          {/* Car SVG */}
          <div className="mb-10">
            <KonectCar />
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: <FiDollarSign size={12} />, label: "Weekly payouts" },
              { icon: <FiClock size={12} />,      label: "Flexible hours" },
              { icon: <FiShield size={12} />,     label: "Full support" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <span style={{ color: "#4ade80" }}>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          Already a driver?{" "}
          <Link to="/driver-login" className="underline hover:text-white/60 transition" style={{ color: "rgba(255,255,255,0.45)" }}>
            Sign in
          </Link>
        </p>
      </div>

      {/* ══════════════════════════
          RIGHT — Form panel
      ══════════════════════════ */}
      <div
        className="w-full lg:w-[52%] flex flex-col lg:min-h-screen overflow-y-auto"
        style={{ backgroundColor: "rgba(0,0,0,0.25)", borderLeft: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex-1 px-8 md:px-14 py-12 max-w-lg w-full mx-auto">

          {/* Progress stepper */}
          <div className="flex items-center mb-10">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                    style={{
                      backgroundColor: i === 0 ? "#4ade80" : "rgba(255,255,255,0.08)",
                      color:           i === 0 ? "#000042" : "rgba(255,255,255,0.3)",
                      border:          i === 0 ? "none" : "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {i === 0 ? <FiCheck size={13} /> : i + 1}
                  </div>
                  <p
                    className="text-[9px] font-bold uppercase tracking-wider mt-1.5 whitespace-nowrap"
                    style={{ color: i === 0 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)" }}
                  >
                    {step}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className="flex-1 h-px mx-3 mb-5"
                    style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form heading */}
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#4ade80" }}>
              Step 1 of 4
            </p>
            <h2 className="text-2xl font-bold text-white mb-1">Personal information</h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              This will be verified before you can go live.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>First name</label>
                <input className={inp} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="John" />
                {errors.firstName && <p className={err}>{errors.firstName}</p>}
              </div>
              <div>
                <label className={lbl}>Last name</label>
                <input className={inp} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Smith" />
                {errors.lastName && <p className={err}>{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={lbl}>Email address</label>
              <div className="relative">
                <FiMail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }} />
                <input type="email" className={`${inp} pl-9`} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="john@example.com" />
              </div>
              {errors.email && <p className={err}>{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className={lbl}>Phone number</label>
              <div className="relative">
                <FiPhone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }} />
                <input type="tel" className={`${inp} pl-9`} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+27 82 000 0000" />
              </div>
              {errors.phone && <p className={err}>{errors.phone}</p>}
            </div>

            {/* ID */}
            <div>
              <label className={lbl}>SA ID number</label>
              <input className={inp} value={form.idNumber} onChange={(e) => set("idNumber", e.target.value)} placeholder="13-digit ID number" maxLength={13} />
              {errors.idNumber && <p className={err}>{errors.idNumber}</p>}
            </div>

            {/* DOB + Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Date of birth</label>
                <input type="date" className={inp} value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Gender</label>
                <select className={`${inp} appearance-none`} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                  <option value="" className="bg-slate-900">Select gender</option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g} className="bg-slate-900">
                      {g.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password section */}
            <div className="pt-2 space-y-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest pt-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                Create password
              </p>

              <div>
                <label className={lbl}>Password</label>
                <div className="relative">
                  <FiLock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`${inp} pl-9 pr-10`}
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    placeholder="Min 8 characters"
                  />
                  <button type="button" onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                    style={{ color: "rgba(255,255,255,0.3)" }}>
                    {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
                {errors.password && <p className={err}>{errors.password}</p>}
              </div>

              <div>
                <label className={lbl}>Confirm password</label>
                <div className="relative">
                  <FiLock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`${inp} pl-9 pr-10`}
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    placeholder="Repeat password"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                    style={{ color: "rgba(255,255,255,0.3)" }}>
                    {showConfirmPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className={err}>{errors.confirmPassword}</p>}
              </div>
            </div>

            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.25)" }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-sm font-bold transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              style={{ backgroundColor: "#4ade80", color: "#000042" }}
            >
              {loading ? "Creating account..." : "Continue to vehicle details"}
              {!loading && <FiArrowRight size={15} />}
            </button>

            <p className="text-center text-[11px] pb-6" style={{ color: "rgba(255,255,255,0.25)" }}>
              By continuing you agree to Konect&apos;s{" "}
              <Link to="/terms" className="underline transition" style={{ color: "rgba(255,255,255,0.45)" }}>Terms</Link>
              {" "}and{" "}
              <Link to="/privacy" className="underline transition" style={{ color: "rgba(255,255,255,0.45)" }}>Privacy Policy</Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default DriverRegister;