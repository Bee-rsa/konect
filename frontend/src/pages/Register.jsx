import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/slices/authSlice";
import PasswordStrengthBar from "../components/Tools/PasswordStrengthMeter";
import RegisterImage from "../assets/Register Page Photo.png";
import { Eye, EyeOff } from "react-feather";

const Register = () => {
  const [role, setRole] = useState("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, guestId, loading } = useSelector((state) => state.auth || {});
  const cart = useSelector(
    (state) => state.cart?.cart || state.cart || { products: [] }
  );

  const redirect =
    new URLSearchParams(location.search).get("redirect") || "/user-home";
  const isCheckoutRedirect = redirect.includes("checkout");

  useEffect(() => {
    if (!user) return;

    // Company users go straight to company home
    if (user.role === "company") {
      navigate("/company-home");
      return;
    }

    /*
    if (isCheckoutRedirect && cart?.products?.length > 0 && guestId) {
      dispatch(mergeCart({ guestId, user })).then(() => {
        navigate("/checkout");
      });
      return;
    }
    */

    if (!user.hasAcceptedTerms) {
      navigate("/terms&conditions");
      return;
    }

    if (!user.hasSeenWelcome) {
      navigate("/welcome");
      return;
    }

    if (isCheckoutRedirect) {
      navigate("/checkout");
      return;
    }

    navigate("/user-home");
  }, [user, guestId, cart, navigate, isCheckoutRedirect]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser({ name, email, password, role }));
  };

  return (
    <div className="min-h-screen bg-white font-poppins">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_0.9fr] xl:grid-cols-[1fr_0.85fr]">
        {/* LEFT SIDE */}
        <div className="flex items-center justify-start pl-4 md:pl-6 lg:pl-8 xl:pl-10">
          <div className="w-full max-w-md pr-4">
            <div className="mb-6">
              <Link
                to="/"
                className="text-2xl font-semibold mt-12 tracking-tight text-custom-blue"
              >
                Konect
              </Link>

              <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                Create account
              </h1>

              <p className="mt-2 text-sm text-slate-600 md:text-base">
                Register your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6">
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Register as
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("customer")}
                    className={`h-12 rounded-xl border text-sm font-medium transition ${
                      role === "customer"
                        ? "border-custom-blue bg-custom-blue text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    User
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("company")}
                    className={`h-12 rounded-xl border text-sm font-medium transition ${
                      role === "company"
                        ? "border-custom-blue bg-custom-blue text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Company
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    role === "company"
                      ? "Enter company or contact name"
                      : "Enter your full name"
                  }
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-custom-blue"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-custom-blue"
                />
              </div>

              <div className="mb-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm text-slate-900 outline-none transition focus:border-custom-blue"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 transition hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <PasswordStrengthBar password={password} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-custom-blue text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading
                  ? "Creating account..."
                  : role === "company"
                  ? "Register Company"
                  : "Register"}
              </button>
            </form>

            <div className="mt-4 text-xs leading-5 text-slate-500">
              <p className="mb-2">
                By signing up, I accept the Cargo Konect terms and conditions.
              </p>
              <p>
                I agree to receive freight-related updates, industry insights,
                and marketing communications from Cargo Konect. I know I can opt
                out at any time.
              </p>
            </div>

            <div className="mt-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667h-3.554v-11.452h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zM7.119 20.452h-3.555v-11.452h3.555v11.452z" />
                  </svg>
                  <span>LinkedIn</span>
                </button>
              </div>
            </div>

            <p className="mt-5 text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to={`/login?redirect=${encodeURIComponent(redirect)}`}
                className="font-semibold text-custom-blue hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden lg:flex h-screen w-full justify-end items-center bg-white">
          <img
            src={RegisterImage}
            alt="Register visual"
            className="h-full w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Register;