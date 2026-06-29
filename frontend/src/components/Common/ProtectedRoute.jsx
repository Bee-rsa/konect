import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

const ProtectedRoute = ({ children, role }) => {
  const { user } = useSelector((state) => state.auth);

  // 🔹 Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔹 Detect company user properly
  const isCompanyUser = !!(user?.company && user?.branch);

  // 🔹 Role-based protection
  if (role) {
    // ADMIN
    if (role === "admin" && user?.role !== "admin") {
      return <Navigate to="/" replace />;
    }

    // COMPANY
    if (role === "company" && !isCompanyUser) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  role: PropTypes.string,
};

export default ProtectedRoute;

