import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import loginImage from "../assets/Login Page Photo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

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

    if (user.role === "company") {
      navigate("/company-home");
      return;
    }

    if (user.role === "admin") {
      navigate("/admin");
      return;
    }

    if (!user.hasAcceptedTerms) {
      navigate("/terms&conditions");
      return;
    }

    if (!user.hasSeenWelcome) {
      navigate("/welcome");
      return;
    }

    navigate(isCheckoutRedirect ? "/checkout" : "/user-home");
  }, [user, guestId, cart, navigate, isCheckoutRedirect]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password, rememberMe })); // role removed
  };

  return (
    <div className="min-h-screen bg-white font-poppins">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_0.9fr] xl:grid-cols-[1fr_0.85fr]">

        {/* LEFT SIDE */}
        <div className="flex items-center justify-start pl-4 md:pl-6 lg:pl-8 xl:pl-10">
          <div className="w-full max-w-md">

            <div className="mb-6">
              <Link to="/" className="text-4xl font-semibold tracking-tight text-custom-blue">
                Konect
              </Link>
              <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-slate-600">Sign into your account</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6">

              {/* EMAIL */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-custom-blue"
                />
              </div>

              {/* PASSWORD */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-custom-blue"
                />
              </div>

              {/* REMEMBER */}
              <div className="mb-5 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-sm text-slate-600 hover:text-custom-blue">
                  Forgot password?
                </Link>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-custom-blue text-white font-semibold"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <p className="mt-5 text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                to={`/register?redirect=${encodeURIComponent(redirect)}`}
                className="font-semibold text-custom-blue hover:underline"
              >
                Register now!
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden lg:flex h-screen w-full justify-end items-center">
          <img src={loginImage} alt="Login visual" className="h-full w-auto object-contain" />
        </div>
      </div>
    </div>
  );
};

export default Login;