import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearQuotes, searchQuotes } from "../redux/slices/quoteSlice";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  FiArrowLeft, FiTruck, FiPackage, FiShield, FiClock,
  FiPhone, FiMail, FiGlobe, FiCheckCircle, FiAlertTriangle,
  FiThermometer, FiChevronDown, FiChevronUp,
  FiSearch, FiX, FiMapPin,
} from "react-icons/fi";
import Navbar from "../components/Common/Navbar";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const BADGES = {
  insuranceIncluded:       { label: "Insurance",        icon: <FiShield size={9} />,        bg: "#1565C0" },
  trackingAvailable:       { label: "Live tracking",    icon: <FiCheckCircle size={9} />,   bg: "#2E7D32" },
  weekendDelivery:         { label: "Weekend delivery", icon: <FiClock size={9} />,         bg: "#6A1B9A" },
  dangerousGoodsSupported: { label: "DG certified",     icon: <FiAlertTriangle size={9} />, bg: "#E65100" },
  temperatureControlled:   { label: "Temp controlled",  icon: <FiThermometer size={9} />,   bg: "#00838F" },
};

const VEHICLE_LABELS = {
  bakkie: "Bakkie", "half-ton": "Half-ton", "1-ton": "1-ton",
  "4-ton": "4-ton", "8-ton": "8-ton", superlink: "Superlink",
  flatbed: "Flatbed", refrigerated: "Refrigerated", container: "Container",
};

const SA_CITIES = [
  "Durban", "Johannesburg", "Cape Town", "Pretoria", "Richards Bay",
  "Port Elizabeth", "East London", "Bloemfontein", "Nelspruit",
  "Polokwane", "Kimberley", "George", "Rustenburg", "Pietermaritzburg",
];

// Approximate coords for SA cities for the map
const CITY_COORDS = {
  "Durban":          [31.0218, -29.8587],
  "Johannesburg":    [28.0473, -26.2041],
  "Cape Town":       [18.4241, -33.9249],
  "Pretoria":        [28.1881, -25.7461],
  "Richards Bay":    [32.0679, -28.7832],
  "Port Elizabeth":  [25.5707, -33.9608],
  "East London":     [27.9116, -32.9822],
  "Bloemfontein":    [26.2041, -29.0852],
  "Nelspruit":       [30.9694, -25.4745],
  "Polokwane":       [29.4486, -23.8962],
  "Kimberley":       [24.7499, -28.7282],
  "George":          [22.4617, -33.9630],
  "Rustenburg":      [27.2419, -25.6673],
  "Pietermaritzburg":[30.3968, -29.6006],
};


const KonectCargo = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const mapContainer = useRef(null);
  const map          = useRef(null);
  const { results, searchParams, loading, error } = useSelector((s) => s.quotes || {});

  const [sortBy, setSortBy]        = useState("price");
  const [expandedIdx, setExpanded] = useState(null);
  const [filters, setFilters]      = useState({
    insuranceOnly: false, trackingOnly: false,
    weekendOnly: false, dgOnly: false, tempOnly: false,
  });
  const [form, setForm] = useState({
    serviceMode:  searchParams?.serviceMode  || searchParams?.serviceType || "truck",
    pickupCity:   searchParams?.pickupCity   || "",
    dropoffCity:  searchParams?.dropoffCity  || "",
    weight:       searchParams?.weight       || "",
    vehicleType:  searchParams?.vehicleType  || "",
    loadType:     searchParams?.loadType     || "FTL",
    serviceLevel: searchParams?.serviceLevel || "economy",
  });

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleFilter = (k) => setFilters((p) => ({ ...p, [k]: !p[k] }));
  const activeCount = Object.values(filters).filter(Boolean).length;

  // ── MAP ──
  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    const pickup  = CITY_COORDS[searchParams?.pickupCity];
    const dropoff = CITY_COORDS[searchParams?.dropoffCity];
    const center  = pickup || [28.0473, -26.2041];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom: 6,
      attributionControl: false,
      interactive: false,
    });

    map.current.on("load", () => {
      if (pickup) {
        new mapboxgl.Marker({ color: "#2E7D32" }).setLngLat(pickup).addTo(map.current);
      }
      if (dropoff) {
        new mapboxgl.Marker({ color: "#000042" }).setLngLat(dropoff).addTo(map.current);
      }
      if (pickup && dropoff) {
        // Draw straight line between cities
        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: { type: "LineString", coordinates: [pickup, dropoff] },
          },
        });
        map.current.addLayer({
          id: "route-glow",
          type: "line",
          source: "route",
          paint: { "line-color": "#000042", "line-width": 6, "line-opacity": 0.15 },
        });
        map.current.addLayer({
          id: "routeLine",
          type: "line",
          source: "route",
          paint: { "line-color": "#2E7D32", "line-width": 2.5, "line-dasharray": [2, 2] },
        });

        const bounds = [pickup, dropoff].reduce(
          (b, c) => b.extend(c),
          new mapboxgl.LngLatBounds(pickup, pickup)
        );
        map.current.fitBounds(bounds, { padding: 40 });
      }
    });
  }, [searchParams]);

  const getLowest = (c) => {
    if (!c.matchedRates?.length) return Infinity;
    return Math.min(...c.matchedRates.map((r) => r.minimumCharge || r.basePrice || 0));
  };

  const formatRate = (rate, svcType) => {
    if (svcType === "courier") {
      return {
        title:    `${rate.zone?.charAt(0).toUpperCase() + rate.zone?.slice(1)} · ${rate.serviceLevel}`,
        primary:  `R${rate.basePrice?.toFixed(2)} base`,
        secondary:`R${rate.extraKgRate}/kg after ${rate.includedWeightKg}kg`,
        minimum:  rate.minimumCharge, days: null, fuel: null, handling: null,
      };
    }
    return {
      title:    `${VEHICLE_LABELS[rate.vehicleType] || rate.vehicleType} · ${rate.loadType}`,
      primary:  `R${rate.minimumCharge?.toFixed(2)} min`,
      secondary:[
        rate.ratePerKm  ? `R${rate.ratePerKm}/km`    : null,
        rate.ratePerKg  ? `R${rate.ratePerKg}/kg`    : null,
        rate.capacityKg ? `${rate.capacityKg}kg cap` : null,
      ].filter(Boolean).join(" · "),
      minimum: rate.minimumCharge, days: rate.estimatedDays,
      fuel:    rate.fuelSurchargePercent > 0 ? rate.fuelSurchargePercent : null,
      handling:rate.handlingFee > 0 ? rate.handlingFee : null,
    };
  };

  const processed = (results || [])
    .filter((r) => {
      if (filters.insuranceOnly && !r.insuranceIncluded)       return false;
      if (filters.trackingOnly  && !r.trackingAvailable)       return false;
      if (filters.weekendOnly   && !r.weekendDelivery)         return false;
      if (filters.dgOnly        && !r.dangerousGoodsSupported) return false;
      if (filters.tempOnly      && !r.temperatureControlled)   return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price") return getLowest(a) - getLowest(b);
      if (sortBy === "name")  return a.companyName.localeCompare(b.companyName);
      return 0;
    });

  const lowestOverall = processed.length > 0
    ? Math.min(...processed.map(getLowest)).toFixed(2)
    : null;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center font-poppins"
          style={{ backgroundColor: "#f5f5f4" }}>
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-custom-blue rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Searching registered companies...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen font-poppins flex flex-col" style={{ backgroundColor: "#f5f5f4" }}>
      <Navbar />

      <div className="flex flex-col lg:flex-row flex-1 lg:gap-5 lg:p-5 lg:pt-4">

        {/* ══════════════════════════════════
            LEFT PANEL
        ══════════════════════════════════ */}
        <div className="w-full lg:w-[30%] flex flex-col gap-4">

          {/* Back */}
          <button
            onClick={() => { dispatch(clearQuotes()); navigate(-1); }}
            className="hidden lg:flex items-center gap-2 text-slate-400 hover:text-slate-700 text-xs transition w-fit"
          >
            <FiArrowLeft size={13} /> Back to search
          </button>

          {/* MAP */}
          <div className="relative rounded-2xl overflow-hidden shadow-sm" style={{ height: "200px" }}>
            <div ref={mapContainer} className="w-full h-full" />

            {/* Route pill */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow text-[11px] flex items-center gap-1.5 max-w-[90%] overflow-hidden whitespace-nowrap">
              <FiMapPin size={10} style={{ color: "#2E7D32", flexShrink: 0 }} />
              <span className="font-semibold truncate" style={{ color: "#2E7D32" }}>
                {searchParams?.pickupCity || "Origin"}
              </span>
              <span className="text-gray-300 flex-shrink-0">→</span>
              <span className="font-semibold truncate" style={{ color: "#000042" }}>
                {searchParams?.dropoffCity || "Destination"}
              </span>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <div className="w-0.5 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: "#000042" }} />
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Order Summary</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {[
                { label: "Service",   value: form.serviceMode === "truck" ? "Truck / Freight" : "Courier / Parcel" },
                { label: "From",      value: searchParams?.pickupCity  || "—" },
                { label: "To",        value: searchParams?.dropoffCity || "—" },
                { label: "Weight",    value: searchParams?.weight ? `${searchParams.weight}kg` : "—" },
                { label: "Load type", value: searchParams?.loadType || "—", hide: form.serviceMode !== "truck" },
                { label: "Vehicle",   value: VEHICLE_LABELS[searchParams?.vehicleType] || "Any", hide: form.serviceMode !== "truck" },
                { label: "Level",     value: searchParams?.serviceLevel || "—", hide: form.serviceMode !== "courier" },
              ].filter((r) => !r.hide).map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{label}</span>
                  <span className="text-[11px] font-semibold text-slate-700 capitalize">{value}</span>
                </div>
              ))}

              {/* Divider */}
              <div className="border-t border-gray-100 pt-2 mt-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Results found</span>
                  <span className="text-[11px] font-bold" style={{ color: "#000042" }}>{processed.length}</span>
                </div>
                {lowestOverall && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Lowest rate</span>
                    <span className="text-[13px] font-bold" style={{ color: "#2E7D32" }}>
                      R{lowestOverall}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* REFINE SEARCH */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <div className="w-0.5 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: "#2E7D32" }} />
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex-1">Refine Search</span>
            </div>
            <div className="px-4 py-3 space-y-2.5">

              {/* Service toggle */}
              <div className="grid grid-cols-2 gap-1.5">
                {["truck", "courier"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setF("serviceMode", t)}
                    className={`h-8 rounded-lg text-[11px] font-semibold border transition flex items-center justify-center gap-1.5
                      ${form.serviceMode === t
                        ? "text-white border-transparent"
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
                    style={form.serviceMode === t ? { backgroundColor: "#000042" } : {}}
                  >
                    {t === "truck" ? <FiTruck size={11} /> : <FiPackage size={11} />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              {/* From / To */}
              {["pickupCity", "dropoffCity"].map((key) => (
                <div key={key}>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                    {key === "pickupCity" ? "From" : "To"}
                  </label>
                  <select
                    className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-[11px] text-slate-700 outline-none focus:border-custom-blue transition appearance-none"
                    value={form[key]}
                    onChange={(e) => setF(key, e.target.value)}
                  >
                    <option value="">Select city</option>
                    {SA_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              ))}

              {/* Weight */}
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Weight (kg)</label>
                <input
                  type="number"
                  className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-[11px] text-slate-700 outline-none focus:border-custom-blue transition"
                  value={form.weight}
                  onChange={(e) => setF("weight", e.target.value)}
                  placeholder="e.g. 500"
                />
              </div>

              {/* Truck fields */}
              {form.serviceMode === "truck" && (
                <>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Vehicle</label>
                    <select
                      className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-[11px] text-slate-700 outline-none focus:border-custom-blue transition appearance-none"
                      value={form.vehicleType}
                      onChange={(e) => setF("vehicleType", e.target.value)}
                    >
                      <option value="">Any vehicle</option>
                      {Object.entries(VEHICLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["FTL", "LTL"].map((lt) => (
                      <button
                        key={lt}
                        type="button"
                        onClick={() => setF("loadType", lt)}
                        className={`h-8 rounded-lg text-[11px] font-semibold border transition
                          ${form.loadType === lt
                            ? "text-white border-transparent"
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
                        style={form.loadType === lt ? { backgroundColor: "#2E7D32" } : {}}
                      >
                        {lt}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Courier fields */}
              {form.serviceMode === "courier" && (
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Service level</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["economy", "express", "same-day"].map((sl) => (
                      <button
                        key={sl}
                        type="button"
                        onClick={() => setF("serviceLevel", sl)}
                        className={`h-8 rounded-lg text-[10px] font-semibold border transition capitalize
                          ${form.serviceLevel === sl
                            ? "text-white border-transparent"
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
                        style={form.serviceLevel === sl ? { backgroundColor: "#2E7D32" } : {}}
                      >
                        {sl === "same-day" ? "Same day" : sl.charAt(0).toUpperCase() + sl.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => dispatch(searchQuotes({ ...form, weight: Number(form.weight) }))}
                className="w-full h-9 rounded-xl text-[12px] font-semibold text-white transition hover:opacity-90 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#000042" }}
              >
                <FiSearch size={13} /> Search
              </button>
            </div>
          </div>

          {/* FILTERS */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-4 rounded-full bg-amber-400 flex-shrink-0" />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Filters</span>
              </div>
              {activeCount > 0 && (
                <button
                  onClick={() => setFilters({ insuranceOnly: false, trackingOnly: false, weekendOnly: false, dgOnly: false, tempOnly: false })}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 transition"
                >
                  <FiX size={10} /> Clear all
                </button>
              )}
            </div>
            <div className="px-4 py-3 space-y-2.5">
              {[
                { key: "insuranceOnly", label: "Insurance included" },
                { key: "trackingOnly",  label: "Live tracking" },
                { key: "weekendOnly",   label: "Weekend delivery" },
                { key: "dgOnly",        label: "DG certified" },
                { key: "tempOnly",      label: "Temperature controlled" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => toggleFilter(key)}>
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition
                      ${filters[key] ? "border-transparent" : "border-slate-200 bg-slate-50"}`}
                    style={filters[key] ? { backgroundColor: "#2E7D32" } : {}}
                  >
                    {filters[key] && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[12px] text-slate-500">{label}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* ══════════════════════════════════
            RIGHT PANEL — RESULTS
        ══════════════════════════════════ */}
        <div className="flex-1 min-w-0 flex flex-col gap-3 mt-4 lg:mt-0">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold leading-tight" style={{ color: "#000042" }}>
                {searchParams?.pickupCity && searchParams?.dropoffCity
                  ? `${searchParams.pickupCity} → ${searchParams.dropoffCity}`
                  : "Search Results"}
              </h1>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {processed.length} {processed.length === 1 ? "provider" : "providers"} found
                {searchParams?.weight ? ` · ${searchParams.weight}kg` : ""}
              </p>
            </div>
            <div className="flex gap-1.5">
              {[{ key: "price", label: "Price" }, { key: "name", label: "A–Z" }].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition
                    ${sortBy === key
                      ? "text-white border-transparent"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                  style={sortBy === key ? { backgroundColor: "#000042" } : {}}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Empty / error */}
          {(error || processed.length === 0) && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 bg-white rounded-2xl shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <FiTruck size={28} className="text-slate-300" />
              </div>
              <p className="font-semibold text-slate-500 mb-1">
                {error ? "Something went wrong" : "No providers found"}
              </p>
              <p className="text-slate-400 text-sm max-w-xs">
                {error || "Try adjusting your search or removing filters."}
              </p>
            </div>
          )}

          {/* Results list */}
          <div className="flex flex-col gap-3">
            {processed.map((company, idx) => {
              const isExpanded = expandedIdx === idx;
              const lowest     = getLowest(company);
              const rateCount  = company.matchedRates?.length || 0;

              return (
                <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm">

                  {/* Gradient strip */}
                  <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #000042, #2E7D32)" }} />

                  <div className="p-4 flex gap-4">

                    {/* LEFT: Logo — larger */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xl overflow-hidden self-start"
                      style={{ backgroundColor: "#000042" }}
                    >
                      {company.logoUrl
                        ? <img src={company.logoUrl} alt={company.companyName} className="w-full h-full object-cover" />
                        : company.companyName?.slice(0, 2).toUpperCase()
                      }
                    </div>

                    {/* RIGHT: Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 truncate">{company.companyName}</h3>
                          {(company.city || company.province) && (
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {[company.city, company.province].filter(Boolean).join(", ")}
                            </p>
                          )}
                          {company.operatingRegions?.length > 0 && (
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Serves: {company.operatingRegions.slice(0, 3).join(" · ")}
                              {company.operatingRegions.length > 3 && ` +${company.operatingRegions.length - 3}`}
                            </p>
                          )}
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-xl font-bold" style={{ color: "#000042" }}>
                            {lowest === Infinity ? "—" : `R${lowest.toFixed(2)}`}
                          </p>
                          <p className="text-[10px] text-gray-400">from</p>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(BADGES).map(([key, cfg]) =>
                          company[key] ? (
                            <span
                              key={key}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold text-white"
                              style={{ backgroundColor: cfg.bg }}
                            >
                              {cfg.icon} {cfg.label}
                            </span>
                          ) : null
                        )}
                      </div>

                      {/* Description */}
                      {company.description && (
                        <p className="text-[11px] text-gray-400 mt-2 line-clamp-1">
                          {company.description}
                        </p>
                      )}

                      {/* Contact */}
                      <div className="flex flex-wrap gap-3 mt-2">
                        {company.phone && (
                          <a href={`tel:${company.phone}`} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-700 transition">
                            <FiPhone size={9} /> {company.phone}
                          </a>
                        )}
                        {company.email && (
                          <a href={`mailto:${company.email}`} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-700 transition">
                            <FiMail size={9} /> {company.email}
                          </a>
                        )}
                        {company.website && (
                          <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-700 transition">
                            <FiGlobe size={9} /> Website
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rate rows */}
                  <div className="border-t border-gray-100">
                    <button
                      onClick={() => setExpanded(isExpanded ? null : idx)}
                      className="flex items-center justify-between w-full px-4 py-2.5 text-[11px] font-semibold text-gray-400 hover:text-gray-700 transition"
                    >
                      <span>
                        {rateCount} rate{rateCount !== 1 ? "s" : ""}
                        {!isExpanded && rateCount > 0 && (
                          <span className="ml-1.5 text-gray-300 font-normal">· tap to expand</span>
                        )}
                      </span>
                      {isExpanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-3 flex flex-col gap-1.5">
                        {company.matchedRates?.map((rate, rIdx) => {
                          const fmt = formatRate(rate, searchParams?.serviceMode || searchParams?.serviceType);
                          return (
                            <div key={rIdx} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-gray-100 bg-stone-50">
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-semibold text-gray-700">{fmt.title}</p>
                                {fmt.secondary && <p className="text-[10px] text-gray-400 mt-0.5">{fmt.secondary}</p>}
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {fmt.days     && <span className="flex items-center gap-1 text-[10px] text-gray-400"><FiClock size={9} /> {fmt.days}</span>}
                                  {fmt.fuel     && <span className="text-[10px] text-orange-500">+{fmt.fuel}% fuel</span>}
                                  {fmt.handling && <span className="text-[10px] text-gray-400">+R{fmt.handling} handling</span>}
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs font-bold" style={{ color: "#000042" }}>{fmt.primary}</p>
                                {fmt.minimum > 0 && <p className="text-[10px] text-gray-400">min R{fmt.minimum?.toFixed(2)}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4 pt-1 flex gap-2 border-t border-gray-100">
                    <button
                      onClick={() => navigate("/request-quote", { state: { company, searchParams } })}
                      className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-white hover:opacity-90 transition"
                      style={{ backgroundColor: "#2E7D32" }}
                    >
                      Request Quote
                    </button>
                    {company.phone && (
                      <button
                        onClick={() => window.location.href = `tel:${company.phone}`}
                        className="px-4 py-2.5 rounded-xl text-[12px] font-semibold border border-gray-200 text-gray-500 hover:bg-stone-50 transition"
                      >
                        <FiPhone size={13} />
                      </button>
                    )}
                    {company.email && (
                      <button
                        onClick={() => window.location.href = `mailto:${company.email}?subject=Quote Request`}
                        className="px-4 py-2.5 rounded-xl text-[12px] font-semibold border border-gray-200 text-gray-500 hover:bg-stone-50 transition"
                      >
                        <FiMail size={13} />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
            <div className="h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KonectCargo;