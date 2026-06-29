import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { HiOutlineMapPin } from "react-icons/hi2";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const DURBAN_CENTER = [31.0218, -29.8587];

const RideHero = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const originMarker = useRef(null);
  const destMarker = useRef(null);

  const wrapperRef = useRef(null);

  const [loadMap, setLoadMap] = useState(false);

  const [pickupText, setPickupText] = useState("");
  const [dropoffText, setDropoffText] = useState("");

  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);

  const [originCoords, setOriginCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);

  const [distanceKm, setDistanceKm] = useState(null);
  const [prices, setPrices] = useState(null);

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
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ================= AUTOCOMPLETE =================
  const fetchSuggestions = async (value, setResults) => {
    if (!value) return setResults([]);

    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        value
      )}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}` +
        `&autocomplete=true&limit=7&country=za&proximity=${DURBAN_CENTER[0]},${DURBAN_CENTER[1]}`
    );

    const data = await res.json();
    setResults(data.features || []);
  };

  // ================= PRICING =================
  const calculatePrices = useCallback((km) => {
    const base = {
      uberGo: 6.5,
      xl: 10,
      comfort: 10,
      x: 7.5,
      waitSave: 5.5,
      courierCar: 6.8,
      courierBike: 5.5,
      courierBakkie: 20,
    };

    setPrices({
      distance: km.toFixed(1),

      uberGo: +(base.uberGo * km + 10).toFixed(2),
      xl: +(base.xl * km + 25).toFixed(2),
      comfort: +(base.comfort * km + 25).toFixed(2),
      x: +(base.x * km + 15).toFixed(2),
      waitSave: +(base.waitSave * km + 8).toFixed(2),

      courierCar: +(base.courierCar * km + 5).toFixed(2),
      courierBike: +(base.courierBike * km + 2).toFixed(2),
      courierBakkie: +(base.courierBakkie * km + 50).toFixed(2),
    });
  }, []);

  // ================= ROUTE =================
  const drawRouteAndDistance = useCallback(async (start, end) => {
    if (!start || !end || !map.current) return;

    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&overview=full&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
    );

    const data = await res.json();
    const route = data.routes?.[0];

    if (!route) return;

    const km = route.distance / 1000;
    setDistanceKm(km);
    calculatePrices(km);

    if (map.current.getSource("route")) {
      map.current.removeLayer("route-glow");
      map.current.removeLayer("routeLine");
      map.current.removeSource("route");
    }

    map.current.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: route.geometry,
      },
    });

    map.current.addLayer({
      id: "route-glow",
      type: "line",
      source: "route",
      paint: {
        "line-color": "#000",
        "line-width": 8,
        "line-opacity": 0.3,
      },
    });

    map.current.addLayer({
      id: "routeLine",
      type: "line",
      source: "route",
      paint: {
        "line-color": "#00B4FF",
        "line-width": 4,
      },
    });
  }, [calculatePrices]);

  useEffect(() => {
    if (originCoords && destCoords) {
      drawRouteAndDistance(originCoords, destCoords);
    }
  }, [originCoords, destCoords, drawRouteAndDistance]);

  // ================= MARKERS =================
  const selectPickup = (place) => {
    const coords = place.center;

    setPickupText(place.place_name);
    setPickupSuggestions([]);
    setOriginCoords(coords);

    originMarker.current?.remove();

    originMarker.current = new mapboxgl.Marker({
      color: "green",
      draggable: true,
    })
      .setLngLat(coords)
      .addTo(map.current);
  };

  const selectDropoff = (place) => {
    const coords = place.center;

    setDropoffText(place.place_name);
    setDropoffSuggestions([]);
    setDestCoords(coords);

    destMarker.current?.remove();

    destMarker.current = new mapboxgl.Marker({
      color: "red",
      draggable: true,
    })
      .setLngLat(coords)
      .addTo(map.current);
  };

  // ================= UI =================
  return (
    <div className="px-6 pt-16">
      <div className="flex flex-col md:flex-row gap-8">

        {/* MAP */}
        <div className="w-full md:w-2/5">
          <div className="h-[280px] md:h-[320px] rounded-2xl overflow-hidden">
            {!loadMap ? (
              <div className="h-full flex items-center justify-center bg-black text-white">
                Loading map...
              </div>
            ) : (
              <div ref={mapContainer} className="h-full w-full" />
            )}
          </div>
        </div>

        {/* FORM */}
        <div ref={wrapperRef} className="w-full md:w-3/5 text-white">

          <div className="flex items-center gap-2 mb-6">
            <HiOutlineMapPin className="text-2xl text-green-400" />
            <span>Durban, South Africa</span>
          </div>

          <h1 className="text-4xl font-bold mb-4">Request a ride</h1>

          {/* PICKUP */}
          <input
            value={pickupText}
            onChange={(e) => {
              setPickupText(e.target.value);
              fetchSuggestions(e.target.value, setPickupSuggestions);
            }}
            className="w-full p-3 text-black mb-2"
            placeholder="Pickup"
          />

          {pickupSuggestions.map((item) => (
            <div
              key={item.id}
              onClick={() => selectPickup(item)}
              className="bg-black text-white p-2 cursor-pointer"
            >
              {item.place_name}
            </div>
          ))}

          {/* DROPOFF */}
          <input
            value={dropoffText}
            onChange={(e) => {
              setDropoffText(e.target.value);
              fetchSuggestions(e.target.value, setDropoffSuggestions);
            }}
            className="w-full p-3 text-black mt-4"
            placeholder="Dropoff"
          />

          {dropoffSuggestions.map((item) => (
            <div
              key={item.id}
              onClick={() => selectDropoff(item)}
              className="bg-black text-white p-2 cursor-pointer"
            >
              {item.place_name}
            </div>
          ))}

          {/* DISTANCE */}
          {distanceKm && (
            <div className="mt-4">
              Distance: {distanceKm.toFixed(2)} km
            </div>
          )}

          {/* PRICES */}
          {prices && (
            <div className="mt-4 text-sm space-y-1">
              <div>Uber Go: R{prices.uberGo}</div>
              <div>XL: R{prices.xl}</div>
              <div>Comfort: R{prices.comfort}</div>
              <div>X: R{prices.x}</div>
              <div>Wait Save: R{prices.waitSave}</div>
            </div>
          )}

          <Link to="/login">
            <button className="mt-6 w-full bg-green-400 text-black p-4">
              Compare prices
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RideHero;