import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginDriver, clearDriverError } from "../../redux/slices/driverSlice";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";

const fieldCls = "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none focus:border-custom-blue focus:ring-1 focus:ring-custom-blue/10 transition placeholder-slate-400";
const labelCls = "block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5";

const DriverLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, driver } = useSelector((s) => s.driver);

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  // If already logged in redirect to dashboard
  useEffect(() => {
    if (driver) navigate("/driver-home");
  }, [driver, navigate]);

  useEffect(() => {
    return () => dispatch(clearDriverError());
  }, [dispatch]);

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
    if (error) dispatch(clearDriverError());
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim())    e.email    = "Email is required.";
    if (!form.password)        e.password = "Password is required.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    const result = await dispatch(loginDriver({
      email:    form.email.trim().toLowerCase(),
      password: form.password,
    }));

    if (!result.error) {
      const status = result.payload?.driver?.status;
      if (status === "pending") {
        navigate("/driver-register/pending");
      } else {
        navigate("/driver-home");
      }
    }
  };

  return (
    <div className="min-h-screen font-poppins flex flex-col" style={{ backgroundColor: "#f5f5f4" }}>

      {/* Header */}
      <div
        className="w-full px-6 py-5 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #000042 0%, #1a3a7a 100%)" }}
      >
        <Link to="/" className="text-white font-bold text-lg tracking-tight">
          Konect <span style={{ color: "#4ade80" }}>Drive</span>
        </Link>
        <Link
          to="/driver-register"
          className="text-[12px] text-white/60 hover:text-white transition"
        >
          New driver? Apply here
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {/* Hero text */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: "#F0F0F8" }}
            >
              <span className="text-2xl font-black" style={{ color: "#000042" }}>K</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h1>
            <p className="text-sm text-slate-500">Sign in to your Konect driver account</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* Pending notice if redirected */}
            {driver?.status === "pending" && (
              <div
                className="px-6 py-4 text-sm border-b border-slate-100"
                style={{ backgroundColor: "#FFF7ED", color: "#C2410C" }}
              >
                Your account is pending approval. You&apos;ll be notified by email within 24–48 hours.
              </div>
            )}

            <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">

              {/* Email */}
              <div>
                <label className={labelCls}>Email address</label>
                <div className="relative">
                  <FiMail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    className={`${fieldCls} pl-9`}
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelCls}>Password</label>
                  <Link
                    to="/driver-forgot-password"
                    className="text-[11px] text-slate-400 hover:text-slate-600 transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <FiLock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`${fieldCls} pl-9 pr-10`}
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    placeholder="Your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              {/* API error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#000042" }}
              >
                {loading ? "Signing in..." : "Sign in"}
                {!loading && <FiArrowRight size={15} />}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[11px] text-slate-400">or</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <Link
                to="/driver-register"
                className="w-full h-12 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 transition"
              >
                Apply to become a driver
              </Link>

            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Are you a passenger?{" "}
            <Link to="/login" className="underline hover:text-slate-600">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriverLogin;