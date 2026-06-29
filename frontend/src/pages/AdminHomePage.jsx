import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  UserPlus,
  Search,
  Repeat,
  Smartphone,
  Ship,
  Anchor,
  FileText,
  Clock3,
  Download,
  Globe2,
} from "lucide-react";
import PropTypes from "prop-types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const countryOptions = [
  { label: "All Countries", value: "" },
  { label: "South Africa", value: "ZA" },
  { label: "Namibia", value: "NA" },
  { label: "Mozambique", value: "MZ" },
  { label: "Tanzania", value: "TZ" },
  { label: "Angola", value: "AO" },
];

const formatReadTime = (seconds) => {
  if (!seconds) return "0 min";
  const mins = Math.round(seconds / 60);
  return `${mins} min`;
};

const StatCard = ({ title, value, icon: Icon, subtitle }) => (
  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <h3 className="mt-1 text-xl font-semibold text-slate-900">{value}</h3>
        {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="rounded-lg border border-slate-200 p-2">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
    </div>
  </div>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  subtitle: PropTypes.string,
};

StatCard.defaultProps = {
  subtitle: "",
};

const SectionHeader = ({ title, description }) => (
  <div className="mb-4">
    <h2 className="text-base font-semibold text-slate-900">{title}</h2>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
  </div>
);

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

const normalizeDashboard = (raw) => {
  const users = raw?.users || {};
  const terminalBerthing = raw?.terminalBerthing || {};
  const caseStudies = raw?.caseStudies || {};

  const deviceSplit = {
    desktop: Number(users?.deviceSplit?.desktop || 0),
    mobile: Number(users?.deviceSplit?.mobile || 0),
    tablet: Number(users?.deviceSplit?.tablet || 0),
    unknown: Number(users?.deviceSplit?.unknown || 0),
  };

  const pageUsageSource = Array.isArray(users?.pageUsage) ? users.pageUsage : [];
  const pageUsageDefaults = [
    { name: "Volumetric Weight", value: 0 },
    { name: "Case Studies", value: 0 },
    { name: "Terminal Berthing", value: 0 },
  ];

  const pageUsage =
    pageUsageSource.length > 0
      ? pageUsageSource.map((item) => ({
          name: item?.name || "Unknown",
          value: Number(item?.value || 0),
        }))
      : pageUsageDefaults;

  const vesselsPerTerminalSource = Array.isArray(
    terminalBerthing?.vesselsPerTerminal
  )
    ? terminalBerthing.vesselsPerTerminal
    : [];

  const vesselsPerTerminal = vesselsPerTerminalSource.map((item) => ({
    terminalName: item?.terminalName || "Unknown",
    vessels: Number(item?.vessels || 0),
  }));

  const topViewedCaseStudiesSource = Array.isArray(
    caseStudies?.topViewedCaseStudies
  )
    ? caseStudies.topViewedCaseStudies
    : [];

  const topViewedCaseStudies = topViewedCaseStudiesSource.map((study) => ({
    _id: study?._id,
    title: study?.title || "Untitled Case Study",
    slug: study?.slug || "",
    views: Number(study?.views || 0),
  }));

  return {
    users: {
      totalRegisteredUsers: Number(users?.totalRegisteredUsers || 0),
      usersRegisteredThisWeek: Number(users?.usersRegisteredThisWeek || 0),
      siteVisitsThisWeek: Number(users?.siteVisitsThisWeek || 0),
      searchesThisWeek: Number(users?.searchesThisWeek || 0),
      returningUsers: Number(users?.returningUsers || 0),
      deviceSplit,
      pageUsage,
    },
    terminalBerthing: {
      totalRegisteredVessels: Number(
        terminalBerthing?.totalRegisteredVessels || 0
      ),
      mostSearchedPort: terminalBerthing?.mostSearchedPort || "—",
      vesselsAddedThisWeek: Number(terminalBerthing?.vesselsAddedThisWeek || 0),
      vesselsPerTerminal,
    },
    caseStudies: {
      totalCaseStudies: Number(caseStudies?.totalCaseStudies || 0),
      viewsThisWeek: Number(caseStudies?.viewsThisWeek || 0),
      averageReadTimeSeconds: Number(
        caseStudies?.averageReadTimeSeconds || 0
      ),
      topViewedCaseStudies,
    },
  };
};

const AdminHomePage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState("");
  const dashboardRef = useRef(null);

  const fetchDashboard = async (selectedCountry = "") => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE_URL}/api/admin/analytics/dashboard`,
        {
          params: { country: selectedCountry },
          withCredentials: true,
        }
      );

      const normalized = normalizeDashboard(response.data);
      setDashboard(normalized);
      setLastRefreshed(new Date().toLocaleString("en-GB"));
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
      setError("Failed to load admin dashboard analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(country);
  }, [country]);

  const handleDownloadPDF = async () => {
    if (!dashboardRef.current) return;

    const canvas = await html2canvas(dashboardRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#f8fafc",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const imgWidth = pdfWidth - 10;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 5;

    pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 10;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 5;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 10;
    }

    pdf.save(
      `cargo-konect-admin-dashboard-${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  const users = dashboard?.users || {};
  const terminalBerthing = dashboard?.terminalBerthing || {};
  const caseStudies = dashboard?.caseStudies || {};

  const deviceSplit = useMemo(
    () =>
      users?.deviceSplit || {
        desktop: 0,
        mobile: 0,
        tablet: 0,
        unknown: 0,
      },
    [users]
  );

  const pageUsage = useMemo(
    () => (Array.isArray(users?.pageUsage) ? users.pageUsage : []),
    [users]
  );

  const vesselsPerTerminal = useMemo(
    () =>
      Array.isArray(terminalBerthing?.vesselsPerTerminal)
        ? terminalBerthing.vesselsPerTerminal
        : [],
    [terminalBerthing]
  );

  const topViewedCaseStudies = useMemo(
    () =>
      Array.isArray(caseStudies?.topViewedCaseStudies)
        ? caseStudies.topViewedCaseStudies
        : [],
    [caseStudies]
  );

  const deviceData = useMemo(
    () => [
      { name: "Desktop", value: deviceSplit.desktop },
      { name: "Mobile", value: deviceSplit.mobile },
      { name: "Tablet", value: deviceSplit.tablet },
      { name: "Unknown", value: deviceSplit.unknown },
    ],
    [deviceSplit]
  );

  const totalDeviceEvents = useMemo(
    () =>
      deviceSplit.desktop +
      deviceSplit.mobile +
      deviceSplit.tablet +
      deviceSplit.unknown,
    [deviceSplit]
  );

  const pieColors = ["#0f3d5e", "#7da892", "#94a3b8", "#cbd5e1"];

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
          {error || "Something went wrong."}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Admin Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Cargo Konect Intelligence Hub
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Live platform analytics for users, terminal berthing, and case studies.
            </p>
            {lastRefreshed ? (
              <p className="mt-1 text-xs text-slate-400">
                Last refreshed: {lastRefreshed}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
            >
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <div ref={dashboardRef} className="space-y-4 bg-slate-50">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <SectionHeader
            title="1. Users"
            description="Live user growth, traffic, search behaviour and page usage."
          />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Total Registered Users"
              value={users.totalRegisteredUsers}
              icon={Users}
            />
            <StatCard
              title="Users Registered This Week"
              value={users.usersRegisteredThisWeek}
              icon={UserPlus}
            />
            <StatCard
              title="Site Visits This Week"
              value={users.siteVisitsThisWeek}
              icon={Globe2}
            />
            <StatCard
              title="Searches This Week"
              value={users.searchesThisWeek}
              icon={Search}
            />
            <StatCard
              title="Returning Users"
              value={users.returningUsers}
              icon={Repeat}
            />
            <StatCard
              title="Device Events"
              value={totalDeviceEvents}
              icon={Smartphone}
              subtitle="Combined tracked device activity"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Page Usage by Users
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Weekly interaction split across your core tools.
              </p>

              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pageUsage}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#0f3d5e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">Device Split</h3>
              <p className="mt-1 text-xs text-slate-500">
                Distribution of tracked user sessions this week.
              </p>

              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={72}
                      paddingAngle={3}
                    >
                      {deviceData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={pieColors[index % pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 space-y-2">
                {deviceData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-600">{item.name}</span>
                    <span className="font-medium text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <SectionHeader
            title="2. Terminal Berthing"
            description="Monitor vessel activity, search demand and terminal-level distribution."
          />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <StatCard
              title="Total Registered Vessels"
              value={terminalBerthing.totalRegisteredVessels}
              icon={Ship}
            />
            <StatCard
              title="Most Searched Port"
              value={terminalBerthing.mostSearchedPort}
              icon={Search}
            />
            <StatCard
              title="Vessels Added This Week"
              value={terminalBerthing.vesselsAddedThisWeek}
              icon={Anchor}
            />
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Vessels per Terminal
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Flexible by country. The chart adapts to the terminals available in
                  the selected country.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Current filter: {country || "All Countries"}
              </div>
            </div>

            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vesselsPerTerminal}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="terminalName"
                    tick={{ fontSize: 12 }}
                    angle={-12}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="vessels" radius={[8, 8, 0, 0]} fill="#7da892" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <SectionHeader
            title="3. Case Study Analytics"
            description="Track content volume, weekly views and reading performance."
          />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="No. of Case Studies"
              value={caseStudies.totalCaseStudies}
              icon={FileText}
            />
            <StatCard
              title="Views This Week"
              value={caseStudies.viewsThisWeek}
              icon={Globe2}
            />
            <StatCard
              title="Average Read Time"
              value={formatReadTime(caseStudies.averageReadTimeSeconds)}
              icon={Clock3}
            />
            <StatCard
              title="Top Ranked Entries"
              value={topViewedCaseStudies.length}
              icon={FileText}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Top 3 Viewed Case Studies
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Highest performing case studies by total views.
              </p>

              <div className="mt-4 space-y-3">
                {topViewedCaseStudies.length > 0 ? (
                  topViewedCaseStudies.map((study, index) => (
                    <div
                      key={study._id || study.slug || index}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-xs font-semibold text-slate-700">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {study.title}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            /{study.slug}
                          </p>
                        </div>
                      </div>
                      <div className="pl-3 text-right">
                        <p className="text-xs text-slate-500">Views</p>
                        <p className="text-base font-semibold text-slate-900">
                          {study.views}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                    No case study view data yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Content Summary
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Quick overview of current case study performance.
              </p>

              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Total Case Studies</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {caseStudies.totalCaseStudies}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Weekly Views</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {caseStudies.viewsThisWeek}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Average Read Time</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {formatReadTime(caseStudies.averageReadTimeSeconds)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminHomePage;