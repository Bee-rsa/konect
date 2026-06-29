import { Link } from "react-router-dom";
import { HiOutlineUser, HiBars3BottomRight, HiXMark } from "react-icons/hi2";
import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell";
import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import TopBar from "../Layout/Topbar";

const Navbar = () => {
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(null);
  const [expandedLink, setExpandedLink] = useState(null);

  const dropdownTimeout = useRef(null);
  const { user } = useSelector((state) => state.auth);

  const homeLink = user ? "/user-home" : "/";
  const profileLink = user ? "/profile" : "/register";

  const toggleNavDrawer = () => {
    setNavDrawerOpen(!navDrawerOpen);
    setExpandedLink(null);
  };

  const toggleDropdown = (menu) => {
    if (dropdownTimeout.current) {
      clearTimeout(dropdownTimeout.current);
    }
    setIsDropdownOpen((prev) => (prev === menu ? null : menu));
  };

  const closeDropdownWithDelay = () => {
    dropdownTimeout.current = setTimeout(() => {
      setIsDropdownOpen(null);
    }, 250);
  };

  const cancelCloseDropdown = () => {
    if (dropdownTimeout.current) {
      clearTimeout(dropdownTimeout.current);
    }
  };

  const handleDesktopDropdownLinkClick = () => {
    setIsDropdownOpen(null);
  };

  const toggleSublinks = (link) => {
    setExpandedLink((prev) => (prev === link ? null : link));
  };

  const handleLinkClick = () => {
    if (navDrawerOpen) {
      setNavDrawerOpen(false);
    }
    setExpandedLink(null);
    setIsDropdownOpen(null);
  };

  return (
    <>
      <nav className="w-full bg-custom-blue font-poppins flex justify-between items-center py-2 px-6">
        <div className="text-3xl text-white font-extrabold tracking-tight flex items-center">
  <Link to="/">
  <span className="cursor-pointer text-white">
    Konect
  </span>
</Link>

 <div className="flex items-center gap-6 ml-20 text-xl sm:text-base font-medium">

  <Link
  to="/ride"
  className="transition duration-300 hover:text-custom-sage"
>
  Ride
</Link>

<Link
  to="/eats"
  className="transition duration-300 hover:text-custom-sage"
>
  Eats
</Link>

<Link
  to="/cargo"
  className="transition duration-300 hover:text-custom-sage"
>
  Cargo
</Link>

</div>
</div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative inline-block text-left">
              <Link
                to="/company-login"
                className="text-white text-xl sm:text-base font-medium hover:text-custom-sage transition duration-300 flex items-center font-poppins"
              >
                Konect Core
              </Link>
            </div>

            <div
              className="relative inline-block text-left"
              onMouseEnter={cancelCloseDropdown}
              onMouseLeave={closeDropdownWithDelay}
            >
              <button
                onClick={() => toggleDropdown("resources")}
                className="text-white text-xl sm:text-base font-medium hover:text-custom-sage transition duration-300 flex items-center font-poppins"
              >
                Resources
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M6 10l6 6 6-6"
                  />
                </svg>
              </button>

              {isDropdownOpen === "resources" && (
                <div
                  className="absolute right-0 z-10 mt-2 w-56 bg-white rounded-md shadow-lg"
                  onMouseEnter={cancelCloseDropdown}
                  onMouseLeave={closeDropdownWithDelay}
                >
                  <Link
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-poppins"
                    to="/market-forecast"
                    onClick={handleDesktopDropdownLinkClick}
                  >
                    Market Forecast
                  </Link>
                  <Link
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-poppins"
                    to="/case-studies"
                    onClick={handleDesktopDropdownLinkClick}
                  >
                    Case Studies
                  </Link>
                  <Link
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-poppins"
                    to="/weight-calculator"
                    onClick={handleDesktopDropdownLinkClick}
                  >
                    Weight Calculator
                  </Link>
                </div>
              )}
            </div>

            <div
              className="relative inline-block text-left"
              onMouseEnter={cancelCloseDropdown}
              onMouseLeave={closeDropdownWithDelay}
            >
              <button
                onClick={() => toggleDropdown("company")}
                className="text-white text-xl sm:text-base font-medium hover:text-custom-sage transition duration-300 flex items-center font-poppins"
              >
                Company
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M6 10l6 6 6-6"
                  />
                </svg>
              </button>

              {isDropdownOpen === "company" && (
                <div
                  className="absolute right-0 z-10 mt-2 w-56 bg-white rounded-md shadow-lg"
                  onMouseEnter={cancelCloseDropdown}
                  onMouseLeave={closeDropdownWithDelay}
                >
                  <Link
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-poppins"
                    to="/about-cargo-konect"
                    onClick={handleDesktopDropdownLinkClick}
                  >
                    About Us
                  </Link>
                  <Link
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-poppins"
                    to="/help-centre"
                    onClick={handleDesktopDropdownLinkClick}
                  >
                    Help Centre
                  </Link>
                  <Link
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-poppins"
                    to="/privacy-policy"
                    onClick={handleDesktopDropdownLinkClick}
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-poppins"
                    to="/terms&conditions"
                    onClick={handleDesktopDropdownLinkClick}
                  >
                    Terms & Conditions
                  </Link>
                </div>
              )}
            </div>

            {user && user.role === "admin" && (
              <Link
                to="/admin"
                className="text-white text-xl sm:text-base font-medium hover:text-custom-sage transition duration-300 flex items-center font-poppins"
              >
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Link to={profileLink} className="hidden sm:block hover:text-black">
              <HiOutlineUser className="h-6 w-6 text-custom-sage" />
            </Link>

            {user && <NotificationBell />}

            <div className="hidden md:block overflow-hidden text-white">
              <SearchBar />
            </div>

            <button
              onClick={toggleNavDrawer}
              className="md:hidden flex items-center justify-center"
              aria-label="Open menu"
            >
              {navDrawerOpen ? (
                <HiXMark className="h-6 w-6 text-white" />
              ) : (
                <HiBars3BottomRight className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`md:hidden fixed inset-0 z-50 bg-custom-blue transform transition-transform duration-300 ease-in-out ${
          navDrawerOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <TopBar />

        <div className="border-b border-white/10 bg-custom-blue/95 backdrop-blur-sm">
          <div className="flex justify-between items-center px-4 py-4">
            <div className="text-3xl text-white font-extrabold tracking-tight">
              <Link to={homeLink} onClick={handleLinkClick}>
                Cargo Konect
              </Link>
            </div>

            <button
              onClick={toggleNavDrawer}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none"
              aria-label="Close menu"
            >
              <HiXMark className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="px-4 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <Link
              to={profileLink}
              onClick={handleLinkClick}
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                <HiOutlineUser className="h-5 w-5 text-custom-sage" />
              </div>
              <div>
                <p className="text-sm text-white/70 font-medium">Account</p>
                <p className="text-white text-base font-semibold">
                  {user ? "My Profile" : "Register"}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              {user && <NotificationBell />}
            </div>
          </div>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-140px)]">
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <Link
                to="/terminal-berthing"
                className="block text-white text-base font-semibold px-4 py-4 transition hover:bg-white/10"
                onClick={handleLinkClick}
              >
                Terminals
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div
                onClick={() => toggleSublinks("resources")}
                className="flex justify-between items-center text-white text-base font-semibold px-4 py-4 cursor-pointer transition hover:bg-white/10"
              >
                <span>Resources</span>
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${
                    expandedLink === "resources" ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {expandedLink === "resources" && (
                <div className="px-4 pb-4 space-y-2">
                  <Link
                    to="/market-forecast"
                    className="block rounded-xl bg-white/5 px-3 py-3 text-custom-sage text-sm font-medium"
                    onClick={handleLinkClick}
                  >
                    Market Forecast
                  </Link>
                  <Link
                    to="/case-studies"
                    className="block rounded-xl bg-white/5 px-3 py-3 text-custom-sage text-sm font-medium"
                    onClick={handleLinkClick}
                  >
                    Case Studies
                  </Link>
                  <Link
                    to="/weight-calculator"
                    className="block rounded-xl bg-white/5 px-3 py-3 text-custom-sage text-sm font-medium"
                    onClick={handleLinkClick}
                  >
                    Weight Calculator
                  </Link>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div
                onClick={() => toggleSublinks("company")}
                className="flex justify-between items-center text-white text-base font-semibold px-4 py-4 cursor-pointer transition hover:bg-white/10"
              >
                <span>Company</span>
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${
                    expandedLink === "company" ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {expandedLink === "company" && (
                <div className="px-4 pb-4 space-y-2">
                  <Link
                    to="/about-cargo-konect"
                    className="block rounded-xl bg-white/5 px-3 py-3 text-custom-sage text-sm font-medium"
                    onClick={handleLinkClick}
                  >
                    About Us
                  </Link>
                  <Link
                    to="/help-centre"
                    className="block rounded-xl bg-white/5 px-3 py-3 text-custom-sage text-sm font-medium"
                    onClick={handleLinkClick}
                  >
                    Help Centre
                  </Link>
                  <Link
                    to="/privacy-policy"
                    className="block rounded-xl bg-white/5 px-3 py-3 text-custom-sage text-sm font-medium"
                    onClick={handleLinkClick}
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    to="/terms&conditions"
                    className="block rounded-xl bg-white/5 px-3 py-3 text-custom-sage text-sm font-medium"
                    onClick={handleLinkClick}
                  >
                    Terms & Conditions
                  </Link>
                </div>
              )}
            </div>

            {user && user.role === "admin" && (
              <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                <Link
                  to="/admin"
                  className="block text-white text-base font-semibold px-4 py-4 transition hover:bg-white/10"
                  onClick={handleLinkClick}
                >
                  Admin
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;

import PropTypes from "prop-types";

Navbar.propTypes = {
  mode: PropTypes.string.isRequired,
  setMode: PropTypes.func.isRequired,
};

