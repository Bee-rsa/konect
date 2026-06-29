import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import CompanyNavbar from "../../components/Company/Common/CompanyNavbar";

const recentActivity = [
  { time: "09:14", action: "Opened", path: "Operations / Forwarding / Shipments" },
  { time: "09:32", action: "Viewed", path: "Rates / Rate Management / Create Rate" },
  { time: "10:05", action: "Checked", path: "Management / Documents / POD" },
  { time: "10:41", action: "Opened", path: "Intelligence / Analytics / Revenue Overview" },
  { time: "11:08", action: "Visited", path: "Operations / Fleet Management / Fleet Overview" },
];

const inHouseMessages = [
  {
    from: "Ops Desk",
    subject: "Driver allocation check",
    preview: "Please confirm vehicle assignment for the afternoon Durban route.",
    time: "08:55",
  },
  {
    from: "Admin",
    subject: "Rate review reminder",
    preview: "Monthly pricing review closes at 16:00 today.",
    time: "09:20",
  },
  {
    from: "Cargo Konect Team",
    subject: "New dashboard widgets",
    preview: "A new updates panel is now available on the company home page.",
    time: "10:10",
  },
];

const cargoKonectUpdates = [
  { title: "Terminal berthing analytics improved", date: "14 Apr 2026", extra: "System update" },
  { title: "Company dashboard layout refreshed", date: "16 Apr 2026", extra: "UI update" },
  { title: "Rate setup workflow optimized", date: "18 Apr 2026", extra: "Operations update" },
  { title: "New company dashboard widgets released", date: "20 Apr 2026", extra: "Dashboard update" },
  { title: "Improved case study indexing and performance", date: "22 Apr 2026", extra: "Platform update" },
  { title: "Faster notifications rendering", date: "24 Apr 2026", extra: "System update" },
];

const saPublicHolidays2026 = [
  { title: "New Year’s Day", date: "01 Jan 2026", extra: "National holiday" },
  { title: "Human Rights Day", date: "21 Mar 2026", extra: "National holiday" },
  { title: "Good Friday", date: "03 Apr 2026", extra: "National holiday" },
  { title: "Family Day", date: "06 Apr 2026", extra: "National holiday" },
  { title: "Freedom Day", date: "27 Apr 2026", extra: "National holiday" },
  { title: "Workers’ Day", date: "01 May 2026", extra: "National holiday" },
  { title: "Youth Day", date: "16 Jun 2026", extra: "National holiday" },
  { title: "National Women’s Day", date: "09 Aug 2026", extra: "Falls on Sunday" },
  { title: "Public Holiday", date: "10 Aug 2026", extra: "Observed holiday" },
  { title: "Heritage Day", date: "24 Sep 2026", extra: "National holiday" },
  { title: "Day of Reconciliation", date: "16 Dec 2026", extra: "National holiday" },
  { title: "Christmas Day", date: "25 Dec 2026", extra: "National holiday" },
  { title: "Day of Goodwill", date: "26 Dec 2026", extra: "National holiday" },
];

const cardClass =
  "rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden";
const fillCardClass =
  "h-full rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-0";
const headerClass =
  "border-b border-slate-200 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700";

const CompanyHomePage = () => {
  const [activeFeedTab, setActiveFeedTab] = useState("All");
  const [caseStudies, setCaseStudies] = useState([]);
  const [caseStudiesLoading, setCaseStudiesLoading] = useState(false);
  const [favouriteLinks, setFavouriteLinks] = useState([]);

  const [sessionUser, setSessionUser] = useState({});

  useEffect(() => {
    const getCurrentSessionUser = () => {
      try {
        const companyUserInfo = JSON.parse(localStorage.getItem("companyUserInfo") || "null");
        const companyUser = JSON.parse(localStorage.getItem("companyUser") || "null");
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

        // Prefer the currently logged in company user object first
        const activeUser = companyUserInfo || companyUser || userInfo || {};

        // Helpful debug while testing
        console.log("Bottom bar active user:", activeUser);

        setSessionUser(activeUser);
      } catch (error) {
        console.error("Failed to read session user:", error);
        setSessionUser({});
      }
    };

    getCurrentSessionUser();

    window.addEventListener("storage", getCurrentSessionUser);
    return () => window.removeEventListener("storage", getCurrentSessionUser);
  }, []);

  useEffect(() => {
    const fetchCaseStudies = async () => {
      try {
        setCaseStudiesLoading(true);

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/case-studies`,
          {
            params: {
              published: true,
              sortBy: "newest",
              limit: 4,
            },
          }
        );

        const studies = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.caseStudies || [];

        setCaseStudies(studies.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch case studies:", error);
        setCaseStudies([]);
      } finally {
        setCaseStudiesLoading(false);
      }
    };

    fetchCaseStudies();
  }, []);

  useEffect(() => {
    const loadFavourites = () => {
      try {
        const stored = localStorage.getItem("companyFavourites");
        const parsed = stored ? JSON.parse(stored) : [];
        setFavouriteLinks(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error("Failed to load company favourites:", error);
        setFavouriteLinks([]);
      }
    };

    loadFavourites();

    const handleStorage = (event) => {
      if (event.key === "companyFavourites") {
        loadFavourites();
      }
    };

    window.addEventListener("storage", handleStorage);

    const interval = setInterval(loadFavourites, 500);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  const feedItems = useMemo(() => {
    if (activeFeedTab === "Updates") return cargoKonectUpdates;
    if (activeFeedTab === "Public Holidays") return saPublicHolidays2026;

    return [
      ...cargoKonectUpdates.map((item) => ({ ...item, type: "Update" })),
      ...saPublicHolidays2026.slice(0, 8).map((item) => ({ ...item, type: "Holiday" })),
    ];
  }, [activeFeedTab]);

  const fullName =
    `${sessionUser?.firstName || ""} ${sessionUser?.lastName || ""}`.trim() ||
    sessionUser?.name ||
    "User Name";

  const companyName =
    sessionUser?.company?.companyName ||
    sessionUser?.companyName ||
    "Company";

  const branchName =
    sessionUser?.branch?.branchName ||
    sessionUser?.branchName ||
    "Branch";

  const department =
    sessionUser?.department ||
    "Department";

  const country =
    sessionUser?.branch?.country ||
    sessionUser?.company?.country ||
    sessionUser?.country ||
    "Country";

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-200">
      <CompanyNavbar />

      <div className="flex-1 overflow-hidden p-3">
        <div className="grid h-full grid-cols-12 gap-3">
          <div className="col-span-3 grid h-full grid-rows-[auto_1fr] gap-3 min-h-0">
            <section className={cardClass}>
              <div className={headerClass}>Favourites</div>
              <div className="p-3 space-y-2">
                {favouriteLinks.length === 0 ? (
                  <div className="text-[10px] text-slate-500">No favourites.</div>
                ) : (
                  favouriteLinks.map((link, index) => (
                    <button
                      key={`${link.section}-${link.category}-${link.item}-${index}`}
                      type="button"
                      className="block w-full rounded-sm border border-slate-200 px-3 py-2 text-left text-[11px] text-slate-700 transition hover:bg-slate-50"
                    >
                      <div className="font-medium text-[11px] text-slate-900">
                        {link.item}
                      </div>
                      <div className="mt-1 text-[10px] text-slate-500">
                        {link.section} / {link.category}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>

            <section className={fillCardClass}>
              <div className={headerClass}>Quick overview</div>
              <div className="flex flex-1 items-center justify-center p-3 min-h-0">
                <div className="text-[10px] text-slate-500">
                  No additional widgets yet.
                </div>
              </div>
            </section>
          </div>

          <section className={`${fillCardClass} col-span-3`}>
            <div className={headerClass}>Recent activity</div>
            <div className="flex-1 p-3 space-y-2 min-h-0 overflow-hidden">
              {recentActivity.map((item, index) => (
                <div
                  key={`${item.time}-${index}`}
                  className="rounded-sm border border-slate-200 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-slate-900">{item.action}</span>
                    <span className="text-[10px] text-slate-500">{item.time}</span>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-600">{item.path}</div>
                </div>
              ))}
            </div>
          </section>

          <section className={`${fillCardClass} col-span-3`}>
            <div className={headerClass}>In-house messages</div>
            <div className="flex-1 p-3 space-y-2 min-h-0 overflow-hidden">
              {inHouseMessages.map((message, index) => (
                <div
                  key={`${message.subject}-${index}`}
                  className="rounded-sm border border-slate-200 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-slate-900">{message.from}</span>
                    <span className="text-[10px] text-slate-500">{message.time}</span>
                  </div>
                  <div className="mt-1 text-[11px] font-medium text-slate-800">
                    {message.subject}
                  </div>
                  <div className="mt-1 text-[10px] text-slate-600">{message.preview}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="col-span-3 grid h-full grid-rows-[auto_1fr] gap-3 min-h-0">
            <section className={cardClass}>
              <div className={headerClass}>Recent case studies</div>
              <div className="p-3 space-y-2">
                {caseStudiesLoading ? (
                  <div className="text-[10px] text-slate-500">Loading case studies...</div>
                ) : caseStudies.length === 0 ? (
                  <div className="text-[10px] text-slate-500">No case studies available.</div>
                ) : (
                  caseStudies.slice(0, 3).map((study) => (
                    <Link
                      key={study._id || study.slug || study.title}
                      to={`/case-studies/${study.slug}`}
                      className="block w-full rounded-sm border border-slate-200 px-3 py-2 text-left transition hover:bg-slate-50"
                    >
                      <div className="text-[11px] font-medium text-slate-900">
                        {study.title}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{study.category || "Case Study"}</span>
                        <span>{study.date || "Read"}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            <section className={fillCardClass}>
              <div className={headerClass}>Updates</div>

              <div className="border-b border-slate-200 px-3 py-2">
                <div className="grid grid-cols-3 gap-2">
                  {["All", "Updates", "Public Holidays"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveFeedTab(tab)}
                      className={`rounded-sm border px-2 py-2 text-[10px] font-medium transition ${
                        activeFeedTab === tab
                          ? "border-custom-blue bg-blue-50 text-custom-blue"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {tab === "Public Holidays" ? "Public Holidays" : tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-3 min-h-0 overflow-y-auto">
                {activeFeedTab === "Public Holidays" && (
                  <div className="mb-2 flex items-center gap-2 text-[10px] text-slate-600">
                    <span className="text-sm">🇿🇦</span>
                    <span>ZA</span>
                  </div>
                )}

                <div className="space-y-2 pr-1">
                  {feedItems.map((item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      className="rounded-sm border border-slate-200 px-3 py-2"
                    >
                      <div className="text-[11px] font-medium text-slate-900">{item.title}</div>
                      <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-slate-500">
                        <span>{item.date}</span>
                        <span>{item.extra}</span>
                      </div>
                      {"type" in item && (
                        <div className="mt-1 text-[9px] uppercase tracking-[0.08em] text-slate-400">
                          {item.type}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="h-[36px] bg-slate-600 px-4 text-white flex items-center">
        <div className="flex items-center gap-2 text-[11px] whitespace-nowrap overflow-x-auto">
          <span className="font-medium text-white">{fullName}</span>
          <span className="text-slate-300">|</span>
          <span className="text-white">{companyName}</span>
          <span className="text-slate-300">|</span>
          <span className="text-white">{branchName}</span>
          <span className="text-slate-300">|</span>
          <span className="text-white">{department}</span>
          <span className="text-slate-300">|</span>
          <span className="text-white">{country}</span>
        </div>
      </div>
    </div>
  );
};

export default CompanyHomePage;