import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { completeWelcome } from "../redux/slices/authSlice";
import { motion } from "framer-motion";
import { useEffect } from "react";
import WelcomeImage from "../assets/Welcome Page Photo.jpg";

const quickStartItems = [
  {
    step: "01",
    title: "Complete your profile",
    description: "Set up your account details for a personalised experience.",
  },
  {
    step: "02",
    title: "Explore terminals",
    description: "Access logistics hubs and terminal insights.",
  },
  {
    step: "03",
    title: "Weight calculator",
    description: "Calculate shipment dimensions and costs quickly.",
  },
  {
    step: "04",
    title: "Case studies",
    description: "Learn from real-world logistics and maritime insights.",
  },
];

const WelcomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const handleFinish = async () => {
    const result = await dispatch(completeWelcome());
    if (!result.error) navigate("/user-home");
  };

  const handleSkip = async () => {
    const result = await dispatch(completeWelcome());
    if (!result.error) navigate("/user-home");
  };

  if (!user) return null;

  return (
    <div className="h-screen overflow-hidden bg-slate-50 font-poppins">
      <div className="flex h-screen">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid h-full w-full overflow-hidden bg-white lg:grid-cols-12"
        >
          {/* LEFT */}
          <div className="flex h-full flex-col px-6 py-6 lg:col-span-7 xl:col-span-8">
            {/* TOP CONTENT */}
            <div>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900 md:text-3xl">
                Welcome to Cargo Konect{user?.name ? `, ${user.name}` : ""}
              </h1>

              <p className="mt-2 max-w-xl text-sm text-slate-600">
                Your account is ready. Cargo Konect helps you explore logistics,
                analyse freight, and make smarter shipping decisions.
              </p>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {quickStartItems.map((item) => (
                  <div
                    key={item.step}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-custom-blue">
                      {item.step}
                    </div>

                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="text-sm text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BUTTON SECTION */}
            <div className="mt-48 border-t border-slate-200 pt-4">
              <p className="mb-3 text-sm text-slate-600">
                Continue to complete your setup or skip for now.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleFinish}
                  disabled={loading}
                  className="rounded-lg bg-custom-blue px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Finish Setup"}
                </button>

                <button
                  onClick={handleSkip}
                  disabled={loading}
                  className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
            <img
              src={WelcomeImage}
              alt="Welcome"
              className="h-full w-full object-cover"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomePage;