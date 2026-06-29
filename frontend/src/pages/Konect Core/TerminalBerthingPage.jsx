import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaChevronDown, FaBell } from "react-icons/fa";
import axios from "axios";
import { fetchTerminalBerthings } from "../../api/berthingApi";
import { SADC_COUNTRIES, SADC_PORTS } from "../../constants/sadcPorts";
import PropTypes from "prop-types";
import CompanyTopBar from "../../components/Company/Common/CompanyTopBar";

const TERMINALS_BY_PORT = {
  ZADUR: ["Pier 1", "Pier 2", "Maydon Wharf", "Durban Container Terminal"],
  ZACPT: ["Cape Town Container Terminal", "Multi-Purpose Terminal"],
  ZAZBA: ["Ngqura Container Terminal"],
  ZAPLZ: ["Port Elizabeth Container Terminal"],
  ZARCB: ["Richards Bay Terminal"],
  MZMPM: ["Maputo Terminal", "Maputo Container Yard"],
  MZBEW: ["Beira Terminal"],
  MZMNC: ["Nacala Terminal"],
  NAWVB: ["Walvis Bay Container Terminal"],
  NALUD: ["Luderitz Terminal"],
  TZDAR: ["Dar es Salaam Container Terminal"],
  TZTGT: ["Tanga Terminal"],
  TZMYW: ["Mtwara Terminal"],
  AOLAD: ["Luanda Terminal"],
  AOLOB: ["Lobito Terminal"],
  MGTNR: ["Toamasina Terminal"],
  MUPLU: ["Port Louis Terminal"],
  CDMAT: ["Matadi Terminal"],
  ZMMPB: ["Mpulungu Terminal"],
};

const COUNTRY_FLAGS = {
  "South Africa": "https://flagcdn.com/w40/za.png",
  Mozambique: "https://flagcdn.com/w40/mz.png",
  Namibia: "https://flagcdn.com/w40/na.png",
  Tanzania: "https://flagcdn.com/w40/tz.png",
  Angola: "https://flagcdn.com/w40/ao.png",
  Madagascar: "https://flagcdn.com/w40/mg.png",
  Mauritius: "https://flagcdn.com/w40/mu.png",
  "Democratic Republic of the Congo": "https://flagcdn.com/w40/cd.png",
  Zambia: "https://flagcdn.com/w40/zm.png",
  Botswana: "https://flagcdn.com/w40/bw.png",
  Zimbabwe: "https://flagcdn.com/w40/zw.png",
  Malawi: "https://flagcdn.com/w40/mw.png",
  Eswatini: "https://flagcdn.com/w40/sz.png",
  Lesotho: "https://flagcdn.com/w40/ls.png",
  Seychelles: "https://flagcdn.com/w40/sc.png",
  Comoros: "https://flagcdn.com/w40/km.png",
};

const TERMINAL_BERTHING_STORAGE_KEY = "cargo-konect-terminal-berthing-state";
const CACHE_TTL_MS = 60 * 1000;
const AUTO_REFRESH_MS = 30 * 1000;
const PAGE_STICKY_TOP = "top-0"; // change to top-[72px] if your site header is fixed

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "No updates yet";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusBadgeStyles = {
  Expected: "bg-blue-50 text-blue-700 border-blue-200",
  Berthed: "bg-green-50 text-green-700 border-green-200",
  Delayed: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Departed: "bg-slate-100 text-slate-700 border-slate-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

const buildEtaDateTime = (etaDate, etaTime) => {
  if (!etaDate) return null;

  const date = new Date(etaDate);
  if (Number.isNaN(date.getTime())) return null;

  const [hours = "00", minutes = "00"] = (etaTime || "00:00").split(":");

  date.setHours(Number(hours) || 0);
  date.setMinutes(Number(minutes) || 0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
};

const getAutoStatus = (item) => {
  const currentStatus = item?.status || "Expected";

  if (["Berthed", "Departed", "Cancelled"].includes(currentStatus)) {
    return currentStatus;
  }

  const etaDateTime = buildEtaDateTime(
    item?.estimatedDateOfBerthing,
    item?.estimatedTimeOfBerthing
  );

  if (!etaDateTime) return currentStatus;

  const now = new Date();

  if (currentStatus === "Expected" && now >= etaDateTime) {
    return "Berthed";
  }

  return currentStatus;
};

const normalizeBerthingRow = (item) => {
  const autoStatus = getAutoStatus(item);
  return {
    ...item,
    status: autoStatus,
  };
};

const CountrySelect = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 pr-5 text-sm text-slate-700 outline-none transition focus:border-custom-blue"
      >
        <span className="flex min-w-0 items-center gap-2">
          {COUNTRY_FLAGS[value] && (
            <img
              src={COUNTRY_FLAGS[value]}
              alt={`${value} flag`}
              className="h-4 w-6 rounded-[2px] object-cover shadow-sm"
            />
          )}
          <span className="truncate">{value}</span>
        </span>
        <FaChevronDown className="ml-3 shrink-0 text-xs text-slate-500" />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {options.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                onChange(item);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition hover:bg-slate-50 ${
                value === item ? "bg-slate-50 text-slate-900" : "text-slate-700"
              }`}
            >
              {COUNTRY_FLAGS[item] && (
                <img
                  src={COUNTRY_FLAGS[item]}
                  alt={`${item} flag`}
                  className="h-4 w-6 rounded-[2px] object-cover shadow-sm"
                />
              )}
              <span>{item}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

CountrySelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const SelectArrow = () => (
  <FaChevronDown className="pointer-events-none absolute right-4 top-[42px] text-xs text-slate-500" />
);

const buildAlertKey = (vesselId, berthingId) =>
  `${vesselId || "no-vessel"}_${berthingId || "no-berthing"}`;

const TerminalBerthingPage = () => {
  const [country, setCountry] = useState("South Africa");
  const [portCode, setPortCode] = useState("ZADUR");
  const [terminal, setTerminal] = useState("");
  const [selectedVessel, setSelectedVessel] = useState("");

  const [rows, setRows] = useState([]);
  const [vesselOptions, setVesselOptions] = useState([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const [alertedKeys, setAlertedKeys] = useState(new Set());
  const [alertIdByKey, setAlertIdByKey] = useState({});
  const [processingAlertKey, setProcessingAlertKey] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const cacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);
  const hasRestoredRef = useRef(false);

  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const token = localStorage.getItem("userToken") || "";

  const filteredPorts = useMemo(() => {
    return SADC_PORTS.filter((item) => item.country === country);
  }, [country]);

  const terminalsForSelectedPort = useMemo(() => {
    return TERMINALS_BY_PORT[portCode] || [];
  }, [portCode]);

  const dateRange = useMemo(() => {
    const today = new Date();

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 7);

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 21);

    return {
      start: formatDate(startDate),
      end: formatDate(endDate),
    };
  }, []);

  const buildCacheKey = useCallback(
    () => JSON.stringify({ country, portCode, terminal, selectedVessel }),
    [country, portCode, terminal, selectedVessel]
  );

  const setPayloadToState = useCallback((payload) => {
    setRows(payload.rows || []);
    setVesselOptions(payload.vesselOptions || []);
    setLastUpdatedAt(payload.lastUpdatedAt || null);
  }, []);

  const fetchMyAlerts = useCallback(async () => {
    if (!token) {
      setAlertedKeys(new Set());
      setAlertIdByKey({});
      return;
    }

    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/vessel-alerts/my-alerts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const safeAlerts = Array.isArray(data) ? data : [];
      const nextKeys = new Set();
      const nextIdMap = {};

      safeAlerts.forEach((alert) => {
        const vesselId = alert?.vessel?._id || alert?.vessel;
        const berthingId = alert?.berthing?._id || alert?.berthing;
        if (vesselId && berthingId) {
          const key = buildAlertKey(vesselId, berthingId);
          nextKeys.add(key);
          nextIdMap[key] = alert._id;
        }
      });

      setAlertedKeys(nextKeys);
      setAlertIdByKey(nextIdMap);
    } catch (fetchError) {
      console.error("Failed to fetch vessel alerts:", fetchError);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchMyAlerts();
  }, [fetchMyAlerts]);

  useEffect(() => {
    if (hasRestoredRef.current) return;

    try {
      const raw = sessionStorage.getItem(TERMINAL_BERTHING_STORAGE_KEY);
      if (!raw) {
        hasRestoredRef.current = true;
        return;
      }

      const saved = JSON.parse(raw);

      if (saved?.country) setCountry(saved.country);
      if (saved?.portCode) setPortCode(saved.portCode);
      if (typeof saved?.terminal === "string") setTerminal(saved.terminal);
      if (typeof saved?.selectedVessel === "string") {
        setSelectedVessel(saved.selectedVessel);
      }

      if (Array.isArray(saved?.rows)) setRows(saved.rows);
      if (Array.isArray(saved?.vesselOptions)) setVesselOptions(saved.vesselOptions);
      if (saved?.lastUpdatedAt) setLastUpdatedAt(saved.lastUpdatedAt);
      if (typeof saved?.hasSearched === "boolean") setHasSearched(saved.hasSearched);
      if (typeof saved?.error === "string") setError(saved.error);
      if (typeof saved?.alertMessage === "string") setAlertMessage(saved.alertMessage);

      if (saved?.cacheKey) {
        cacheRef.current.set(saved.cacheKey, {
          rows: Array.isArray(saved?.rows) ? saved.rows : [],
          vesselOptions: Array.isArray(saved?.vesselOptions)
            ? saved.vesselOptions
            : [],
          lastUpdatedAt: saved?.lastUpdatedAt || null,
          fetchedAt: Date.now(),
        });
      }
    } catch (restoreError) {
      console.error("Failed to restore terminal berthing state:", restoreError);
    } finally {
      hasRestoredRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasRestoredRef.current) return;

    try {
      sessionStorage.setItem(
        TERMINAL_BERTHING_STORAGE_KEY,
        JSON.stringify({
          country,
          portCode,
          terminal,
          selectedVessel,
          rows,
          vesselOptions,
          lastUpdatedAt,
          hasSearched,
          error,
          alertMessage,
          cacheKey: buildCacheKey(),
        })
      );
    } catch (saveError) {
      console.error("Failed to save terminal berthing state:", saveError);
    }
  }, [
    country,
    portCode,
    terminal,
    selectedVessel,
    rows,
    vesselOptions,
    lastUpdatedAt,
    hasSearched,
    error,
    alertMessage,
    buildCacheKey,
  ]);

  useEffect(() => {
    if (
      filteredPorts.length > 0 &&
      !filteredPorts.some((p) => p.portCode === portCode)
    ) {
      setPortCode(filteredPorts[0].portCode);
      setTerminal("");
      setSelectedVessel("");
      setRows([]);
      setVesselOptions([]);
      setHasSearched(false);
      setError("");
    }
  }, [filteredPorts, portCode]);

  useEffect(() => {
    if (terminal && !terminalsForSelectedPort.includes(terminal)) {
      setTerminal("");
    }
  }, [terminal, terminalsForSelectedPort]);

  const runSearch = useCallback(
    async ({ forceRefresh = false, silent = false } = {}) => {
      const cacheKey = buildCacheKey();
      const cached = cacheRef.current.get(cacheKey);
      const isCacheFresh =
        cached && cached.fetchedAt && Date.now() - cached.fetchedAt < CACHE_TTL_MS;

      setHasSearched(true);
      setError("");
      if (!silent) setAlertMessage("");

      if (!forceRefresh && isCacheFresh) {
        setPayloadToState(cached);
        return;
      }

      try {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const data = await fetchTerminalBerthings({
          country,
          portCode,
          terminal,
          vesselId: selectedVessel,
          limit: 100,
          signal: controller.signal,
          timestamp: Date.now(),
        });

        const rawResults = Array.isArray(data?.results) ? data.results : [];
        const results = rawResults.map(normalizeBerthingRow);

        const vesselsMap = new Map();
        results.forEach((item) => {
          if (item?.vessel?._id && item?.vessel?.vesselName) {
            vesselsMap.set(item.vessel._id, item.vessel.vesselName);
          }
        });

        const vesselList = Array.from(vesselsMap.entries())
          .map(([id, vesselName]) => ({ id, vesselName }))
          .sort((a, b) => a.vesselName.localeCompare(b.vesselName));

        const payload = {
          rows: results,
          vesselOptions: vesselList,
          lastUpdatedAt: data?.lastUpdatedAt || new Date().toISOString(),
          fetchedAt: Date.now(),
        };

        cacheRef.current.set(cacheKey, payload);
        setPayloadToState(payload);
      } catch (err) {
        if (err?.name === "AbortError") return;

        console.error("Failed to load terminal berthings:", err);
        setRows([]);
        setVesselOptions([]);
        setError("Failed to load berthing data. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      buildCacheKey,
      country,
      portCode,
      terminal,
      selectedVessel,
      setPayloadToState,
    ]
  );

  const handleSearch = useCallback(async () => {
    await runSearch({ forceRefresh: true, silent: false });
  }, [runSearch]);

  useEffect(() => {
    if (!hasSearched) return;

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        runSearch({ forceRefresh: true, silent: true });
        fetchMyAlerts();
      }
    }, AUTO_REFRESH_MS);

    return () => clearInterval(interval);
  }, [hasSearched, runSearch, fetchMyAlerts]);

  useEffect(() => {
    if (!hasSearched) return;

    const handleWindowFocus = () => {
      runSearch({ forceRefresh: true, silent: true });
      fetchMyAlerts();
    };

    window.addEventListener("focus", handleWindowFocus);
    return () => window.removeEventListener("focus", handleWindowFocus);
  }, [hasSearched, runSearch, fetchMyAlerts]);

  const handleToggleAlert = async (row) => {
    if (!token) {
      setAlertMessage("Please sign in to set a vessel berth alert.");
      return;
    }

    const vesselId = row?.vessel?._id;
    const berthingId = row?._id;

    if (!vesselId || !berthingId) {
      setAlertMessage("This vessel does not have enough information for an alert.");
      return;
    }

    const alertKey = buildAlertKey(vesselId, berthingId);
    const isAlerted = alertedKeys.has(alertKey);

    try {
      setProcessingAlertKey(alertKey);
      setAlertMessage("");

      if (isAlerted) {
        const alertId = alertIdByKey[alertKey];

        if (!alertId) {
          throw new Error("Alert ID not found for this listing.");
        }

        await axios.delete(`${API_BASE_URL}/api/vessel-alerts/${alertId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAlertedKeys((prev) => {
          const next = new Set(prev);
          next.delete(alertKey);
          return next;
        });

        setAlertIdByKey((prev) => {
          const next = { ...prev };
          delete next[alertKey];
          return next;
        });

        setAlertMessage(
          `${row?.vessel?.vesselName || "Vessel"} alert removed successfully.`
        );
      } else {
        const { data } = await axios.post(
          `${API_BASE_URL}/api/vessel-alerts`,
          {
            vesselId,
            berthingId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const createdAlertId = data?.alert?._id || data?._id;

        setAlertedKeys((prev) => {
          const next = new Set(prev);
          next.add(alertKey);
          return next;
        });

        if (createdAlertId) {
          setAlertIdByKey((prev) => ({
            ...prev,
            [alertKey]: createdAlertId,
          }));
        } else {
          await fetchMyAlerts();
        }

        setAlertMessage(
          `${row?.vessel?.vesselName || "Vessel"} alert created. You will be notified when it reaches berth.`
        );
      }
    } catch (toggleError) {
      console.error("Failed to toggle vessel alert:", toggleError);
      setAlertMessage(
        toggleError?.response?.data?.message ||
          toggleError?.message ||
          "Failed to update alert. Please try again."
      );
    } finally {
      setProcessingAlertKey("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
  
  {/* FULL WIDTH TOPBAR */}
  <CompanyTopBar homeLink="/company-home" />

  {/* CENTERED CONTENT ONLY */}
  <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 space-y-5">

      <style>{`
        @keyframes bell-vibrate {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(-14deg); }
          40% { transform: rotate(12deg); }
          60% { transform: rotate(-10deg); }
          80% { transform: rotate(8deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes bell-ring-line {
          0% { opacity: 0; transform: scale(0.85); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: scale(1.25); }
        }

        .bell-active {
          animation: bell-vibrate 0.8s ease-in-out infinite;
          transform-origin: top center;
        }

        .bell-ring-line {
          animation: bell-ring-line 1.1s ease-out infinite;
        }

        .bell-ring-line-delay {
          animation: bell-ring-line 1.1s ease-out infinite 0.2s;
        }
      `}</style>

      <div className="mx-auto max-w-7xl space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-custom-blue">
                Terminal Berthing
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Vessel Berthing Schedule
              </h1>
              <p className="mt-2 text-sm text-slate-600 md:text-[15px]">
                Track vessel berthing activity across selected SADC region ports.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 md:text-sm">
              <span className="font-semibold text-slate-800">Last updated:</span>{" "}
              {formatDateTime(lastUpdatedAt)}
              {refreshing && (
                <span className="ml-2 text-custom-blue">(Refreshing...)</span>
              )}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600 md:text-sm">
            <span>
              Date range:{" "}
              <span className="font-semibold text-slate-800">
                {dateRange.start} - {dateRange.end}
              </span>
            </span>
            <span className="text-slate-500">7 days back and 21 days ahead</span>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Country
              </label>
              <CountrySelect
                value={country}
                onChange={(selectedCountry) => {
                  setCountry(selectedCountry);
                  setTerminal("");
                  setSelectedVessel("");
                  setRows([]);
                  setVesselOptions([]);
                  setHasSearched(false);
                  setError("");
                }}
                options={SADC_COUNTRIES}
              />
            </div>

            <div className="relative">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Port of Discharge
              </label>
              <select
                value={portCode}
                onChange={(e) => {
                  setPortCode(e.target.value);
                  setTerminal("");
                  setSelectedVessel("");
                  setRows([]);
                  setVesselOptions([]);
                  setHasSearched(false);
                  setError("");
                }}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-12 text-sm outline-none transition focus:border-custom-blue"
              >
                {filteredPorts.map((port) => (
                  <option key={port.portCode} value={port.portCode}>
                    {port.portCode} - {port.portName}
                  </option>
                ))}
              </select>
              <SelectArrow />
            </div>

            <div className="relative">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Terminal
              </label>
              <select
                value={terminal}
                onChange={(e) => setTerminal(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-12 text-sm outline-none transition focus:border-custom-blue"
              >
                <option value="">All Terminals</option>
                {terminalsForSelectedPort.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <SelectArrow />
            </div>

            <div className="relative">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Vessel
              </label>
              <select
                value={selectedVessel}
                onChange={(e) => setSelectedVessel(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-12 text-sm outline-none transition focus:border-custom-blue"
              >
                <option value="">All Vessels</option>
                {vesselOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.vesselName}
                  </option>
                ))}
              </select>
              <SelectArrow />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-custom-blue px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaSearch className="text-sm" />
                <span>{loading ? "Loading..." : "Apply Filters"}</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {alertMessage && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {alertMessage}
          </div>
        )}

        {hasSearched && (
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full min-w-[1100px] table-fixed border-separate border-spacing-0 text-[12px] leading-5">
                <thead>
                  <tr>
                    <th
                      className={`sticky ${PAGE_STICKY_TOP} z-30 w-[15%] bg-custom-blue px-3 py-3 text-left text-[11px] font-semibold uppercase text-white`}
                    >
                      Vessel
                    </th>
                    <th
                      className={`sticky ${PAGE_STICKY_TOP} z-30 w-[9%] bg-custom-blue px-3 py-3 text-left text-[11px] font-semibold uppercase text-white`}
                    >
                      Date
                    </th>
                    <th
                      className={`sticky ${PAGE_STICKY_TOP} z-30 w-[8%] bg-custom-blue px-3 py-3 text-left text-[11px] font-semibold uppercase text-white`}
                    >
                      Time
                    </th>
                    <th
                      className={`sticky ${PAGE_STICKY_TOP} z-30 w-[11%] bg-custom-blue px-3 py-3 text-left text-[11px] font-semibold uppercase text-white`}
                    >
                      Discharge
                    </th>
                    <th
                      className={`sticky ${PAGE_STICKY_TOP} z-30 w-[11%] bg-custom-blue px-3 py-3 text-left text-[11px] font-semibold uppercase text-white`}
                    >
                      Loading
                    </th>
                    <th
                      className={`sticky ${PAGE_STICKY_TOP} z-30 w-[12%] bg-custom-blue px-3 py-3 text-left text-[11px] font-semibold uppercase text-white`}
                    >
                      Shed
                    </th>
                    <th
                      className={`sticky ${PAGE_STICKY_TOP} z-30 w-[16%] bg-custom-blue px-3 py-3 text-left text-[11px] font-semibold uppercase text-white`}
                    >
                      Comments
                    </th>
                    <th
                      className={`sticky ${PAGE_STICKY_TOP} z-30 w-[8%] bg-custom-blue px-3 py-3 text-left text-[11px] font-semibold uppercase text-white`}
                    >
                      Status
                    </th>
                    <th
                      className={`sticky ${PAGE_STICKY_TOP} z-30 w-[10%] bg-custom-blue px-3 py-3 text-left text-[11px] font-semibold uppercase text-white`}
                    >
                      Alert Me
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                        Loading...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                        No results found
                      </td>
                    </tr>
                  ) : (
                    rows.map((item) => {
                      const vesselId = item?.vessel?._id;
                      const berthingId = item?._id;
                      const alertKey = buildAlertKey(vesselId, berthingId);
                      const isAlerted = alertedKeys.has(alertKey);
                      const isProcessing = processingAlertKey === alertKey;

                      return (
                        <tr
                          key={item._id}
                          className="border-t border-slate-100 align-top hover:bg-slate-50"
                        >
                          <td className="px-3 py-3 break-words">
                            <Link
                              to={`/terminal-berthing/vessel/${item?.vessel?.slug || ""}`}
                              className="block break-words font-semibold text-custom-blue hover:underline"
                            >
                              {item?.vessel?.vesselName || "Unknown"}
                            </Link>
                            <div className="text-[11px] text-slate-500">
                              {item.berthingNumber || "—"}
                            </div>
                          </td>

                          <td className="px-3 py-3 break-words">
                            {formatDate(item.estimatedDateOfBerthing)}
                          </td>

                          <td className="px-3 py-3 break-words">
                            {item.estimatedTimeOfBerthing || "—"}
                          </td>

                          <td className="px-3 py-3 break-words">
                            {item.containersToDischarge ?? "—"}
                          </td>

                          <td className="px-3 py-3 break-words">
                            {item.containersToLoad ?? "—"}
                          </td>

                          <td className="px-3 py-3 break-words">
                            {item.berthingShed || "—"}
                          </td>

                          <td className="px-3 py-3 break-words whitespace-normal">
                            {item.comments || "—"}
                          </td>

                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold whitespace-normal ${
                                statusBadgeStyles[item.status] ||
                                "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              {item.status || "Unknown"}
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() => handleToggleAlert(item)}
                              disabled={isProcessing}
                              className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition ${
                                isAlerted
                                  ? "border-blue-200 bg-blue-50 text-custom-blue"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-custom-blue hover:text-custom-blue"
                              } ${isProcessing ? "cursor-not-allowed opacity-70" : ""}`}
                              aria-label={
                                isAlerted
                                  ? "Remove vessel berth alert"
                                  : "Create vessel berth alert"
                              }
                              title={
                                isAlerted
                                  ? "Click to remove alert"
                                  : isProcessing
                                  ? "Updating alert..."
                                  : "Click to create alert"
                              }
                            >
                              {(isAlerted || isProcessing) && (
                                <>
                                  <span className="bell-ring-line absolute inset-0 rounded-full border border-custom-blue/40" />
                                  <span className="bell-ring-line-delay absolute inset-0 rounded-full border border-custom-blue/25" />
                                </>
                              )}

                              <FaBell
                                className={`relative z-10 text-xs ${
                                  isAlerted || isProcessing ? "bell-active" : ""
                                }`}
                              />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default TerminalBerthingPage;