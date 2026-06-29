import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

const FirstTimeFlowGuard = ({ children }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // If no user, allow access
  if (!user) return children;

  // 🔥 IMPORTANT: Skip first-time flow for company-side users
  if (
    ["company", "master_holder", "branch_admin", "user", "read_only"].includes(
      user.role
    )
  ) {
    return children;
  }

  // Normal user flow only
  if (!user.hasAcceptedTerms && location.pathname !== "/terms-acceptance") {
    return <Navigate to="/terms-acceptance" replace />;
  }

  if (
    user.hasAcceptedTerms &&
    !user.hasSeenWelcome &&
    location.pathname !== "/welcome"
  ) {
    return <Navigate to="/welcome" replace />;
  }

  return children;
};

FirstTimeFlowGuard.propTypes = {
  children: PropTypes.node.isRequired,
};

export default FirstTimeFlowGuard;

