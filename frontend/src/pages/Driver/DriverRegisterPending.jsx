import { Link } from "react-router-dom";
import { FiClock, FiMail, FiCheckCircle, FiArrowRight } from "react-icons/fi";

const DriverRegisterPending = () => {
  return (
    <div className="min-h-screen font-poppins flex flex-col" style={{ backgroundColor: "#f5f5f4" }}>

      <div
        className="w-full px-6 py-5"
        style={{ background: "linear-gradient(135deg, #000042 0%, #1a3a7a 100%)" }}
      >
        <Link to="/" className="text-white font-bold text-lg tracking-tight">
          Konect <span style={{ color: "#4ade80" }}>Drive</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">

          {/* Icon */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "#F0FDF4" }}
          >
            <FiClock size={36} style={{ color: "#2E7D32" }} />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Application submitted!
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Thank you for applying to drive with Konect. Our team will review your documents and verify your details within <strong>24–48 hours</strong>. You&apos;ll receive an email once your account is approved.
          </p>

          {/* Steps */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-left space-y-4 mb-8">
            {[
              { icon: <FiCheckCircle size={16} />, label: "Application received", done: true },
              { icon: <FiClock size={16} />,       label: "Document verification — 24–48 hours", done: false },
              { icon: <FiMail size={16} />,        label: "Approval email sent to you", done: false },
              { icon: <FiArrowRight size={16} />,  label: "Go online and start earning", done: false },
            ].map(({ icon, label, done }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: done ? "#F0FDF4" : "#F8FAFC",
                    color:           done ? "#2E7D32" : "#94a3b8",
                  }}
                >
                  {icon}
                </div>
                <p className={`text-sm ${done ? "font-semibold text-slate-800" : "text-slate-400"}`}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/driver-login"
              className="w-full h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition hover:opacity-90"
              style={{ backgroundColor: "#000042" }}
            >
              Go to driver login
            </Link>
            <Link
              to="/"
              className="w-full h-12 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 transition"
            >
              Back to home
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DriverRegisterPending;