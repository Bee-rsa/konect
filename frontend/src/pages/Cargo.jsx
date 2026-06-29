import { Link } from "react-router-dom";
import {
  FiShield, FiClipboard, FiDollarSign, FiArrowRight,
} from "react-icons/fi";
import Navbar from "../components/Common/Navbar";
import SearchBar from "../userComponents/SearchBar";
import HowItWorks from "../components/Layout/HowItWorks";


const Cargo = () => {
  

  return (
    <div className="w-full min-h-screen flex flex-col font-poppins" style={{ backgroundColor: "#f5f5f4" }}>
      <Navbar />

      {/* ── HERO ── */}
      <div
  className="relative w-full overflow-visible"
  style={{ background: "linear-gradient(135deg, #000042 0%, #0a1a5c 60%, #1a3a7a 100%)" }}
>
        {/* Background texture dots */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-32">

          {/* Headline */}
          <div className="text-center text-white mb-10">
            <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight mb-4">
              Compare <span style={{ color: "#2E7D32" }}>Freight Rates</span> Instantly
            </h1>
            <p className="text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
              Get competitive quotes from registered Konect Kore providers.
            </p>
          </div>

          {/* SearchBar */}
          <SearchBar />

          {/* Stats row */}
          <div className="flex items-center justify-center gap-10 mt-8">
            {[
              { value: "50+",  label: "Providers" },
              { value: "14",   label: "Cities" },
              { value: "SADC", label: "Coverage" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-xl font-bold text-white">{value}</div>
                <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-16">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#f5f5f4" />
          </svg>
        </div>
      </div>

<div className="w-full px-6 md:px-12 lg:px-20 py-16 space-y-20 max-w-screen-2xl mx-auto">

  {/* HOW IT WORKS */}
  <HowItWorks />

        {/* SERVICE CARDS */}
        <div>
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Additional services</p>
            <h2 className="text-2xl font-bold" style={{ color: "#000042" }}>More from Konect</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                to: "/insurance", icon: <FiShield size={22} />,
                title: "Cargo Insurance",
                desc: "Protect your shipments against loss, theft and damage with comprehensive cargo cover.",
                points: ["Loss and damage protection", "Fast claims process", "Domestic and international"],
                cta: "Get Insured", color: "#1565C0", bg: "#EFF6FF",
              },
              {
                to: "/terms-and-conditions-tenders", icon: <FiClipboard size={22} />,
                title: "Transportation Tenders",
                desc: "Post freight requirements and receive competitive quotes from verified providers.",
                points: ["Post shipping needs", "Multiple quotes", "Compare and select"],
                cta: "Create Tender", color: "#000042", bg: "#F0F0F8",
              },
              {
                to: "/credit", icon: <FiDollarSign size={22} />,
                title: "Cargo Credit",
                desc: "Flexible logistics financing tailored for qualifying businesses in Southern Africa.",
                points: ["Available in Southern Africa", "No upfront fees", "Simple application"],
                cta: "Apply Now", color: "#2E7D32", bg: "#F0FDF4",
              },
            ].map(({ to, icon, title, desc, points, cta, color, bg }) => (
              <Link key={to} to={to} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all duration-300 flex flex-col">
                <div className="h-1 w-full" style={{ backgroundColor: color }} />
                <div className="p-6 flex flex-col flex-1">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 flex-shrink-0" style={{ backgroundColor: bg, color }}>
                    {icon}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-5 flex-1">{desc}</p>
                  <ul className="space-y-2 mb-6">
                    {points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white self-start group-hover:opacity-90 transition" style={{ backgroundColor: color }}>
                    {cta} <FiArrowRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA BANNER */}
        <div
          className="rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: "linear-gradient(135deg, #000042 0%, #1a3a7a 100%)" }}
        >
          <div className="text-white text-center md:text-left">
            <h3 className="text-xl font-bold mb-1.5">Are you a logistics company?</h3>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
              Register on Konect Kore and start receiving quote requests from customers across South Africa.
            </p>
          </div>
          <Link
            to="/company-register"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white flex-shrink-0 hover:opacity-90 transition"
            style={{ backgroundColor: "#2E7D32" }}
          >
            Register your company <FiArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Cargo;