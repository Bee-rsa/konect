import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Heart } from "lucide-react";

const menuData = {
  Operations: {
    Forwarding: ["Shipments", "Jobs/Orders", "Schedule Timeline"],
    Tracking: [
      "Live Tracking",
      "Schedule/Timelines",
      "Status Updates",
      "ETA Updates",
      "Share Tracking Link",
      "Terminal Updates",
    ],
    "Fleet Management": [
      "Fleet Overview",
      "Add Vehicle",
      "Driver Profile",
      "Assign Driver to Job",
      "Vehicle Availability Status",
      "Maintenance Logs",
    ],
    Dispatch: [
      "Driver Instructions",
      "In-App Messaging",
      "Route Optimaztion",
      "Status Buttons",
      "Real-Time Updates",
    ],
  },

  Rates: {
    "Rate Management": [
      "Service Rate",
      "My rate profile",
      "Rate Edit",
    ],
    "Quote System": [
      "Quote Simulator",
      "Generated Quotes",
      "Quote Templates",
    ],
    Contracts: [
      "Customer-specific pricing",
      "Contract rate vs standard rates",
    ],
  },

  Intelligence: {
    Performance: [
      "Analytics",
      "Demand Forecast",
      "Conversion rate",
      "Top routes",
    ],
    "Market Intelligence": [
      "Terminal Berthing",
      "Port Updates",
      "Trade Flow Trends",
      "Regional Demand",
      "Operations Report",
      "Fleet Performance",
      "Delivery Performance",
    ],
    Insights: [
      "Case studies",
      "Market forecast",
      "Reports",
      "Service gaps",
    ],
  },

  Management: {
    Customers: [
      "Customer List",
      "Customer Profiles",
      "Customer Requests",
      "Customer Support",
    ],
    Team: ["Users", "Roles & Permissions", "Attendance", "Performance"],
    Documents: [
      "Invoices",
      "POD",
      "BOL",
      "Contracts",
      "Uploaded Files",
    ],
    Financials: [
      "Billing/Payments",
      "Invoice history",
      "Earnings Overview",
      "Payouts",
    ],
    Settings: [
      "Company Profile",
      "Region Settings",
      "Branch Settings",
      "Notifications",
    ],
  },

  Options: {},
  Help: {},
};

const simpleMenuLinks = {
  Options: [
    { label: "Change Password", to: "/change-password" },
    { label: "Change Company or Branch", action: "change-company-or-branch" },
    { label: "Log Out", action: "logout" },
  ],
  Help: [
    { label: "My account", to: "/my-account" },
    { label: "Training Academy", to: "/training-academy" },
    { label: "Help Centre", to: "/help-centre" },
    { label: "About", to: "/about" },
  ],
};

const fieldRouteMap = {
  Shipments: "/operations/forwarding/shipments",
  "Jobs/Orders": "/operations/forwarding/jobs-orders",
  "Schedule Timeline": "/operations/forwarding/schedule-timeline",

  "Live Tracking": "/operations/tracking/live-tracking",
  "Schedule/Timelines": "/operations/tracking/schedule-timelines",
  "Status Updates": "/operations/tracking/status-updates",
  "ETA Updates": "/operations/tracking/eta-updates",
  "Share Tracking Link": "/operations/tracking/share-tracking-link",
  "Terminal Updates": "/terminal-berthing",

  "Fleet Overview": "/operations/fleet-management/fleet-overview",
  "Add Vehicle": "/operations/fleet-management/add-vehicle",
  "Driver Profile": "/operations/fleet-management/driver-profile",
  "Assign Driver to Job": "/operations/fleet-management/assign-driver",
  "Vehicle Availability Status": "/operations/fleet-management/vehicle-availability",
  "Maintenance Logs": "/operations/fleet-management/maintenance-logs",

  "Driver Instructions": "/operations/dispatch/driver-instructions",
  "In-App Messaging": "/operations/dispatch/in-app-messaging",
  "Route Optimaztion": "/operations/dispatch/route-optimaztion",
  "Status Buttons": "/operations/dispatch/status-buttons",
  "Real-Time Updates": "/operations/dispatch/real-time-updates",

  "Service Rate": "/service-rate",
  "My rate profile": "/rates/rate-management/my-rate-profile",
  "Rate Edit": "/rates/rate-management/rate-edit",

  "Quote Simulator": "/rates/quote-system/quote-simulator",
  "Generated Quotes": "/rates/quote-system/generated-quotes",
  "Quote Templates": "/rates/quote-system/quote-templates",

  "Customer-specific pricing": "/rates/contracts/customer-specific-pricing",
  "Contract rate vs standard rates": "/rates/contracts/contract-vs-standard",

  Analytics: "/intelligence/performance/analytics",
  "Demand Forecast": "/intelligence/performance/demand-forecast",
  "Conversion rate": "/intelligence/performance/conversion-rate",
  "Top routes": "/intelligence/performance/top-routes",

  "Terminal Berthing": "/intelligence/market-intelligence/terminal-berthing",
  "Port Updates": "/intelligence/market-intelligence/port-updates",
  "Trade Flow Trends": "/intelligence/market-intelligence/trade-flow-trends",
  "Regional Demand": "/intelligence/market-intelligence/regional-demand",
  "Operations Report": "/intelligence/market-intelligence/operations-report",
  "Fleet Performance": "/intelligence/market-intelligence/fleet-performance",
  "Delivery Performance": "/intelligence/market-intelligence/delivery-performance",

  "Case studies": "/intelligence/insights/case-studies",
  "Market forecast": "/intelligence/insights/market-forecast",
  Reports: "/intelligence/insights/reports",
  "Service gaps": "/intelligence/insights/service-gaps",

  "Customer List": "/management/customers/customer-list",
  "Customer Profiles": "/management/customers/customer-profiles",
  "Customer Requests": "/management/customers/customer-requests",
  "Customer Support": "/management/customers/customer-support",

  Users: "/management/team/users",
  "Roles & Permissions": "/management/team/roles-permissions",
  Attendance: "/management/team/attendance",
  Performance: "/management/team/performance",

  Invoices: "/management/documents/invoices",
  POD: "/management/documents/pod",
  BOL: "/management/documents/bol",
  Contracts: "/management/documents/contracts",
  "Uploaded Files": "/management/documents/uploaded-files",

  "Billing/Payments": "/management/financials/billing-payments",
  "Invoice history": "/management/financials/invoice-history",
  "Earnings Overview": "/management/financials/earnings-overview",
  Payouts: "/management/financials/payouts",

  "Company Profile": "/management/settings/company-profile",
  "Region Settings": "/management/settings/region-settings",
  "Branch Settings": "/management/settings/branch-settings",
  Notifications: "/management/settings/notifications",
};

const CompanyNavbar = () => {
  const [openMainMenu, setOpenMainMenu] = useState("");
  const [openCategory, setOpenCategory] = useState("");
  const [favourites, setFavourites] = useState([]);
  const navigate = useNavigate();

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
    "";

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

  const role = userInfo?.role || "";
  const homeLink = "/company-home";

  useEffect(() => {
    const stored = localStorage.getItem("companyFavourites");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setFavourites(parsed);
      }
    } catch (error) {
      console.error("Failed to parse company favourites:", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("companyFavourites", JSON.stringify(favourites));
  }, [favourites]);

  const leftMenuItems = useMemo(() => {
    const baseItems = ["Operations", "Rates", "Intelligence", "Management"];

    if (role === "master_holder") {
      baseItems.push("Master");
    }

    return baseItems;
  }, [role]);

  const rightMenuItems = ["Options", "Help"];

  const activeMenuContent = useMemo(() => {
    return openMainMenu ? menuData[openMainMenu] || {} : {};
  }, [openMainMenu]);

  const activeCategories = Object.keys(activeMenuContent);

  const activeSubFields =
    openCategory && activeMenuContent[openCategory]
      ? activeMenuContent[openCategory]
      : [];

  const handleMainMenuClick = (item) => {
    if (openMainMenu === item) {
      setOpenMainMenu("");
      setOpenCategory("");
      return;
    }

    setOpenMainMenu(item);
    setOpenCategory("");
  };

  const handleCategoryClick = (category) => {
    if (openCategory === category) {
      setOpenCategory("");
      return;
    }

    setOpenCategory(category);
  };

  const isFavourite = (field) => {
    return favourites.some(
      (fav) =>
        fav.section === openMainMenu &&
        fav.category === openCategory &&
        fav.item === field
    );
  };

  const toggleFavourite = (field) => {
    const favouriteItem = {
      section: openMainMenu,
      category: openCategory,
      item: field,
    };

    setFavourites((prev) => {
      const exists = prev.some(
        (fav) =>
          fav.section === favouriteItem.section &&
          fav.category === favouriteItem.category &&
          fav.item === favouriteItem.item
      );

      if (exists) {
        return prev.filter(
          (fav) =>
            !(
              fav.section === favouriteItem.section &&
              fav.category === favouriteItem.category &&
              fav.item === favouriteItem.item
            )
        );
      }

      return [...prev, favouriteItem];
    });
  };

  const clearSession = () => {
    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(
          /=.*/,
          "=;expires=" + new Date(0).toUTCString() + ";path=/"
        );
    });
  };

  const handleLogout = () => {
    clearSession();
    navigate("/", { replace: true });
    window.location.href = "/";
  };

  const handleChangeCompanyOrBranch = () => {
    clearSession();
    navigate("/company-login", { replace: true });
    window.location.href = "/company-login";
  };

  const handleSimpleMenuAction = (action) => {
    setOpenMainMenu("");
    setOpenCategory("");

    if (action === "logout") {
      handleLogout();
      return;
    }

    if (action === "change-company-or-branch") {
      handleChangeCompanyOrBranch();
    }
  };

  const showStructuredPanel =
    openMainMenu === "Operations" ||
    openMainMenu === "Rates" ||
    openMainMenu === "Intelligence" ||
    openMainMenu === "Management";

  const showSimplePanel =
    openMainMenu === "Options" || openMainMenu === "Help";

  return (
    <div className="relative z-50 w-full overflow-visible">
      <div className="w-full bg-custom-blue text-white">
        <div className="relative flex h-[42px] items-center px-6 sm:px-6">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[22px] font-extrabold tracking-tight leading-none text-white sm:left-6">
            <Link to={homeLink}>Konect Core</Link>
          </div>

          <div
            className="mx-auto text-center text-[11px] font-medium tracking-[0.01em] text-white sm:text-xs md:text-[13px]"
            style={{
              fontFamily:
                '"Consolas", "Menlo", "Monaco", "Courier New", monospace',
            }}
          >
            <span>
              Company: <span className="font-semibold">{companyName}</span>
            </span>

            {region && (
              <>
                <span className="mx-2">-</span>
                <span>
                  Region: <span className="font-semibold">{region}</span>
                </span>
              </>
            )}

            {branch && (
              <>
                <span className="mx-2">-</span>
                <span>
                  Branch: <span className="font-semibold">{branch}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="w-full bg-custom-blue text-white">
        <div className="flex min-h-[42px] items-center justify-between px-2 sm:px-6">
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            {leftMenuItems.map((item) =>
              item === "Master" ? (
                <Link
                  key={item}
                  to="/master"
                  className="border-b border-transparent px-0 py-2 text-[11px] font-medium font-sans transition hover:opacity-85 sm:text-xs md:text-[13px]"
                >
                  Master
                </Link>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleMainMenuClick(item)}
                  className={`border-b px-0 py-2 text-[11px] font-medium font-sans transition hover:opacity-85 sm:text-xs md:text-[13px] ${
                    openMainMenu === item
                      ? "border-white"
                      : "border-transparent"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            {rightMenuItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleMainMenuClick(item)}
                className={`flex items-center gap-1 border-b px-0 py-2 text-[11px] font-medium font-sans transition hover:opacity-85 sm:text-xs md:text-[13px] ${
                  openMainMenu === item
                    ? "border-white"
                    : "border-transparent"
                }`}
              >
                <span>{item}</span>
                {openMainMenu === item ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            ))}

            <Link
              to="/company-ai-chat"
              className="border-b border-transparent px-0 py-2 text-[11px] font-medium font-sans transition hover:opacity-85 sm:text-xs md:text-[13px]"
            >
              AI Chat
            </Link>
          </div>
        </div>
      </div>

      {showStructuredPanel && (
        <div className="absolute left-0 top-[84px] z-[999] w-full pointer-events-auto">
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="min-h-screen bg-white py-0 md:col-span-4 lg:col-span-3">
              {activeCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryClick(category)}
                  className={`flex w-full items-center px-6 py-2 text-left text-[12px] font-sans transition md:text-[13px] ${
                    openCategory === category
                      ? "bg-blue-50 text-slate-900"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <span>{category}</span>

                  {openCategory === category ? (
                    <ChevronDown
                      size={13}
                      className="ml-auto mr-1 text-slate-500"
                    />
                  ) : (
                    <ChevronRight
                      size={13}
                      className="ml-auto mr-1 text-slate-500"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="min-h-screen py-0 md:col-span-8 lg:col-span-9">
              {openCategory && activeSubFields.length > 0 ? (
                <div className="min-h-screen w-[260px] bg-light-blue px-5 py-2 sm:w-[300px] md:w-[340px]">
                  {activeSubFields.map((field) => {
                    const favouriteActive = isFavourite(field);
                    const fieldRoute = fieldRouteMap[field] || "#";

                    return (
                      <div
                        key={field}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-[12px] font-sans text-slate-700 transition hover:text-slate-900 md:text-[13px]"
                      >
                        <Link
                          to={fieldRoute}
                          onClick={() => {
                            setOpenMainMenu("");
                            setOpenCategory("");
                          }}
                          className="flex-1"
                        >
                          {field}
                        </Link>

                        <button
                          type="button"
                          onClick={() => toggleFavourite(field)}
                          className="ml-3 rounded-sm p-1 transition hover:bg-white/60"
                          aria-label={
                            favouriteActive
                              ? `Remove ${field} from favourites`
                              : `Add ${field} to favourites`
                          }
                        >
                          <Heart
                            size={14}
                            className={`transition ${
                              favouriteActive
                                ? "fill-red-500 text-red-500"
                                : "text-slate-500 hover:text-red-400"
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {showSimplePanel && (
        <div className="absolute right-0 top-[84px] z-[999] w-full pointer-events-auto sm:w-[280px]">
          <div className="rounded-b-md border border-slate-200 bg-white shadow-md">
            <div className="border-b border-slate-200 px-4 py-3 text-[13px] font-semibold text-slate-800">
              {openMainMenu}
            </div>

            <div className="py-1">
              {(simpleMenuLinks[openMainMenu] || []).map((item) => {
                if (item.action) {
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSimpleMenuAction(item.action)}
                      className="block w-full px-4 py-2 text-left text-[12px] text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      {item.label}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => {
                      setOpenMainMenu("");
                      setOpenCategory("");
                    }}
                    className="block px-4 py-2 text-[12px] text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyNavbar;