import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const CompanyTopBar = ({ homeLink = "/company-home" }) => {
  const companyUserInfo = JSON.parse(
    localStorage.getItem("companyUserInfo") || "null"
  );
  const companyUser = JSON.parse(localStorage.getItem("companyUser") || "null");
  const userInfo =
    companyUserInfo ||
    companyUser ||
    JSON.parse(localStorage.getItem("userInfo") || "{}");

  const companyName =
    userInfo?.company?.companyName ||
    userInfo?.companyName ||
    userInfo?.businessName ||
    userInfo?.name ||
    "-";

  const region =
    userInfo?.branch?.region ||
    userInfo?.company?.region ||
    userInfo?.region ||
    "";

  const branch =
    userInfo?.branch?.branchName ||
    userInfo?.branchName ||
    userInfo?.branch ||
    "";

  return (
    <div className="w-full bg-custom-blue text-white">
      <div className="relative flex items-center px-4 py-3 sm:px-6">
        
        {/* LEFT: Logo */}
        <Link
          to={homeLink}
          className="text-lg font-extrabold tracking-tight sm:text-xl md:text-[22px]"
        >
          Konect Cargo 
        </Link>

        {/* CENTER: Company Info (true center) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 text-center text-[11px] font-medium tracking-[0.01em] sm:text-xs md:text-[13px]"
          style={{
            fontFamily:
              '"Consolas", "Menlo", "Monaco", "Courier New", monospace',
          }}
        >
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-1">
            <span>
              Company: <span className="font-semibold">{companyName}</span>
            </span>

            {region && (
              <span>
                Region: <span className="font-semibold">{region}</span>
              </span>
            )}

            {branch && (
              <span>
                Branch: <span className="font-semibold">{branch}</span>
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

CompanyTopBar.propTypes = {
  homeLink: PropTypes.string,
};

export default CompanyTopBar;