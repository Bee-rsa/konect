import {
  FaSignOutAlt,
  FaGlobe,
  FaUser,
  FaBookOpen,
  FaBell,
  FaFileAlt,
  FaShip,
  FaCar,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../redux/slices/authSlice";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const navLinkClasses = ({ isActive }) =>
    `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-white text-custom-blue shadow-sm"
        : "text-white/80 hover:bg-white/10 hover:text-white"
    }`;

  const iconClasses = (isActive) =>
    `text-base ${
      isActive
        ? "text-custom-sage"
        : "text-white/70 group-hover:text-custom-sage"
    } transition-colors duration-200`;

  return (
    <aside className="flex h-full w-full flex-col bg-custom-blue px-5 py-6">
      <div className="mb-8 border-b border-white/10 pb-6">
        <Link
          to="/admin"
          className="inline-block text-2xl font-extrabold tracking-tight text-white"
        >
          Cargo Konect
        </Link>
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-white/50">
          Admin Panel
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white">
          Dashboard Navigation
        </h2>
      </div>

      <nav className="flex flex-1 flex-col gap-2">

        <NavLink to="/admin/users" end className={navLinkClasses}>
          {({ isActive }) => (
            <>
              <FaUser className={iconClasses(isActive)} />
              <span>Users</span>
            </>
          )}
        </NavLink>

        <NavLink to="/admin/case-studies" end className={navLinkClasses}>
          {({ isActive }) => (
            <>
              <FaBookOpen className={iconClasses(isActive)} />
              <span>Case Studies</span>
            </>
          )}
        </NavLink>

        <NavLink to="/admin/case-studies/new" className={navLinkClasses}>
          {({ isActive }) => (
            <>
              <FaFileAlt className={iconClasses(isActive)} />
              <span>Create Case Study</span>
            </>
          )}
        </NavLink>

        <NavLink to="/admin/terminal-berthing" end className={navLinkClasses}>
          {({ isActive }) => (
            <>
              <FaShip className={iconClasses(isActive)} />
              <span>Terminal Berthing</span>
            </>
          )}
        </NavLink>

        <NavLink to="/admin/notifications" end className={navLinkClasses}>
          {({ isActive }) => (
            <>
              <FaBell className={iconClasses(isActive)} />
              <span>Notifications</span>
            </>
          )}
        </NavLink>

        {/* ── Divider ── */}
        <div className="my-2 border-t border-white/10" />
        <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-1">
          Konect Drive
        </p>

        <NavLink to="/admin/drivers" end className={navLinkClasses}>
          {({ isActive }) => (
            <>
              <FaCar className={iconClasses(isActive)} />
              <span>Drivers</span>
            </>
          )}
        </NavLink>

        {/* ── Divider ── */}
        <div className="my-2 border-t border-white/10" />

        <NavLink to="/" end className={navLinkClasses}>
          {({ isActive }) => (
            <>
              <FaGlobe className={iconClasses(isActive)} />
              <span>Website</span>
            </>
          )}
        </NavLink>

      </nav>

      <div className="mt-8 border-t border-white/10 pt-6">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;