import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  FiNavigation2, FiStar, FiTruck, FiPackage, FiZap,
  FiArrowLeft, FiClock, FiUsers, FiMapPin, FiCheckCircle,
} from "react-icons/fi";
import Navbar from "../components/common/Navbar";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const services = [
  { id: "uberGo",     label: "Konect Go",      description: "Affordable everyday rides",        icon: <FiNavigation2 size={22} />, key: "uberGo",     seats: 4,    eta: "2–4 min",   badge: null },
  { id: "comfort",    label: "Konect Comfort",  description: "Newer cars with extra legroom",    icon: <FiStar size={22} />,        key: "comfort",    seats: 4,    eta: "4–6 min",   badge: "Popular" },
  { id: "xl",         label: "Konect XL",       description: "Group rides up to 6 passengers",   icon: <FiTruck size={22} />,       key: "xl",         seats: 6,    eta: "6–10 min",  badge: null },
  { id: "courierCar", label: "Konect Courier",  description: "Fast parcel and package delivery",  icon: <FiPackage size={22} />,     key: "courierCar", seats: null, eta: "3–5 min",   badge: null },
  { id: "waitSave",   label: "Konect Express",  description: "Budget rides, slightly longer wait",icon: <FiZap size={22} />,         key: "waitSave",   seats: 4,    eta: "8–12 min",  badge: "Best value" },
];

const KonectRide = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const mapContainer = useRef(null);
  const map          = useRef(null);

  const [prices,     setPrices]     = useState(null);
  const [distanceKm, setDistanceKm] = useState(state?.distanceKm || null);
  const [selected,   setSelected]   = useState("uberGo");

  const {
    originCoords, destCoords, stopCoords = [],
    pickupText, dropoffText, extraStops = [],
  } = state || {};

  /* ── Map init ── */
  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style:     "mapbox://styles/mapbox/streets-v12",
      center:    originCoords || [31.0218, -29.8587],
      zoom:      12,
      attributionControl: false,
    });

    map.current.on("load", () => {
      if (originCoords) new mapboxgl.Marker({ color: "#2E7D32" }).setLngLat(originCoords).addTo(map.current);
      if (destCoords)   new mapboxgl.Marker({ color: "#000042" }).setLngLat(destCoords).addTo(map.current);
      stopCoords.filter(Boolean).forEach((c) => new mapboxgl.Marker({ color: "#888" }).setLngLat(c).addTo(map.current));
      if (originCoords && destCoords) drawRoute();
    });
  }, []);

  /* ── Draw route ── */
  const drawRoute = async () => {
    const validStops   = stopCoords.filter(Boolean);
    const waypointParts = [
      `${originCoords[0]},${originCoords[1]}`,
      ...validStops.map((c) => `${c[0]},${c[1]}`),
      `${destCoords[0]},${destCoords[1]}`,
    ];

    const res   = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${waypointParts.join(";")}?geometries=geojson&overview=full&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`);
    const data  = await res.json();
    const route = data.routes?.[0];
    if (!route) return;

    const km = route.distance / 1000;
    setDistanceKm(km);
    calculatePrices(km);

    map.current.addSource("route", { type: "geojson", data: { type: "Feature", geometry: route.geometry } });
    map.current.addLayer({ id: "route-glow", type: "line", source: "route", paint: { "line-color": "#000042", "line-width": 8, "line-opacity": 0.1 } });
    map.current.addLayer({ id: "routeLine",  type: "line", source: "route", paint: { "line-color": "#2E7D32", "line-width": 4 } });

    const coords = route.geometry.coordinates;
    const bounds = coords.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coords[0], coords[0]));
    map.current.fitBounds(bounds, { padding: 80 });
  };

  /* ── Pricing ── */
  const calculatePrices = (km) => {
    const perKm   = { uberGo: 7.0, comfort: 9.0, xl: 11.0, courierCar: 8.0, waitSave: 7.5 };
    const base    = { uberGo: 12,  comfort: 18,  xl: 25,   courierCar: 15,  waitSave: 10  };
    const minimum = { uberGo: 30,  comfort: 45,  xl: 60,   courierCar: 35,  waitSave: 25  };
    const calc    = (key) => Math.max(+(perKm[key] * km + base[key]).toFixed(2), minimum[key]);
    setPrices({
      uberGo:     calc("uberGo"),
      comfort:    calc("comfort"),
      xl:         calc("xl"),
      courierCar: calc("courierCar"),
      waitSave:   calc("waitSave"),
    });
  };

  useEffect(() => {
    if (state?.distanceKm) calculatePrices(state.distanceKm);
  }, []);

  const activeService = services.find((s) => s.id === selected);

  /* ── Handle confirm — navigate to tracking page ── */
  const handleConfirm = () => {
    navigate("/ride-tracking", {
      state: {
        serviceType:  selected,
        serviceLabel: activeService?.label,
        price:        prices?.[activeService?.key],
        distanceKm,
        pickupText,
        dropoffText,
        originCoords,
        destCoords,
        stopCoords,
        extraStops,
      },
    });
  };

  /* ── Empty state ── */
  if (!originCoords || !destCoords) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center font-poppins bg-stone-100">
          <FiMapPin size={40} className="text-gray-300 mb-4" />
          <p className="text-gray-500 mb-2 font-medium">No route selected</p>
          <p className="text-sm text-gray-400 mb-6">Please set a pickup and dropoff location first.</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white px-6 py-3 rounded-xl text-sm font-semibold transition"
            style={{ backgroundColor: "#000042" }}
          >
            <FiArrowLeft size={16} /> Go back
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen font-poppins flex flex-col" style={{ backgroundColor: "#f5f5f4" }}>
      <Navbar />

      {/* Mobile: map on top */}
      <div className="lg:hidden relative w-full h-[35vh] overflow-hidden">
        <div ref={mapContainer} className="w-full h-full" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center"
        >
          <FiArrowLeft size={17} style={{ color: "#000042" }} />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow text-xs flex items-center gap-1.5 max-w-[90%] overflow-hidden">
          <span className="font-semibold truncate max-w-[90px]" style={{ color: "#2E7D32" }}>
            {pickupText?.split(",")[0]}
          </span>
          {extraStops.map((s, i) => (
            <span key={i} className="flex items-center gap-1 truncate">
              <span className="text-gray-300">{">"}</span>
              <span className="text-gray-500 truncate max-w-[60px]">{s?.split(",")[0]}</span>
            </span>
          ))}
          <span className="text-gray-300">{">"}</span>
          <span className="font-semibold truncate max-w-[90px]" style={{ color: "#000042" }}>
            {dropoffText?.split(",")[0]}
          </span>
          {distanceKm && <span className="text-gray-400 flex-shrink-0">· {distanceKm.toFixed(1)} km</span>}
        </div>
      </div>

      {/* Desktop: side by side */}
      <div className="flex flex-col lg:flex-row flex-1 lg:gap-5 lg:p-5 lg:pt-4">

        {/* ── LEFT: BOOKING PANEL ── */}
        <div className="w-full lg:w-[42%] bg-white lg:rounded-2xl flex flex-col lg:shadow-sm overflow-hidden">

          <div className="lg:hidden w-10 h-1 bg-gray-200 rounded-full mx-auto mt-4 mb-2" />

          <div className="flex-1 overflow-y-auto px-4 lg:px-6 pt-5 lg:pt-6 pb-4">

            {/* Header desktop */}
            <div className="hidden lg:flex items-center gap-3 mb-5">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-stone-50 transition"
              >
                <FiArrowLeft size={16} style={{ color: "#000042" }} />
              </button>
              <div>
                <h2 className="text-xl font-bold" style={{ color: "#000042" }}>Choose a ride</h2>
                {distanceKm && <p className="text-xs text-gray-400 mt-0.5">{distanceKm.toFixed(1)} km · all fees included</p>}
              </div>
            </div>

            {/* Header mobile */}
            <div className="lg:hidden mb-4">
              <h2 className="text-lg font-bold" style={{ color: "#000042" }}>Choose a ride</h2>
              {distanceKm && <p className="text-xs text-gray-400 mt-0.5">{distanceKm.toFixed(1)} km · all fees included</p>}
            </div>

            {/* Route summary */}
            <div className="rounded-2xl border border-gray-100 px-4 py-3 mb-5" style={{ backgroundColor: "#f9f9f8" }}>
              <div className="flex gap-3">
                <div className="flex flex-col items-center pt-1 flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#2E7D32" }} />
                  <div className="w-px flex-1 bg-gray-200 my-1 min-h-[1rem]" />
                  {extraStops.map((_, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                      <div className="w-px flex-1 bg-gray-200 my-1 min-h-[1rem]" />
                    </div>
                  ))}
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#000042" }} />
                </div>
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{pickupText}</p>
                  {extraStops.map((s, i) => (
                    <p key={i} className="text-xs text-gray-500 truncate">{s}</p>
                  ))}
                  <p className="text-sm font-medium text-gray-800 truncate">{dropoffText}</p>
                </div>
              </div>
            </div>

            {/* Service list */}
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Available rides
            </p>

            <div className="flex flex-col gap-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s.id)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl border transition text-left"
                  style={{
                    borderColor:     selected === s.id ? "#000042" : "#f0f0ee",
                    backgroundColor: selected === s.id ? "#f0f0f8" : "#ffffff",
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition"
                    style={{
                      backgroundColor: selected === s.id ? "#000042" : "#f5f5f4",
                      color:           selected === s.id ? "#ffffff" : "#555",
                    }}
                  >
                    {s.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{s.label}</p>
                      {s.badge && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "#e8f5e9", color: "#2E7D32" }}
                        >
                          {s.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{s.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <FiClock size={10} /> {s.eta}
                      </span>
                      {s.seats && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-400">
                          <FiUsers size={10} /> {s.seats} seats
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                    {prices ? (
                      <>
                        <p className="text-base font-bold" style={{ color: "#000042" }}>R{prices[s.key]}</p>
                        <p className="text-[10px] text-gray-400">estimated</p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400 animate-pulse">Loading...</p>
                    )}
                    {selected === s.id && <FiCheckCircle size={13} style={{ color: "#000042" }} />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CONFIRM BUTTON */}
          <div className="px-4 lg:px-6 py-4 border-t border-gray-100 bg-white lg:rounded-b-2xl">
            <button
              onClick={handleConfirm}
              disabled={!prices}
              className="w-full py-3.5 text-white text-sm font-semibold rounded-2xl transition flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "#2E7D32" }}
            >
              Confirm {activeService?.label}
              {prices && (
                <span className="bg-white/20 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                  R{prices[activeService?.key]}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── RIGHT: MAP desktop ── */}
        <div className="hidden lg:block w-[58%] relative rounded-2xl overflow-hidden" style={{ height: "calc(100vh - 110px)" }}>
          <div ref={mapContainer} className="w-full h-full" />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow text-xs flex items-center gap-1.5 max-w-[85%] overflow-hidden">
            <span className="font-semibold truncate max-w-[110px]" style={{ color: "#2E7D32" }}>
              {pickupText?.split(",")[0]}
            </span>
            {extraStops.map((s, i) => (
              <span key={i} className="flex items-center gap-1 truncate">
                <span className="text-gray-300">{">"}</span>
                <span className="text-gray-500 truncate max-w-[70px]">{s?.split(",")[0]}</span>
              </span>
            ))}
            <span className="text-gray-300">{">"}</span>
            <span className="font-semibold truncate max-w-[110px]" style={{ color: "#000042" }}>
              {dropoffText?.split(",")[0]}
            </span>
            {distanceKm && <span className="text-gray-400 flex-shrink-0 ml-1">· {distanceKm.toFixed(1)} km</span>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default KonectRide;