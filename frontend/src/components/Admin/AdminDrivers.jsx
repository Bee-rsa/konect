import { useEffect, useState } from "react";
import { FiSearch, FiCheck, FiEye, FiAlertCircle, FiStar } from "react-icons/fi";
import { FaCar } from "react-icons/fa";
import PropTypes from "prop-types";

const BASE = import.meta.env.VITE_BACKEND_URL;

const STATUS_FILTERS = ["all", "pending", "offline", "online", "on_trip", "suspended"];

const STATUS_STYLES = {
  pending:   { bg: "#FFF7ED", color: "#C2410C" },
  offline:   { bg: "#F8FAFC", color: "#94a3b8" },
  online:    { bg: "#F0FDF4", color: "#2E7D32" },
  on_trip:   { bg: "#EFF6FF", color: "#1565C0" },
  suspended: { bg: "#FEF2F2", color: "#DC2626" },
  approved:  { bg: "#F0FDF4", color: "#2E7D32" },
};

const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("userToken")}`,
});

// eslint-disable-next-line react/prop-types
const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.offline;
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
    {status?.replace("_", " ")}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string,
};

const AdminDrivers = () => {
  const [drivers,       setDrivers]       = useState([]);
  const [stats,         setStats]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("all");
  const [page,          setPage]          = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [total,         setTotal]         = useState(0);
  const [selected,      setSelected]      = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [showSuspend,   setShowSuspend]   = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchDrivers(); }, [statusFilter, page, search]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 15,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(search && { search }),
      });
      const res = await fetch(`${BASE}/api/admin/drivers?${params}`, { headers: authHeader() });
      const data = await res.json();
      setDrivers(data.drivers || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${BASE}/api/admin/drivers/stats/summary`, { headers: authHeader() });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDriverDetail = async (id) => {
    try {
      setDetailLoading(true);
      const res = await fetch(`${BASE}/api/admin/drivers/${id}`, { headers: authHeader() });
      const data = await res.json();
      setSelected(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await fetch(`${BASE}/api/admin/drivers/${id}/approve`, { method: "PATCH", headers: authHeader() });
      fetchDrivers();
      fetchStats();
      if (selected?.driver?._id === id) fetchDriverDetail(id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async (id) => {
    try {
      setActionLoading(true);
      await fetch(`${BASE}/api/admin/drivers/${id}/suspend`, {
        method: "PATCH",
        headers: authHeader(),
        body: JSON.stringify({ reason: suspendReason }),
      });
      setShowSuspend(false);
      setSuspendReason("");
      fetchDrivers();
      fetchStats();
      if (selected?.driver?._id === id) fetchDriverDetail(id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async (id) => {
    try {
      setActionLoading(true);
      await fetch(`${BASE}/api/admin/drivers/${id}/reactivate`, { method: "PATCH", headers: authHeader() });
      fetchDrivers();
      fetchStats();
      if (selected?.driver?._id === id) fetchDriverDetail(id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this driver? This cannot be undone.")) return;
    try {
      await fetch(`${BASE}/api/admin/drivers/${id}`, { method: "DELETE", headers: authHeader() });
      setSelected(null);
      fetchDrivers();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const INFO_ROWS = selected ? [
    { label: "Full name", value: `${selected.driver?.firstName} ${selected.driver?.lastName}` },
    { label: "Phone",     value: selected.driver?.phone },
    { label: "ID number", value: selected.driver?.idNumber },
    { label: "Gender",    value: selected.driver?.gender?.replace(/_/g, " ") || "—" },
    { label: "Joined",    value: new Date(selected.driver?.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) },
  ] : [];

  const VEHICLE_ROWS = selected?.driver?.vehicle?.make ? [
    { label: "Vehicle",  value: `${selected.driver.vehicle.year} ${selected.driver.vehicle.make} ${selected.driver.vehicle.model}` },
    { label: "Color",    value: selected.driver.vehicle.color },
    { label: "Plate",    value: selected.driver.vehicle.plate },
    { label: "Type",     value: selected.driver.vehicle.type },
    { label: "Capacity", value: `${selected.driver.vehicle.capacity} seats` },
    { label: "VIN",      value: selected.driver.vehicle.vin || "—" },
  ] : [];

  const DOC_KEYS = [
    { label: "SA ID / Passport",       key: "idDocument" },
    { label: "Driver's license",       key: "license" },
    { label: "Vehicle registration",   key: "registration" },
    { label: "Roadworthy certificate", key: "roadworthy" },
    { label: "Vehicle insurance",      key: "insurance" },
    { label: "Profile photo",          key: "profilePhoto" },
  ];

  return (
    <div className="min-h-screen font-poppins" style={{ backgroundColor: "#f5f5f4" }}>

      {/* PAGE HEADER */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center gap-2 mb-1">
          <FaCar className="text-custom-blue" size={18} />
          <h1 className="text-xl font-bold text-slate-900">Driver Management</h1>
        </div>
        <p className="text-sm text-slate-500">
          Approve applications, verify documents and manage driver accounts
        </p>
      </div>

      <div className="px-8 py-6 space-y-6">

        {/* STATS */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: "Total drivers",   value: stats.drivers?.total,   color: "#000042", bg: "#F0F0F8" },
              { label: "Pending",         value: stats.drivers?.pending, color: "#C2410C", bg: "#FFF7ED" },
              { label: "Active",          value: stats.drivers?.active,  color: "#2E7D32", bg: "#F0FDF4" },
              { label: "Online now",      value: stats.drivers?.online,  color: "#1565C0", bg: "#EFF6FF" },
              { label: "Total rides",     value: stats.rides?.total,     color: "#000042", bg: "#F8FAFC" },
              { label: "Completed rides", value: stats.rides?.completed, color: "#2E7D32", bg: "#F0FDF4" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4">
                <p className="text-2xl font-bold mb-1" style={{ color }}>{value ?? "—"}</p>
                <p className="text-[11px] text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* FILTERS */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, email, phone or plate..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-custom-blue transition"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition capitalize ${
                  statusFilter === s
                    ? "text-white border-transparent"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
                style={statusFilter === s ? { backgroundColor: "#000042" } : {}}
              >
                {s === "all" ? "All" : s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_120px] gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50">
            {["Driver", "Vehicle", "Rating", "Trips", "Status", "Actions"].map((h) => (
              <p key={h} className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</p>
            ))}
          </div>

          {loading ? (
            <div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_120px] gap-4 px-5 py-4 border-b border-slate-50 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-1/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : drivers.length === 0 ? (
            <div className="py-16 text-center">
              <FaCar size={32} className="mx-auto mb-3 text-slate-200" />
              <p className="text-sm font-semibold text-slate-500">No drivers found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters.</p>
            </div>
          ) : (
            drivers.map((driver) => (
              <div
                key={driver._id}
                className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_120px] gap-4 px-5 py-4 border-b border-slate-50 hover:bg-slate-50/50 transition items-center"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: "#000042" }}
                  >
                    {driver.firstName?.charAt(0)}{driver.lastName?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {driver.firstName} {driver.lastName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{driver.email}</p>
                  </div>
                </div>

                <div className="min-w-0">
                  {driver.vehicle?.make ? (
                    <div>
                      <p className="text-sm text-slate-700 truncate">
                        {driver.vehicle.year} {driver.vehicle.make} {driver.vehicle.model}
                      </p>
                      <p className="text-[11px] text-slate-400">{driver.vehicle.plate}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300">No vehicle</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <FiStar size={12} className="text-amber-400" />
                  <span className="text-sm text-slate-700">
                    {driver.rating?.average?.toFixed(1) || "—"}
                  </span>
                </div>

                <p className="text-sm text-slate-700">{driver.stats?.totalTrips || 0}</p>

                <StatusBadge status={driver.status} />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchDriverDetail(driver._id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  >
                    <FiEye size={11} /> View
                  </button>
                  {driver.status === "pending" && (
                    <button
                      onClick={() => handleApprove(driver._id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition hover:opacity-90"
                      style={{ backgroundColor: "#2E7D32" }}
                    >
                      <FiCheck size={11} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
              <p className="text-xs text-slate-400">{total} total drivers</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-xs text-slate-500">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DRIVER DETAIL MODAL */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => { setSelected(null); setShowSuspend(false); }}
          />

          <div className="relative h-full w-full max-w-xl bg-white shadow-2xl overflow-y-auto flex flex-col">

            <div
              className="px-6 py-5 flex items-center justify-between flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #000042 0%, #1a3a7a 100%)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                  {selected.driver?.firstName?.charAt(0)}{selected.driver?.lastName?.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">
                    {selected.driver?.firstName} {selected.driver?.lastName}
                  </p>
                  <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {selected.driver?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setSelected(null); setShowSuspend(false); }}
                className="text-white/60 hover:text-white transition text-xl font-bold"
              >
                x
              </button>
            </div>

            {detailLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-custom-blue rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex-1 px-6 py-6 space-y-6">

                <div className="flex items-center justify-between">
                  <StatusBadge status={selected.driver?.status} />
                  <div className="flex gap-2">
                    {selected.driver?.status === "pending" && (
                      <button
                        onClick={() => handleApprove(selected.driver._id)}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                        style={{ backgroundColor: "#2E7D32" }}
                      >
                        <FiCheck size={12} /> Approve
                      </button>
                    )}
                    {selected.driver?.status === "suspended" ? (
                      <button
                        onClick={() => handleReactivate(selected.driver._id)}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                        style={{ backgroundColor: "#1565C0" }}
                      >
                        <FiCheck size={12} /> Reactivate
                      </button>
                    ) : selected.driver?.status !== "pending" && (
                      <button
                        onClick={() => setShowSuspend((p) => !p)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 transition"
                      >
                        <FiAlertCircle size={12} /> Suspend
                      </button>
                    )}
                  </div>
                </div>

                {showSuspend && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
                    <p className="text-xs font-bold text-red-700">Suspension reason</p>
                    <textarea
                      value={suspendReason}
                      onChange={(e) => setSuspendReason(e.target.value)}
                      placeholder="Provide a reason for suspension..."
                      className="w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm outline-none resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowSuspend(false)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSuspend(selected.driver._id)}
                        disabled={actionLoading || !suspendReason.trim()}
                        className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-60"
                      >
                        Confirm suspension
                      </button>
                    </div>
                  </div>
                )}

                <section>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                    Personal information
                  </p>
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                    {INFO_ROWS.map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                        <p className="text-xs text-slate-400">{label}</p>
                        <p className="text-sm font-medium text-slate-700 capitalize">{value || "—"}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                    Vehicle
                  </p>
                  {VEHICLE_ROWS.length > 0 ? (
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                      {VEHICLE_ROWS.map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                          <p className="text-xs text-slate-400">{label}</p>
                          <p className="text-sm font-medium text-slate-700">{value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No vehicle on file.</p>
                  )}
                </section>

                <section>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                    Documents
                  </p>
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                    {DOC_KEYS.map(({ label, key }) => {
                      const doc = selected.driver?.documents?.[key];
                      return (
                        <div key={key} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                          <p className="text-xs text-slate-400">{label}</p>
                          <p className="text-xs font-bold" style={{ color: doc?.verified ? "#2E7D32" : doc?.url ? "#C2410C" : "#94a3b8" }}>
                            {doc?.verified ? "Verified" : doc?.url ? "Uploaded - pending review" : "Not uploaded"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                    Earnings and performance
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Total earned", value: `R${selected.driver?.earnings?.total?.toFixed(2) || "0.00"}`, color: "#2E7D32", bg: "#F0FDF4" },
                      { label: "Total trips",  value: selected.totalTrips || 0,                                     color: "#000042", bg: "#F0F0F8" },
                      { label: "Rating",       value: `${selected.driver?.rating?.average?.toFixed(1) || "—"} star`, color: "#C2410C", bg: "#FFF7ED" },
                      { label: "Total km",     value: `${selected.driver?.stats?.totalKm?.toFixed(0) || 0} km`,     color: "#1565C0", bg: "#EFF6FF" },
                    ].map(({ label, value, color, bg }) => (
                      <div key={label} className="rounded-xl p-4" style={{ backgroundColor: bg }}>
                        <p className="text-xl font-bold mb-0.5" style={{ color }}>{value}</p>
                        <p className="text-[11px] text-slate-400">{label}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {selected.recentTrips?.length > 0 && (
                  <section>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                      Recent trips
                    </p>
                    <div className="space-y-2">
                      {selected.recentTrips.map((trip) => (
                        <div key={trip._id} className="bg-slate-50 rounded-xl p-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-700 truncate">
                              {trip.pickup?.address || "—"} to {trip.dropoff?.address || "—"}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {trip.distanceKm?.toFixed(1)} km · {trip.serviceType}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold" style={{ color: "#000042" }}>
                              R{trip.fare?.total?.toFixed(2) || "—"}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(trip.timeline?.completed).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-3">
                    Danger zone
                  </p>
                  <button
                    onClick={() => handleDelete(selected.driver._id)}
                    className="w-full py-2.5 rounded-xl text-sm font-bold border border-red-200 text-red-600 hover:bg-red-50 transition"
                  >
                    Permanently delete driver
                  </button>
                </section>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDrivers;