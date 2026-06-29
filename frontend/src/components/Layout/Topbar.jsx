import { Activity, Gift, UserCircle, MapPin } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Topbar = () => {
  const { user } = useSelector((state) => state.auth || {});
  const isLoggedIn = !!user;

  const displayName =
    user?.name ||
    user?.fullName ||
    user?.email?.split("@")[0] ||
    null;

  // 🌍 CITY STATE
  const [city, setCity] = useState("Detecting location...");

  // 📍 GET USER LOCATION
  useEffect(() => {
    if (!navigator.geolocation) {
      setCity("Location not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          // 🌐 Reverse geocode using OpenStreetMap
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );

          const data = await res.json();

          const detectedCity =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.state ||
            "Unknown area";

          setCity(detectedCity);
        } catch (err) {
          console.error(err);
          setCity("Unknown location");
        }
      },
      () => {
        setCity("Location denied");
      }
    );
  }, []);

  return (
    <div className="bg-custom-sage text-white">
      <div className="container mx-auto flex items-center justify-between py-1.5 px-4 font-poppins">

        {/* ================= LEFT ================= */}
        <div className="flex items-center gap-4">

          {isLoggedIn ? (
            <>
              <div className="text-sm font-small -ml-5">
                Welcome back, {displayName}!
              </div>

              <div className="hidden sm:block w-px h-5 bg-white/30" />

              <div className="flex items-center gap-2 text-xs md:text-sm text-white/90">
                <Activity className="w-4 h-4" />
                <span>You have no upcoming trips</span>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm -ml-5 md:text-base font-medium">
                Explore what you can do with Konect
              </div>

              {/* 🌍 LIVE CITY DETECTION */}
              <div className="hidden sm:flex items-center gap-2 text-xs md:text-sm text-white/90">
                <MapPin className="w-4 h-4" />
                <span>{city}</span>
              </div>
            </>
          )}

        </div>

        {/* ================= RIGHT ================= */}
        <div className="flex items-center gap-6 text-xs md:text-sm">

          {isLoggedIn ? (
            <>
              <button className="flex items-center gap-2 hover:text-white/80 transition">
                <Activity className="w-4 h-4" />
                <span className="hidden md:inline">Activity</span>
              </button>

              <button className="flex items-center gap-2 hover:text-white/80 transition">
                <Gift className="w-4 h-4" />
                <span className="hidden md:inline">Promotion</span>
              </button>

              <button className="flex items-center gap-2 hover:text-white/80 transition">
                <UserCircle className="w-4 h-4" />
                <span className="hidden md:inline">Account</span>
              </button>
            </>
          ) : (
            <>
              <button className="hover:text-white/80 transition">
                Help
              </button>

              <Link to="/login" className="hover:text-white/80 transition">
                Log in
              </Link>

              <Link
                to="/register"
                className="bg-white text-black px-3 py-1 rounded-md hover:bg-gray-200 transition"
              >
                Sign up
              </Link>
            </>
          )}

        </div>

      </div>
    </div>
  );
};

export default Topbar;