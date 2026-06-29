import Navbar from "../components/common/Navbar";
import RideSearchBar from "../userComponents/RideSearchBar";
import { FiArrowRight, FiCheck, FiUsers, FiTruck, FiShield, FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";

const Ride = () => {
  return (
    <div className="w-full min-h-screen flex flex-col font-poppins" style={{ backgroundColor: "#f5f5f4" }}>

      {/* Navbar pinned on top with high z-index */}
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* RideSearchBar below */}
      <div className="relative z-0">
        <RideSearchBar />
      </div>

      {/* ── SECTIONS ── */}
      <div className="w-full px-6 md:px-12 lg:px-20 py-24 max-w-screen-2xl mx-auto space-y-24">

        {/* ── WORK / LIFT CLUBS ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Commute smarter</p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-5" style={{ color: "#000042" }}>
              Work lift clubs,<br /> made effortless
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-md">
              Share your daily commute with colleagues, neighbours, or coworkers heading the same way. Save on fuel, reduce traffic, and arrive together. Konect Ride makes it easy to coordinate recurring shared rides for your workplace or community.
            </p>
            <div className="space-y-3 mb-8">
              {[
                "Schedule recurring shared rides in advance",
                "Split costs automatically between passengers",
                "Verified drivers for corporate accounts",
                "Dedicated support for workplace groups",
              ].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#000042" }}>
                    <FiCheck size={10} className="text-white" />
                  </div>
                  <p className="text-sm text-slate-600">{f}</p>
                </div>
              ))}
            </div>
            <Link
              to="/lift-clubs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
              style={{ backgroundColor: "#000042" }}
            >
              Start a lift club <FiArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <FiUsers size={22} />, value: "4 seats",  label: "Per shared ride",       bg: "#F0F0F8", color: "#000042" },
              { icon: <FiShield size={22} />, value: "Verified", label: "Drivers & routes",      bg: "#F0FDF4", color: "#2E7D32" },
              { icon: <FiTruck size={22} />,  value: "Daily",    label: "Recurring scheduling",  bg: "#FFF7ED", color: "#C2410C" },
              { icon: <FiStar size={22} />,   value: "Rated",    label: "Community drivers",     bg: "#EFF6FF", color: "#1565C0" },
            ].map(({ icon, value, label, bg, color }) => (
              <div key={label} className="rounded-2xl p-6 flex flex-col gap-3" style={{ backgroundColor: bg }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "white", color }}>
                  {icon}
                </div>
                <p className="text-xl font-bold" style={{ color }}>{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── BECOME A DRIVER ── */}
        <section
          className="rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #000042 0%, #0a1a5c 60%, #1a3a7a 100%)" }}
        >
          <div className="relative px-10 md:px-16 py-16">
            <div className="absolute inset-0 opacity-5"
              style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
            />
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Earn with Konect
                </p>
                <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-5">
                  Become a<br />
                  <span style={{ color: "#4ade80" }}>Konect driver</span>
                </h2>
                <p className="text-sm leading-relaxed mb-8 max-w-md" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Drive on your own schedule. Whether full-time or part-time, Konect Ride connects you with passengers across South Africa. Set your hours, earn on your terms, and grow your income with a platform built for drivers.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    "Flexible hours — drive when you want",
                    "Weekly earnings paid directly to your account",
                    "In-app navigation and support",
                    "No fixed targets or penalties",
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#2E7D32" }}>
                        <FiCheck size={10} className="text-white" />
                      </div>
                      <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>{f}</p>
                    </div>
                  ))}
                </div>
                <Link
                  to="/driver-register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                  style={{ backgroundColor: "#2E7D32" }}
                >
                  Apply to drive <FiArrowRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "R8k+", label: "Average monthly earnings", sub: "For full-time drivers" },
                  { value: "48hr", label: "Onboarding time",          sub: "From signup to first ride" },
                  { value: "4.8★", label: "Average driver rating",    sub: "Across the platform" },
                  { value: "24/7", label: "Driver support",           sub: "Always available" },
                ].map(({ value, label, sub }) => (
                  <div key={label} className="rounded-2xl p-5" style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <p className="text-2xl font-bold text-white mb-1">{value}</p>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</p>
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── SAFETY ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="grid grid-cols-1 gap-4 order-2 lg:order-1">
            {[
              { icon: <FiShield size={18} />, title: "Verified driver profiles", desc: "Every driver is background-checked, licensed, and approved before their first trip.", color: "#000042", bg: "#F0F0F8" },
              { icon: <FiUsers size={18} />,  title: "Share your trip",          desc: "Share your live trip status with family or friends directly from the app.",            color: "#2E7D32", bg: "#F0FDF4" },
              { icon: <FiStar size={18} />,   title: "Two-way ratings",          desc: "Both drivers and passengers are rated — keeping every ride accountable.",              color: "#1565C0", bg: "#EFF6FF" },
            ].map(({ icon, title, desc, color, bg }) => (
              <div key={title} className="flex items-start gap-4 bg-white rounded-2xl border border-slate-100 p-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg, color }}>
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-1">{title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Your safety, our priority</p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-5" style={{ color: "#000042" }}>
              Every ride,<br /> built safe
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-md">
              Konect Ride is designed with safety at its core. From driver verification to in-app emergency tools, every feature is built to give you confidence — whether you're commuting to work or travelling after hours.
            </p>
          </div>
        </section>

        {/* ── CORPORATE ACCOUNTS ── */}
        <section className="bg-white rounded-2xl border border-slate-100 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">For businesses</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "#000042" }}>
              Corporate ride accounts
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md">
              Manage employee travel, set spend limits, receive consolidated invoicing, and track every business trip from a single dashboard. Konect Corporate keeps your team moving efficiently.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              to="/corporate"
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
              style={{ backgroundColor: "#000042" }}
            >
              Set up corporate account <FiArrowRight size={14} />
            </Link>
            <Link
              to="/corporate-demo"
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              Request a demo
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Ride;