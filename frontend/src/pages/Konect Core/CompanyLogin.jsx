import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthError, loginCompany } from "../../redux/slices/authSlice.js";
import BusinessLoginImage from "../../assets/184621ad643dcef9893fc10f9cc6e036.jpg";
import CompanyHomePage from "./CompanyHomePage.jsx";

const CompanyLogin = () => {
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth || {});

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await dispatch(loginCompany(formData)).unwrap();

      const user = result?.user;

      const isCompanyUser =
        user?.role === "master_holder" ||
        user?.role === "branch_admin" ||
        user?.role === "user" ||
        user?.role === "read_only" ||
        user?.company ||
        user?.branch;

      if (isCompanyUser) {
        setIsTransitioning(true);

        setTimeout(() => {
          window.location.href = "/company-home";
        }, 650);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ FIX: clean display name
  const displayName =
    formData.identifier?.includes("@")
      ? formData.identifier.split("@")[0]
      : formData.identifier;

  return (
    <div className="relative h-screen w-screen overflow-hidden">

      {/* 🔥 TWO PAGE SLIDER */}
      <div
        className="flex h-full w-[200vw]"
        style={{
          transform: isTransitioning ? "translateX(-100vw)" : "translateX(0vw)",
          transition: "transform 650ms linear",
        }}
      >

        {/* ================= LOGIN PAGE ================= */}
        <div className="h-full w-screen flex">

          {/* LEFT FORM */}
          <div className="flex w-2/5 items-center justify-center bg-white px-10">
            <div className="w-full max-w-md relative pb-16">

              {/* Logo */}
              <div className="mb-8">
                <Link
                  to="/"
                  className="text-4xl font-semibold text-custom-blue inline-block"
                >
                  Konect Core
                </Link>
              </div>

              {/* Welcome */}
              <div className="mb-6">
               <h1 className="text-2xl font-semibold text-slate-900">
  {displayName ? (
    <>
      Welcome back,{" "}
      <span className="text-black">{displayName}</span>!
    </>
  ) : (
    "Welcome back!"
  )}
</h1>

                <p className="mt-2 text-sm text-slate-600">
                  Sign into your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Email or Username
                  </label>

                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Email or Username"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Password"
                  />
                </div>

                {/* Remember Me + Forgot Password */}
                <div className="flex items-center justify-between">

                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 border border-slate-300"
                    />
                    Remember Me
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-custom-blue hover:underline"
                  >
                    Forgot Password?
                  </Link>

                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || isTransitioning}
                  className="w-full rounded-md bg-custom-blue px-4 py-2 text-white"
                >
                  {loading ? "Logging in..." : "Log In"}
                </button>

                {/* Company Register */}
                <div className="text-left text-sm text-slate-600">
                  Don&apos;t have a Company Account?{" "}
                  <Link
                    to="/company-register"
                    className="font-medium text-custom-blue hover:underline"
                  >
                    Register
                  </Link>
                </div>

              </form>

            </div>

            {/* COPYRIGHT */}
            <div className="absolute bottom-4 left-4">
              <p className="text-xs text-slate-500">
                © {new Date().getFullYear()} Konect Core ™. All rights reserved.
              </p>
            </div>

          </div>

          {/* RIGHT IMAGE */}
          <div className="w-3/5 h-full overflow-hidden relative">

            <img
              src={BusinessLoginImage}
              alt="Warehouse"
              className="h-full w-auto"
              style={{ display: "block" }}
            />

            <div className="absolute inset-0 bg-black/20" />
          </div>

        </div>

        {/* ================= HOME PAGE ================= */}
        <div className="h-full w-screen bg-slate-200 overflow-hidden">
          <CompanyHomePage />
        </div>

      </div>
    </div>
  );
};

export default CompanyLogin;