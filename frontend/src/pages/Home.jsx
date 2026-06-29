import { useState } from "react";
import { Link } from "react-router-dom";
import Ride from "../userComponents/RideSearchBar";
import { FiTruck, FiPackage, FiNavigation, FiArrowRight, FiChevronDown, FiChevronUp, FiCheck } from "react-icons/fi";

const Home = () => {
  const [activeFAQ, setActiveFAQ] = useState(null);

  const toggleFAQ = (i) => setActiveFAQ(activeFAQ === i ? null : i);

  const services = [
    {
      to: "/user-home",
      icon: <FiNavigation size={22} />,
      label: "Konect Ride",
      tagline: "Move people, instantly",
      desc: "On-demand rides across South Africa. From airport transfers to everyday commutes — reliable, safe, and trackable.",
      color: "#000042",
      bg: "#F0F0F8",
      features: ["Real-time driver tracking", "Multiple vehicle classes", "Scheduled bookings"],
    },
    {
      to: "/cargo",
      icon: <FiTruck size={22} />,
      label: "Konect Cargo",
      tagline: "Move freight, competitively",
      desc: "Compare rates from verified trucking and courier companies. Get instant quotes and book your freight in minutes.",
      color: "#2E7D32",
      bg: "#F0FDF4",
      features: ["Live rate comparison", "Courier & truck options", "SADC coverage"],
    },
    {
      to: "/eats",
      icon: <FiPackage size={22} />,
      label: "Konect Eats",
      tagline: "Move meals, fast",
      desc: "Fast, reliable food delivery connecting restaurants and customers. Hot food, tracked in real time, every time.",
      color: "#C2410C",
      bg: "#FFF7ED",
      features: ["Live order tracking", "Wide restaurant network", "Express delivery"],
    },
  ];

  const stats = [
    { value: "50+",  label: "Verified providers" },
    { value: "14",   label: "Cities covered" },
    { value: "SADC", label: "Regional reach" },
    { value: "3",    label: "Service verticals" },
  ];

  const faqs = [
    {
      question: "What is Konect Kore?",
      answer: "Konect Kore is a logistics super-platform built for Southern Africa. It brings together ride-hailing, freight, and food delivery under one unified system — giving individuals and businesses a single point of access for all movement needs.",
    },
    {
      question: "How does Konect Cargo work?",
      answer: "Enter your origin, destination, cargo weight and type. Konect instantly returns live rates from registered trucking and courier companies. Select your preferred provider and request a formal quote directly — no middlemen.",
    },
    {
      question: "Which countries does Konect operate in?",
      answer: "Konect is built for the SADC region, with South Africa as the primary market. We support shipments to and from Mozambique, Namibia, Zimbabwe, Botswana, Zambia, and more.",
    },
    {
      question: "How do I register my logistics company on Konect?",
      answer: "Click 'Register your company' from the Cargo page. The onboarding process is country-aware, validates your business registration number, and gets you live on the marketplace within minutes.",
    },
  ];

  return (
    <div className="font-poppins" style={{ backgroundColor: "#f5f5f4" }}>

      {/* ── HERO ── */}
      <div className="w-full mt-8">
        <Ride />
      </div>

      {/* ── SERVICES ── */}
      <section className="w-full px-6 md:px-12 lg:px-20 py-24 max-w-screen-2xl mx-auto -mt-4">
        <div className="mb-14">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
            What we offer
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: "#000042" }}>
              One platform.<br className="hidden md:block" /> Every movement.
            </h2>
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
              Konect unifies ride-hailing, freight, and food delivery — built for the pace and scale of Southern Africa.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {services.map(({ to, icon, label, tagline, desc, color, bg, features }) => (
            <Link
              key={label}
              to={to}
              className="group relative bg-white rounded-2xl border border-slate-100 p-7 flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
            >
              {/* Accent bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: color }} />

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 flex-shrink-0"
                style={{ backgroundColor: bg, color }}
              >
                {icon}
              </div>

              {/* Label + tagline */}
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color }}>
                {label}
              </p>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{tagline}</h3>
              <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-5">{desc}</p>

              {/* Feature list */}
              <ul className="space-y-2 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-500">
                    <FiCheck size={12} style={{ color }} className="flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="flex items-center gap-1.5 text-xs font-bold transition group-hover:gap-2.5" style={{ color }}>
                Explore {label} <FiArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <div
        className="w-full py-14"
        style={{ background: "linear-gradient(135deg, #000042 0%, #0a1a5c 60%, #1a3a7a 100%)" }}
      >
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center md:text-left">
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">{value}</p>
                <p className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHY KONECT ── */}
      <section className="w-full px-6 md:px-12 lg:px-20 py-24 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              Built for Southern Africa
            </p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6" style={{ color: "#000042" }}>
              Logistics infrastructure<br /> for a moving continent
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-md">
              Africa&apos;s logistics market is one of the fastest growing in the world. Konect is purpose-built for its roads, borders, and businesses — connecting carriers, customers, and communities.
            </p>

            <div className="space-y-4">
              {[
                { title: "SADC-aware routing",    desc: "Routes and rates built for cross-border movement across 16 countries." },
                { title: "Verified providers",    desc: "Every carrier on Konect is registered, validated, and rate-approved." },
                { title: "Real-time visibility",  desc: "Track every shipment, ride, and delivery from dispatch to door." },
                { title: "One platform, all modes", desc: "Road freight, courier, ride-hailing — managed in a single account." },
              ].map(({ title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "#2E7D32" }}>
                    <FiCheck size={11} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — visual grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Ride", value: "2–4 min", sub: "Average pickup time", color: "#000042", bg: "#F0F0F8" },
              { label: "Cargo", value: "50+", sub: "Verified freight providers", color: "#2E7D32", bg: "#F0FDF4" },
              { label: "Eats", value: "30 min", sub: "Average delivery time", color: "#C2410C", bg: "#FFF7ED" },
              { label: "SADC", value: "16", sub: "Countries supported", color: "#1565C0", bg: "#EFF6FF" },
            ].map(({ label, value, sub, color, bg }) => (
              <div
                key={label}
                className="rounded-2xl p-6 flex flex-col"
                style={{ backgroundColor: bg }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color }}>
                  {label}
                </p>
                <p className="text-3xl font-bold mb-1" style={{ color }}>{value}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="w-full px-6 md:px-12 lg:px-20 pb-24 max-w-screen-2xl mx-auto">
        <div
          className="rounded-2xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8"
          style={{ background: "linear-gradient(135deg, #000042 0%, #1a3a7a 100%)" }}
        >
          <div className="text-white text-center md:text-left">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
              For logistics companies
            </p>
            <h3 className="text-2xl md:text-3xl font-bold mb-2">
              Start receiving quote requests today
            </h3>
            <p className="text-sm max-w-md" style={{ color: "rgba(255,255,255,0.55)" }}>
              Register your trucking or courier company on Konect Kore and get discovered by customers across South Africa and the SADC region.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              to="/company-register"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
              style={{ backgroundColor: "#2E7D32" }}
            >
              Register your company <FiArrowRight size={14} />
            </Link>
            <Link
              to="/cargo"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold border transition hover:bg-white/10"
              style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)" }}
            >
              Search freight rates
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="w-full px-6 md:px-12 lg:px-20 pb-28 max-w-screen-2xl mx-auto">
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">FAQ</p>
          <h2 className="text-3xl font-bold mb-10" style={{ color: "#000042" }}>
            Common questions
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = activeFAQ === i;
              return (
                <div
                  key={i}
                  className={`rounded-2xl border bg-white transition-all duration-200 ${
                    isOpen ? "border-slate-200 shadow-sm" : "border-slate-100"
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-sm font-semibold text-slate-800">{faq.question}</span>
                    <span
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition"
                      style={{ backgroundColor: isOpen ? "#F0F0F8" : "#f8fafc", color: isOpen ? "#000042" : "#94a3b8" }}
                    >
                      {isOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                    </span>
                  </button>

                  <div className={`grid transition-all duration-200 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 text-sm text-slate-500 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;