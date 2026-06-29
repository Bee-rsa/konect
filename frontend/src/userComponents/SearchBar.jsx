import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchQuotes } from "../redux/slices/quoteSlice";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  FaSearch, FaChevronDown, FaShippingFast,
  FaWarehouse, FaHome, FaBuilding,
} from "react-icons/fa";
import { FiTruck, FiPackage } from "react-icons/fi";

const COUNTRIES = [
  { name: "South Africa", flag: "https://flagcdn.com/za.svg" },
  { name: "Mozambique",   flag: "https://flagcdn.com/mz.svg" },
  { name: "Namibia",      flag: "https://flagcdn.com/na.svg" },
  { name: "Botswana",     flag: "https://flagcdn.com/bw.svg" },
  { name: "Zimbabwe",     flag: "https://flagcdn.com/zw.svg" },
  { name: "Lesotho",      flag: "https://flagcdn.com/ls.svg" },
];

const SA_CITIES = [
  "Durban", "Johannesburg", "Cape Town", "Pretoria", "Richards Bay",
  "Port Elizabeth", "East London", "Bloemfontein", "Nelspruit",
  "Polokwane", "Kimberley", "George", "Rustenburg", "Pietermaritzburg",
];

const ORIGIN_TYPES = [
  { label: "Port or Airport",      icon: <FaShippingFast /> },
  { label: "Factory or Warehouse", icon: <FaWarehouse /> },
  { label: "Business Address",     icon: <FaBuilding /> },
  { label: "Residential Address",  icon: <FaHome /> },
];

const SERVICE_OPTIONS = [
  { key: "truck",   label: "Truck / Freight", icon: <FiTruck size={14} /> },
  { key: "courier", label: "Courier / Parcel", icon: <FiPackage size={14} /> },
];

const customBlue = "#000042";

const selCls = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-custom-blue transition appearance-none";
const inpCls = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-custom-blue transition";
const optBtnCls = (selected) =>
  `flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border text-sm text-left transition ${
    selected ? "border-custom-blue bg-blue-50 text-custom-blue" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
  }`;

/* ── Location Panel ── */
const LocationPanel = ({ title, tab, setTab, type, setType, country, setCountry, city, setCity, search, setSearch, filtered, onConfirm }) => (
  <div className="absolute top-full left-0 mt-3 z-[999] bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-[440px]">
    <h3 className="text-base font-bold text-slate-800 mb-5">{title}</h3>

    {/* Sub-tabs */}
    <div className="flex gap-1 mb-5 bg-slate-100 rounded-xl p-1">
      {["type", "country", "city"].map((t) => (
        <button
          key={t} type="button"
          onClick={() => setTab(t)}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
            tab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {t === "type" ? "Type" : t === "country" ? "Country" : "City"}
        </button>
      ))}
    </div>

    {tab === "type" && (
      <div className="space-y-2">
        {ORIGIN_TYPES.map(({ label, icon }) => (
          <button key={label} type="button"
            onClick={() => { setType(label); setTab("country"); }}
            className={optBtnCls(type === label)}>
            <span className={type === label ? "text-custom-blue" : "text-slate-400"}>{icon}</span>
            {label}
          </button>
        ))}
      </div>
    )}

    {tab === "country" && (
      <div>
        <input type="text" placeholder="Search country..." value={search}
          onChange={(e) => setSearch(e.target.value)} className={inpCls + " mb-3"} />
        <div className="space-y-1 max-h-56 overflow-y-auto">
          {filtered.map(({ name, flag }) => (
            <button key={name} type="button"
              onClick={() => { setCountry(name); setTab("city"); setSearch(""); }}
              className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm transition
                ${country === name ? "bg-blue-50 text-custom-blue font-semibold" : "hover:bg-slate-50 text-slate-700"}`}>
              <img src={flag} alt={name} className="w-7 h-5 rounded-sm object-cover" />
              {name}
            </button>
          ))}
        </div>
      </div>
    )}

    {tab === "city" && (
      <div className="space-y-3">
        <select className={selCls} value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">Select city</option>
          {SA_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {city && (
          <button type="button" onClick={onConfirm}
            className="w-full h-11 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: customBlue }}>
            Confirm
          </button>
        )}
      </div>
    )}
  </div>
);

LocationPanel.propTypes = {
  title:      PropTypes.string.isRequired,
  tab:        PropTypes.string.isRequired,
  setTab:     PropTypes.func.isRequired,
  type:       PropTypes.string.isRequired,
  setType:    PropTypes.func.isRequired,
  country:    PropTypes.string.isRequired,
  setCountry: PropTypes.func.isRequired,
  city:       PropTypes.string.isRequired,
  setCity:    PropTypes.func.isRequired,
  search:     PropTypes.string.isRequired,
  setSearch:  PropTypes.func.isRequired,
  filtered:   PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, flag: PropTypes.string })).isRequired,
  onConfirm:  PropTypes.func.isRequired,
};

/* ── Main SearchBar ── */
const SearchBar = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading } = useSelector((state) => state.quotes || {});

  const originRef  = useRef(null);
  const destRef    = useRef(null);
  const serviceRef = useRef(null);

  const [originOpen,  setOriginOpen]  = useState(false);
  const [destOpen,    setDestOpen]    = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);

  const [originTab,     setOriginTab]     = useState("type");
  const [originType,    setOriginType]    = useState("");
  const [originCountry, setOriginCountry] = useState("");
  const [originCity,    setOriginCity]    = useState("");
  const [originSearch,  setOriginSearch]  = useState("");

  const [destTab,     setDestTab]     = useState("type");
  const [destType,    setDestType]    = useState("");
  const [destCountry, setDestCountry] = useState("");
  const [destCity,    setDestCity]    = useState("");
  const [destSearch,  setDestSearch]  = useState("");

  const [weightUnit, setWeightUnit] = useState("kg");

  const [formData, setFormData] = useState({
    serviceType:    "truck",
    weight:         "",
    serviceLevel:   "economy",
    loadType:       "FTL",
    vehicleType:    "",
    fragile:        false,
    dangerousGoods: false,
    refrigerated:   false,
  });

  useEffect(() => {
    const handler = (e) => {
      if (originRef.current  && !originRef.current.contains(e.target))  setOriginOpen(false);
      if (destRef.current    && !destRef.current.contains(e.target))    setDestOpen(false);
      if (serviceRef.current && !serviceRef.current.contains(e.target)) setServiceOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  // Convert weight to kg before dispatching
  const weightInKg = () => {
    const w = Number(formData.weight);
    return weightUnit === "lbs" ? +(w * 0.453592).toFixed(2) : w;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      serviceMode: formData.serviceType,
      pickupCity:  originCity,
      dropoffCity: destCity,
      weight:      weightInKg(),
    };
    const result = await dispatch(searchQuotes(payload));
    if (!result.error) navigate("/konect-cargo");
  };

  const filteredOriginCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(originSearch.toLowerCase())
  );
  const filteredDestCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(destSearch.toLowerCase())
  );

  const originLabel = originCity
    ? `${originType ? `${originType} · ` : ""}${originCity}`
    : "Origin";
  const destLabel = destCity
    ? `${destType ? `${destType} · ` : ""}${destCity}`
    : "Destination";

  const selectedService = SERVICE_OPTIONS.find((s) => s.key === formData.serviceType);

  const fieldLabel = "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="w-full font-poppins">

      {/* ══════════════ DESKTOP ══════════════ */}
      <div className="hidden md:block">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100">
          <div className="flex items-stretch divide-x divide-slate-100">

            {/* ORIGIN */}
            <div className="relative flex-1" ref={originRef}>
              <button type="button"
                onClick={() => { setOriginOpen((p) => !p); setDestOpen(false); setServiceOpen(false); }}
                className="w-full px-6 py-5 text-left hover:bg-slate-50/70 transition rounded-tl-2xl"
              >
                <p className={fieldLabel}>From</p>
                <div className="flex items-center gap-2 min-h-[22px]">
                  {originCountry && (
                    <img src={COUNTRIES.find((c) => c.name === originCountry)?.flag}
                      alt={originCountry} className="w-6 h-4 rounded-sm object-cover flex-shrink-0" />
                  )}
                  <span className={`text-sm font-semibold truncate ${originCity ? "text-slate-800" : "text-slate-400"}`}>
                    {originLabel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Where are you shipping from?</p>
              </button>
              {originOpen && (
                <LocationPanel
                  title="Where are you shipping from?"
                  tab={originTab}        setTab={setOriginTab}
                  type={originType}      setType={setOriginType}
                  country={originCountry} setCountry={setOriginCountry}
                  city={originCity}      setCity={setOriginCity}
                  search={originSearch}  setSearch={setOriginSearch}
                  filtered={filteredOriginCountries}
                  onConfirm={() => setOriginOpen(false)}
                />
              )}
            </div>

            {/* DESTINATION */}
            <div className="relative flex-1" ref={destRef}>
              <button type="button"
                onClick={() => { setDestOpen((p) => !p); setOriginOpen(false); setServiceOpen(false); }}
                className="w-full px-6 py-5 text-left hover:bg-slate-50/70 transition"
              >
                <p className={fieldLabel}>To</p>
                <div className="flex items-center gap-2 min-h-[22px]">
                  {destCountry && (
                    <img src={COUNTRIES.find((c) => c.name === destCountry)?.flag}
                      alt={destCountry} className="w-6 h-4 rounded-sm object-cover flex-shrink-0" />
                  )}
                  <span className={`text-sm font-semibold truncate ${destCity ? "text-slate-800" : "text-slate-400"}`}>
                    {destLabel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Where are you shipping to?</p>
              </button>
              {destOpen && (
                <LocationPanel
                  title="Where are you shipping to?"
                  tab={destTab}        setTab={setDestTab}
                  type={destType}      setType={setDestType}
                  country={destCountry} setCountry={setDestCountry}
                  city={destCity}      setCity={setDestCity}
                  search={destSearch}  setSearch={setDestSearch}
                  filtered={filteredDestCountries}
                  onConfirm={() => setDestOpen(false)}
                />
              )}
            </div>

            {/* SERVICE */}
            <div className="relative w-52 flex-shrink-0" ref={serviceRef}>
              <button type="button"
                onClick={() => { setServiceOpen((p) => !p); setOriginOpen(false); setDestOpen(false); }}
                className="w-full px-6 py-5 text-left hover:bg-slate-50/70 transition"
              >
                <p className={fieldLabel}>Service</p>
                <div className="flex items-center justify-between min-h-[22px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{selectedService?.icon}</span>
                    <span className="text-sm font-semibold text-slate-800">{selectedService?.label}</span>
                  </div>
                  <FaChevronDown size={10} className={`text-slate-400 transition-transform ${serviceOpen ? "rotate-180" : ""}`} />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">How are you shipping?</p>
              </button>

              {serviceOpen && (
                <div className="absolute top-full left-0 mt-3 z-[999] bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 w-56">
                  {SERVICE_OPTIONS.map(({ key, label, icon }) => (
                    <button
                      key={key}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault(); // prevents blur before click registers
                        setFormData((p) => ({ ...p, serviceType: key }));
                        setServiceOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition
                        ${formData.serviceType === key ? "text-white" : "text-slate-600 hover:bg-slate-50"}`}
                      style={formData.serviceType === key ? { backgroundColor: customBlue } : {}}
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* WEIGHT */}
            <div className="w-48 flex-shrink-0 px-6 py-5">
              <p className={fieldLabel}>Weight</p>
              <div className="flex items-center gap-1.5 min-h-[22px]">
                <input
                  type="number" name="weight" value={formData.weight}
                  onChange={handleChange} min="1" required placeholder="Enter weight"
                  className="h-8 flex-1 min-w-0 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-custom-blue transition placeholder-slate-300"
                />
                {/* kg / lbs toggle */}
                <div className="flex rounded-lg border border-slate-200 overflow-hidden flex-shrink-0 text-xs font-semibold">
                  {["kg", "lbs"].map((u) => (
                    <button
                      key={u} type="button"
                      onClick={() => setWeightUnit(u)}
                      className={`px-2 py-1 transition ${weightUnit === u ? "text-white" : "text-slate-500 hover:bg-slate-50"}`}
                      style={weightUnit === u ? { backgroundColor: customBlue } : {}}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {weightUnit === "lbs" && formData.weight
                  ? `≈ ${(Number(formData.weight) * 0.453592).toFixed(1)} kg`
                  : "Cargo weight"}
              </p>
            </div>

            {/* VEHICLE / LEVEL */}
            <div className="w-44 flex-shrink-0 px-6 py-5">
              {formData.serviceType === "truck" ? (
                <>
                  <p className={fieldLabel}>Vehicle</p>
                  <select name="vehicleType" value={formData.vehicleType} onChange={handleChange}
                    className="h-8 w-full rounded-lg border border-slate-200 px-2 text-sm outline-none focus:border-custom-blue transition appearance-none">
                    <option value="">Any vehicle</option>
                    {["bakkie","half-ton","1-ton","4-ton","8-ton","superlink","flatbed","refrigerated","container"]
                      .map((v) => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">Optional</p>
                </>
              ) : (
                <>
                  <p className={fieldLabel}>Level</p>
                  <select name="serviceLevel" value={formData.serviceLevel} onChange={handleChange}
                    className="h-8 w-full rounded-lg border border-slate-200 px-2 text-sm outline-none focus:border-custom-blue transition appearance-none">
                    <option value="economy">Economy</option>
                    <option value="express">Express</option>
                    <option value="same-day">Same Day</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">Delivery speed</p>
                </>
              )}
            </div>

            {/* SEARCH */}
            <div className="flex-shrink-0 px-6 py-5 flex items-center rounded-tr-2xl">
              <button type="submit"
                disabled={loading || !originCity || !destCity}
                className="flex items-center gap-2 h-12 px-6 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                style={{ backgroundColor: "#2E7D32" }}
              >
                <FaSearch size={13} />
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ MOBILE ══════════════ */}
      <div className="flex flex-col gap-3 md:hidden">

        {/* Origin */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-4 py-4 cursor-pointer" onClick={() => setOriginOpen((p) => !p)}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={fieldLabel}>From</p>
                <div className="flex items-center gap-2">
                  {originCountry && (
                    <img src={COUNTRIES.find((c) => c.name === originCountry)?.flag}
                      alt={originCountry} className="w-5 h-3.5 rounded-sm object-cover flex-shrink-0" />
                  )}
                  <span className={`text-sm font-semibold truncate ${originCity ? "text-slate-800" : "text-slate-400"}`}>
                    {originLabel}
                  </span>
                </div>
              </div>
              <FaChevronDown className={`text-slate-400 transition-transform flex-shrink-0 ml-2 ${originOpen ? "rotate-180" : ""}`} size={12} />
            </div>
          </div>

          {originOpen && (
            <div className="border-t border-slate-100 px-4 pb-4 pt-4">
              <div className="flex gap-1 mb-4 bg-slate-100 rounded-xl p-1">
                {["type", "country", "city"].map((t) => (
                  <button key={t} type="button"
                    onClick={(e) => { e.stopPropagation(); setOriginTab(t); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition
                      ${originTab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>
                    {t === "type" ? "Type" : t === "country" ? "Country" : "City"}
                  </button>
                ))}
              </div>
              {originTab === "type" && (
                <div className="space-y-2">
                  {ORIGIN_TYPES.map(({ label, icon }) => (
                    <button key={label} type="button"
                      onClick={(e) => { e.stopPropagation(); setOriginType(label); setOriginTab("country"); }}
                      className={optBtnCls(originType === label)}>
                      <span>{icon}</span> {label}
                    </button>
                  ))}
                </div>
              )}
              {originTab === "country" && (
                <div onClick={(e) => e.stopPropagation()}>
                  <input type="text" placeholder="Search country..." value={originSearch}
                    onChange={(e) => setOriginSearch(e.target.value)} className={inpCls + " mb-3"} />
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {filteredOriginCountries.map(({ name, flag }) => (
                      <button key={name} type="button"
                        onClick={() => { setOriginCountry(name); setOriginTab("city"); }}
                        className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm transition
                          ${originCountry === name ? "bg-blue-50 text-custom-blue font-semibold" : "hover:bg-slate-50 text-slate-700"}`}>
                        <img src={flag} alt={name} className="w-6 h-4 rounded-sm object-cover" />
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {originTab === "city" && (
                <div onClick={(e) => e.stopPropagation()}>
                  <select className={selCls} value={originCity}
                    onChange={(e) => { setOriginCity(e.target.value); setOriginOpen(false); }}>
                    <option value="">Select city</option>
                    {SA_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Destination */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-4 py-4 cursor-pointer" onClick={() => setDestOpen((p) => !p)}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={fieldLabel}>To</p>
                <div className="flex items-center gap-2">
                  {destCountry && (
                    <img src={COUNTRIES.find((c) => c.name === destCountry)?.flag}
                      alt={destCountry} className="w-5 h-3.5 rounded-sm object-cover flex-shrink-0" />
                  )}
                  <span className={`text-sm font-semibold truncate ${destCity ? "text-slate-800" : "text-slate-400"}`}>
                    {destLabel}
                  </span>
                </div>
              </div>
              <FaChevronDown className={`text-slate-400 transition-transform flex-shrink-0 ml-2 ${destOpen ? "rotate-180" : ""}`} size={12} />
            </div>
          </div>

          {destOpen && (
            <div className="border-t border-slate-100 px-4 pb-4 pt-4">
              <div className="flex gap-1 mb-4 bg-slate-100 rounded-xl p-1">
                {["type", "country", "city"].map((t) => (
                  <button key={t} type="button"
                    onClick={(e) => { e.stopPropagation(); setDestTab(t); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition
                      ${destTab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>
                    {t === "type" ? "Type" : t === "country" ? "Country" : "City"}
                  </button>
                ))}
              </div>
              {destTab === "type" && (
                <div className="space-y-2">
                  {ORIGIN_TYPES.map(({ label, icon }) => (
                    <button key={label} type="button"
                      onClick={(e) => { e.stopPropagation(); setDestType(label); setDestTab("country"); }}
                      className={optBtnCls(destType === label)}>
                      <span>{icon}</span> {label}
                    </button>
                  ))}
                </div>
              )}
              {destTab === "country" && (
                <div onClick={(e) => e.stopPropagation()}>
                  <input type="text" placeholder="Search country..." value={destSearch}
                    onChange={(e) => setDestSearch(e.target.value)} className={inpCls + " mb-3"} />
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {filteredDestCountries.map(({ name, flag }) => (
                      <button key={name} type="button"
                        onClick={() => { setDestCountry(name); setDestTab("city"); }}
                        className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm transition
                          ${destCountry === name ? "bg-blue-50 text-custom-blue font-semibold" : "hover:bg-slate-50 text-slate-700"}`}>
                        <img src={flag} alt={name} className="w-6 h-4 rounded-sm object-cover" />
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {destTab === "city" && (
                <div onClick={(e) => e.stopPropagation()}>
                  <select className={selCls} value={destCity}
                    onChange={(e) => { setDestCity(e.target.value); setDestOpen(false); }}>
                    <option value="">Select city</option>
                    {SA_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Service */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" ref={serviceRef}>
          <div className="px-4 py-4 cursor-pointer" onClick={() => setServiceOpen((p) => !p)}>
            <div className="flex items-center justify-between">
              <div>
                <p className={fieldLabel}>Service</p>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{selectedService?.icon}</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedService?.label}</span>
                </div>
              </div>
              <FaChevronDown className={`text-slate-400 transition-transform ${serviceOpen ? "rotate-180" : ""}`} size={12} />
            </div>
          </div>
          {serviceOpen && (
            <div className="border-t border-slate-100 px-4 pb-4 pt-2 space-y-2">
              {SERVICE_OPTIONS.map(({ key, label, icon }) => (
                <button key={key} type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setFormData((p) => ({ ...p, serviceType: key }));
                    setServiceOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition
                    ${formData.serviceType === key ? "text-white" : "text-slate-600 hover:bg-slate-50"}`}
                  style={formData.serviceType === key ? { backgroundColor: customBlue } : {}}>
                  {icon} {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Weight */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4">
          <p className={fieldLabel}>Weight</p>
          <div className="flex items-center gap-2">
            <input type="number" name="weight" value={formData.weight} onChange={handleChange}
              min="1" required placeholder="Enter weight"
              className={inpCls + " placeholder-slate-300 flex-1"} />
            <div className="flex rounded-xl border border-slate-200 overflow-hidden flex-shrink-0 text-xs font-semibold">
              {["kg", "lbs"].map((u) => (
                <button key={u} type="button"
                  onClick={() => setWeightUnit(u)}
                  className={`px-3 py-2 transition ${weightUnit === u ? "text-white" : "text-slate-500 hover:bg-slate-50"}`}
                  style={weightUnit === u ? { backgroundColor: customBlue } : {}}>
                  {u}
                </button>
              ))}
            </div>
          </div>
          {weightUnit === "lbs" && formData.weight && (
            <p className="text-[11px] text-slate-400 mt-1.5">
              ≈ {(Number(formData.weight) * 0.453592).toFixed(1)} kg
            </p>
          )}
        </div>

        {/* Vehicle / Level */}
        {formData.serviceType === "truck" ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4">
            <p className={fieldLabel}>Vehicle type</p>
            <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className={selCls}>
              <option value="">Any vehicle</option>
              {["bakkie","half-ton","1-ton","4-ton","8-ton","superlink","flatbed","refrigerated","container"]
                .map((v) => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
            </select>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4">
            <p className={fieldLabel}>Service level</p>
            <div className="grid grid-cols-3 gap-2">
              {["economy", "express", "same-day"].map((sl) => (
                <button key={sl} type="button"
                  onClick={() => setFormData((p) => ({ ...p, serviceLevel: sl }))}
                  className={`h-10 rounded-xl text-xs font-semibold border transition
                    ${formData.serviceLevel === sl ? "text-white border-transparent" : "bg-slate-50 text-slate-500 border-slate-200"}`}
                  style={formData.serviceLevel === sl ? { backgroundColor: "#2E7D32" } : {}}>
                  {sl === "same-day" ? "Same day" : sl.charAt(0).toUpperCase() + sl.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <button type="submit" disabled={loading || !originCity || !destCity}
          className="w-full py-4 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "#2E7D32" }}>
          <FaSearch size={14} />
          {loading ? "Searching..." : "Search Quotes"}
        </button>
      </div>
    </form>
  );
};

export default SearchBar;