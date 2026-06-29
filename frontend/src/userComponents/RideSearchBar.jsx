import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { HiOutlineMapPin } from "react-icons/hi2";
import { FiPlus, FiX, FiClock, FiCalendar } from "react-icons/fi";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const DURBAN_CENTER = [31.0218, -29.8587];


const RideHero = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const originMarker = useRef(null);
  const destMarker = useRef(null);
  const stopMarkers = useRef([]);
  const wrapperRef = useRef(null);

  const [loadMap, setLoadMap] = useState(false);
  const [pickupText, setPickupText] = useState("");
  const [dropoffText, setDropoffText] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [originCoords, setOriginCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
 

  const [extraStops, setExtraStops] = useState([]);
  const [stopSuggestions, setStopSuggestions] = useState([]);
  const [stopCoords, setStopCoords] = useState([]);
  const [schedule, setSchedule] = useState("now");
  

  // ================= MAP INIT =================
  useEffect(() => {
    const timer = setTimeout(() => setLoadMap(true), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loadMap || map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: DURBAN_CENTER,
      zoom: 7,
      attributionControl: false,
    });
  }, [loadMap]);

  // ================= OUTSIDE CLICK =================
  useEffect(() => {
    const handleClick = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setPickupSuggestions([]);
        setDropoffSuggestions([]);
        setStopSuggestions((prev) => prev.map(() => []));
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ================= AUTOCOMPLETE =================
  const fetchSuggestions = async (value, setResults) => {
    if (!value) return setResults([]);
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&autocomplete=true&limit=5&country=za&proximity=${DURBAN_CENTER[0]},${DURBAN_CENTER[1]}`
    );
    const data = await res.json();
    setResults(data.features || []);
  };

  const fetchStopSuggestions = async (value, index) => {
    if (!value) {
      setStopSuggestions((prev) => {
        const updated = [...prev];
        updated[index] = [];
        return updated;
      });
      return;
    }
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&autocomplete=true&limit=5&country=za&proximity=${DURBAN_CENTER[0]},${DURBAN_CENTER[1]}`
    );
    const data = await res.json();
    setStopSuggestions((prev) => {
      const updated = [...prev];
      updated[index] = data.features || [];
      return updated;
    });
  };

  // ================= ROUTE (multi-stop) =================
  const drawRouteAndDistance = useCallback(async (start, end, stops = []) => {
    if (!start || !end || !map.current) return;

    const validStops = stops.filter(Boolean);
    const waypointParts = [
      `${start[0]},${start[1]}`,
      ...validStops.map((c) => `${c[0]},${c[1]}`),
      `${end[0]},${end[1]}`,
    ];

    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${waypointParts.join(";")}?geometries=geojson&overview=full&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
    );
    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) return;

    const km = route.distance / 1000;
    setDistanceKm(km);


    if (map.current.getSource("route")) {
      map.current.removeLayer("route-glow");
      map.current.removeLayer("routeLine");
      map.current.removeSource("route");
    }

    map.current.addSource("route", {
      type: "geojson",
      data: { type: "Feature", geometry: route.geometry },
    });
    map.current.addLayer({
      id: "route-glow",
      type: "line",
      source: "route",
      paint: { "line-color": "#000", "line-width": 8, "line-opacity": 0.3 },
    });
    map.current.addLayer({
      id: "routeLine",
      type: "line",
      source: "route",
      paint: { "line-color": "#00B4FF", "line-width": 4 },
    });
  }, []);

  // Re-draw route whenever origin, dest, or any stop coords change
  useEffect(() => {
    if (originCoords && destCoords) {
      drawRouteAndDistance(originCoords, destCoords, stopCoords);
    }
  }, [originCoords, destCoords, stopCoords, drawRouteAndDistance]);

  // ================= MARKERS =================
  const selectPickup = (place) => {
    setPickupText(place.place_name);
    setPickupSuggestions([]);
    setOriginCoords(place.center);
    originMarker.current?.remove();
    originMarker.current = new mapboxgl.Marker({ color: "green", draggable: true })
      .setLngLat(place.center).addTo(map.current);
  };

  const selectDropoff = (place) => {
    setDropoffText(place.place_name);
    setDropoffSuggestions([]);
    setDestCoords(place.center);
    destMarker.current?.remove();
    destMarker.current = new mapboxgl.Marker({ color: "red", draggable: true })
      .setLngLat(place.center).addTo(map.current);
  };

  const selectStop = (place, index) => {
    updateStop(index, place.place_name);
    setStopSuggestions((prev) => {
      const updated = [...prev];
      updated[index] = [];
      return updated;
    });

    // Save stop coord — triggers route redraw via useEffect
    setStopCoords((prev) => {
      const updated = [...prev];
      updated[index] = place.center;
      return updated;
    });

    // Pin gray marker on map
    if (stopMarkers.current[index]) stopMarkers.current[index].remove();
    stopMarkers.current[index] = new mapboxgl.Marker({ color: "#888", draggable: true })
      .setLngLat(place.center).addTo(map.current);
  };

  // ================= EXTRA STOPS =================
  const addStop = () => {
    if (extraStops.length >= 3) return;
    setExtraStops((prev) => [...prev, ""]);
    setStopSuggestions((prev) => [...prev, []]);
    setStopCoords((prev) => [...prev, null]);
  };

  const removeStop = (i) => {
    setExtraStops((prev) => prev.filter((_, idx) => idx !== i));
    setStopSuggestions((prev) => prev.filter((_, idx) => idx !== i));
    setStopCoords((prev) => prev.filter((_, idx) => idx !== i));
    if (stopMarkers.current[i]) {
      stopMarkers.current[i].remove();
      stopMarkers.current.splice(i, 1);
    }
  };

  const updateStop = (i, val) =>
    setExtraStops((prev) => prev.map((s, idx) => (idx === i ? val : s)));

  return (
    <div className="px-6 pt-16 -mt-8">
      <div className="flex flex-col md:flex-row gap-8">

        {/* FORM */}
        <div ref={wrapperRef} className="w-full md:w-2/5 text-white p-6">

          <div className="flex items-center gap-2 mb-6">
            <HiOutlineMapPin className="text-2xl text-custom-sage" />
            <span className="text-custom-blue">Durban, South Africa</span>
          </div>

          <h1 className="text-4xl text-custom-blue font-bold mb-4">Request a ride</h1>

          {/* PICKUP + STOPS + DROPOFF */}
          <div className="flex gap-3 mt-2">

            {/* LEFT: dot → line → stop dots → line → red dot */}
            <div className="flex flex-col items-center pt-3.5 flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-custom-blue border-2 border-custom-blue flex-shrink-0" />
              <div className="w-0.5 bg-gray-300 flex-1 my-1" style={{ minHeight: "2.8rem" }} />
              {extraStops.map((_, i) => (
                <div key={i} className="flex flex-col items-center w-full">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-gray-400 flex-shrink-0" />
                  <div className="w-0.5 bg-gray-300 flex-1 my-1" style={{ minHeight: "2.8rem" }} />
                </div>
              ))}
              <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-500 flex-shrink-0" />
            </div>

            {/* MIDDLE: inputs */}
            <div className="flex-1 flex flex-col gap-2">

              {/* PICKUP */}
              <div>
                <input
                  value={pickupText}
                  onChange={(e) => { setPickupText(e.target.value); fetchSuggestions(e.target.value, setPickupSuggestions); }}
                  className="w-full p-3 text-custom-blue"
                  placeholder="Pickup location"
                />
                {pickupSuggestions.map((item) => (
                  <div key={item.id} onClick={() => selectPickup(item)} className="bg-custom-blue text-white p-2 cursor-pointer text-sm">
                    {item.place_name}
                  </div>
                ))}
              </div>

              {/* EXTRA STOPS — Stop 1, Stop 2, Stop 3 */}
              {extraStops.map((stop, i) => (
                <div key={i}>
                  <input
                    value={stop}
                    onChange={(e) => { updateStop(i, e.target.value); fetchStopSuggestions(e.target.value, i); }}
                    className="w-full p-3 text-custom-blue"
                    placeholder={`Stop ${i + 1}`}
                  />
                  {(stopSuggestions[i] || []).map((item) => (
                    <div key={item.id} onClick={() => selectStop(item, i)} className="bg-gray-700 text-white p-2 cursor-pointer text-sm">
                      {item.place_name}
                    </div>
                  ))}
                </div>
              ))}

              {/* DROPOFF */}
              <div>
                <input
                  value={dropoffText}
                  onChange={(e) => { setDropoffText(e.target.value); fetchSuggestions(e.target.value, setDropoffSuggestions); }}
                  className="w-full p-3 text-custom-blue"
                  placeholder="Dropoff location"
                />
                {dropoffSuggestions.map((item) => (
                  <div key={item.id} onClick={() => selectDropoff(item)} className="bg-black text-white p-2 cursor-pointer text-sm">
                    {item.place_name}
                  </div>
                ))}
              </div>

            </div>

            {/* RIGHT: X buttons + plus */}
            <div className="flex flex-col flex-shrink-0 pt-2 gap-2">
              {/* spacer for pickup row */}
              <div style={{ height: "2.8rem" }} />

              {/* X per stop — same style as plus */}
              {extraStops.map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => removeStop(i)}
                    className="w-7 h-7 mt-1.5 rounded-full border border-gray-400 flex items-center justify-center text-custom-blue hover:bg-gray-100 transition"
                  >
                    <FiX size={13} />
                  </button>
                  <div style={{ height: "calc(2.8rem - 1.75rem)" }} />
                </div>
              ))}

              {/* Plus — aligned to dropoff, hidden after 3 stops */}
              {extraStops.length < 3 && (
                <button
                  onClick={addStop}
                  className="w-7 h-7 mt-1.5 rounded-full border border-gray-400 flex items-center justify-center text-custom-blue hover:bg-gray-100 transition"
                  title="Add stop"
                >
                  <FiPlus size={14} />
                </button>
              )}
            </div>

          </div>

          {/* SCHEDULE TOGGLE */}
          <div className="flex gap-2 mt-8">
            <button
              onClick={() => setSchedule("now")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium border transition
                ${schedule === "now" ? "bg-custom-blue text-white border-custom-blue" : "border-gray-300 text-custom-blue hover:bg-gray-50"}`}
            >
              <FiClock size={13} /> Leave now
            </button>
            <button
              onClick={() => setSchedule("later")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium border transition
                ${schedule === "later" ? "bg-custom-blue text-white border-custom-blue" : "border-gray-300 text-custom-blue hover:bg-gray-50"}`}
            >
              <FiCalendar size={13} /> Schedule
            </button>
          </div>
          {schedule === "later" && (
            <input
              type="datetime-local"
              className="mt-2 w-full p-3 text-custom-blue border border-gray-300 rounded-xl outline-none"
            />
          )}

          {/* DISTANCE */}
          {distanceKm && (
            <div className="mt-4 text-custom-blue text-sm">
              Distance: {distanceKm.toFixed(2)} km
            </div>
          )}

          {/* COMPARE PRICES */}
          {originCoords && destCoords && (
            <Link to="/konect-ride" state={{ originCoords, destCoords, stopCoords, distanceKm, pickupText, dropoffText, extraStops }} className="block mt-6">
              <button className="w-full bg-custom-sage text-stone-200 p-3 text-base font-semibold tracking-wide">
                Compare prices
              </button>
            </Link>
          )}

        </div>

        {/* MAP */}
        <div className="w-full md:w-3/5 p-8">
          <div className="h-[280px] md:h-[320px] rounded-2xl overflow-hidden">
            {!loadMap ? (
              <div className="h-full flex items-center justify-center bg-black text-white">Loading map...</div>
            ) : (
              <div ref={mapContainer} className="h-full w-full" />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RideHero;