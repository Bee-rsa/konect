import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FaShip } from "react-icons/fa";
import { fetchVesselBySlug } from "../api/berthingApi";
import PropTypes from "prop-types";

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isSameDay = (dateA, dateB) => {
  if (!dateA || !dateB) return false;

  const a = new Date(dateA);
  const b = new Date(dateB);

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const getStatusTone = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized.includes("berthed")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (normalized.includes("expected")) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (normalized.includes("delayed")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (normalized.includes("departed")) {
    return "bg-slate-100 text-slate-700 border-slate-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
};

const CompactInfoCard = ({ label, value }) => (
  <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3">
    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
      {label}
    </p>
    <p className="mt-1.5 break-words text-sm font-semibold text-slate-800">
      {value || "—"}
    </p>
  </div>
);

CompactInfoCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const JourneyOverview = ({ visits = [] }) => {
  const journey = useMemo(() => {
    if (!visits.length) {
      return {
        ports: [],
        vesselPosition: 0,
        vesselPortIndex: null,
      };
    }

    const chronological = [...visits].sort((a, b) => {
      const dateA = new Date(a.estimatedDateOfBerthing).getTime();
      const dateB = new Date(b.estimatedDateOfBerthing).getTime();

      if (dateA !== dateB) return dateA - dateB;

      const timeA = a.estimatedTimeOfBerthing || "";
      const timeB = b.estimatedTimeOfBerthing || "";
      return timeA.localeCompare(timeB);
    });

    const ports = [];
    const seen = new Set();

    chronological.forEach((visit) => {
      const previousPort = visit.previousPortOfDeparture || "";
      const destinationPort = visit.destinationPortName
        ? `${visit.destinationPortName}${
            visit.destinationPortCode ? ` (${visit.destinationPortCode})` : ""
          }`
        : "";

      if (previousPort && !seen.has(previousPort)) {
        ports.push(previousPort);
        seen.add(previousPort);
      }

      if (destinationPort && !seen.has(destinationPort)) {
        ports.push(destinationPort);
        seen.add(destinationPort);
      }
    });

    const latest = chronological[chronological.length - 1];
    const previousVisit =
      chronological.length > 1 ? chronological[chronological.length - 2] : null;

    const today = new Date();

    const todayVisit =
      [...chronological]
        .reverse()
        .find((visit) => isSameDay(visit.estimatedDateOfBerthing, today)) || null;

    let vesselPortIndex = null;
    let vesselPosition = 0;

    if (todayVisit?.destinationPortName && ports.length > 1) {
      const todayDestination = `${todayVisit.destinationPortName}${
        todayVisit.destinationPortCode ? ` (${todayVisit.destinationPortCode})` : ""
      }`;

      const foundIndex = ports.findIndex((port) => port === todayDestination);

      if (foundIndex !== -1) {
        vesselPortIndex = foundIndex;
        vesselPosition = (foundIndex / (ports.length - 1)) * 100;
      }
    }

    if (vesselPortIndex === null) {
      if (previousVisit?.estimatedDateOfBerthing && latest?.estimatedDateOfBerthing) {
        const start = new Date(previousVisit.estimatedDateOfBerthing).getTime();
        const end = new Date(latest.estimatedDateOfBerthing).getTime();
        const now = Date.now();

        if (end > start) {
          const progress = ((now - start) / (end - start)) * 100;
          vesselPosition = Math.min(100, Math.max(0, progress));
        } else {
          vesselPosition = 100;
        }
      } else if (ports.length > 1) {
        vesselPosition = 60;
      }
    }

    return {
      ports,
      vesselPosition,
      vesselPortIndex,
    };
  }, [visits]);

  if (!journey.ports.length) {
    return null;
  }

  const { ports, vesselPosition, vesselPortIndex } = journey;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-custom-blue">
            Journey Overview
          </p>
          <p className="mt-2 break-words text-sm text-slate-500">
            Current vessel route based on available sea leg berthing records
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden">
        <div className="relative px-2 pt-14 sm:px-4 sm:pt-16 md:px-6">
          <div className="absolute left-2 right-2 top-[66px] h-[4px] rounded-full bg-slate-200 sm:left-4 sm:right-4 sm:top-[74px] sm:h-[5px] md:left-6 md:right-6" />

          <div
            className="absolute left-2 top-[66px] h-[4px] rounded-full bg-custom-blue transition-all duration-700 sm:left-4 sm:top-[74px] sm:h-[5px] md:left-6"
            style={{
              width: `calc((100% - 16px) * ${vesselPosition / 100})`,
            }}
          />

          <div
            className="absolute top-[42px] z-10 -translate-x-1/2 transition-all duration-700 sm:top-[48px]"
            style={{
              left: `calc(8px + (100% - 16px) * ${vesselPosition / 100})`,
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md sm:h-12 sm:w-12 md:h-14 md:w-14">
              <FaShip className="text-base text-custom-blue sm:text-xl md:text-2xl" />
            </div>
          </div>

          <div className="relative grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:flex lg:items-start lg:justify-between lg:gap-6">
            {ports.map((port, index) => {
              const isCurrentPort = vesselPortIndex === index;

              return (
                <div
                  key={`${port}-${index}`}
                  className="relative flex min-w-0 flex-col items-center text-center lg:flex-1"
                >
                  <div
                    className={`z-10 h-4 w-4 rounded-full border-4 border-white shadow-sm sm:h-5 sm:w-5 ${
                      isCurrentPort ? "bg-emerald-500" : "bg-custom-blue"
                    }`}
                  />
                  <p className="mt-4 max-w-[120px] break-words text-xs font-semibold leading-5 text-slate-800 sm:max-w-[140px] sm:text-sm">
                    {port}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

JourneyOverview.propTypes = {
  visits: PropTypes.arrayOf(
    PropTypes.shape({
      previousPortOfDeparture: PropTypes.string,
      destinationPortName: PropTypes.string,
      destinationPortCode: PropTypes.string,
      estimatedDateOfBerthing: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
      ]),
      estimatedTimeOfBerthing: PropTypes.string,
      status: PropTypes.string,
    })
  ),
};

const VesselImageCard = ({ src, alt, description }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageSrc =
    src || "https://placehold.co/1200x700?text=Vessel+Image";

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="p-4 md:p-5">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          {!imageLoaded && !imageError && (
            <div className="flex h-[220px] w-full animate-pulse items-center justify-center bg-slate-100 md:h-[260px]">
              <span className="text-sm text-slate-400">Loading vessel image...</span>
            </div>
          )}

          <img
            src={imageSrc}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageLoaded(true);
              setImageError(true);
            }}
            className={`h-[220px] w-full object-cover transition-opacity duration-500 md:h-[260px] ${
              imageLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
            }`}
          />

          {imageError && (
            <div className="flex h-[220px] w-full items-center justify-center bg-slate-100 text-sm text-slate-400 md:h-[260px]">
              Image unavailable
            </div>
          )}
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase text-slate-500">Description</p>
          <p className="mt-2 break-words text-sm leading-7 text-slate-700">
            {description || "No vessel description available."}
          </p>
        </div>
      </div>
    </div>
  );
};

VesselImageCard.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  description: PropTypes.string,
};

const VesselDetailsPage = () => {
  const { slug } = useParams();
  const [vessel, setVessel] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVessel = async () => {
      try {
        setLoading(true);
        const data = await fetchVesselBySlug(slug || "");
        setVessel(data.vessel);
        setVisits(data.visits || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadVessel();
  }, [slug]);

  const sortedVisitsDesc = useMemo(() => {
    return [...visits].sort((a, b) => {
      const dateA = new Date(a.estimatedDateOfBerthing).getTime();
      const dateB = new Date(b.estimatedDateOfBerthing).getTime();

      if (dateB !== dateA) return dateB - dateA;

      const timeA = a.estimatedTimeOfBerthing || "";
      const timeB = b.estimatedTimeOfBerthing || "";
      return timeB.localeCompare(timeA);
    });
  }, [visits]);

  const sortedVisitsAsc = useMemo(() => {
    return [...visits].sort((a, b) => {
      const dateA = new Date(a.estimatedDateOfBerthing).getTime();
      const dateB = new Date(b.estimatedDateOfBerthing).getTime();

      if (dateA !== dateB) return dateA - dateB;

      const timeA = a.estimatedTimeOfBerthing || "";
      const timeB = b.estimatedTimeOfBerthing || "";
      return timeA.localeCompare(timeB);
    });
  }, [visits]);

  const latestVisit = sortedVisitsDesc[0] || null;
  const pastVisits = sortedVisitsDesc.slice(1);

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-600">
        Loading vessel details...
      </div>
    );
  }

  if (!vessel) {
    return (
      <div className="p-10 text-center text-slate-600">
        Vessel not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8 overflow-x-hidden">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <VesselImageCard
            src={vessel.vesselImage}
            alt={vessel.vesselName}
            description={vessel.vesselDescription}
          />

          <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-custom-blue">
              Vessel Overview
            </p>
            <h1 className="mt-2 break-words text-3xl font-semibold text-slate-900">
              {vessel.vesselName}
            </h1>

            <div className="mt-6 space-y-4 text-sm text-slate-700">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="min-w-0 rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">Vessel Type</p>
                  <p className="mt-1 break-words font-medium">
                    {vessel.vesselType || "—"}
                  </p>
                </div>

                <div className="min-w-0 rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">Flag</p>
                  <div className="mt-1 flex min-w-0 items-center gap-2 font-medium">
                    {vessel.flagCode ? (
                      <img
                        src={`https://flagcdn.com/w40/${vessel.flagCode.toLowerCase()}.png`}
                        alt={vessel.flagCountry}
                        loading="lazy"
                        decoding="async"
                        className="h-4 w-6 flex-shrink-0 rounded-sm object-cover"
                      />
                    ) : null}
                    <span className="break-words">{vessel.flagCountry || "—"}</span>
                  </div>
                </div>

                <div className="min-w-0 rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">IMO</p>
                  <p className="mt-1 break-words font-medium">{vessel.imo || "—"}</p>
                </div>

                <div className="min-w-0 rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">MMSI</p>
                  <p className="mt-1 break-words font-medium">{vessel.mmsi || "—"}</p>
                </div>

                <div className="min-w-0 rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">Call Sign</p>
                  <p className="mt-1 break-words font-medium">
                    {vessel.callSign || "—"}
                  </p>
                </div>

                <div className="min-w-0 rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">Operator</p>
                  <p className="mt-1 break-words font-medium">
                    {vessel.operator || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {latestVisit && (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-custom-blue">
                  Latest Berthing Information
                </p>
                <h2 className="mt-1 break-words text-xl font-semibold text-slate-900 md:text-2xl">
                  Latest Berthing Schedule
                </h2>
              </div>

              <div
                className={`inline-flex w-fit max-w-full break-words rounded-full border px-3 py-1.5 text-center text-xs font-semibold ${getStatusTone(
                  latestVisit.status
                )}`}
              >
                {latestVisit.status || "Status unavailable"}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <CompactInfoCard label="Berthing Number" value={latestVisit.berthingNumber} />
              <CompactInfoCard
                label="Previous Port"
                value={latestVisit.previousPortOfDeparture}
              />
              <CompactInfoCard
                label="Destination"
                value={`${latestVisit.destinationPortName || "—"}${
                  latestVisit.destinationPortCode
                    ? ` (${latestVisit.destinationPortCode})`
                    : ""
                }`}
              />
              <CompactInfoCard label="Berthing Shed" value={latestVisit.berthingShed} />
              <CompactInfoCard
                label="ETA Date"
                value={formatDate(latestVisit.estimatedDateOfBerthing)}
              />
              <CompactInfoCard
                label="ETA Time"
                value={latestVisit.estimatedTimeOfBerthing}
              />
              <CompactInfoCard
                label="Discharge"
                value={latestVisit.containersToDischarge ?? "—"}
              />
              <CompactInfoCard
                label="Load"
                value={latestVisit.containersToLoad ?? "—"}
              />
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                  Comments
                </p>
                <p className="mt-1.5 break-words text-sm leading-6 text-slate-700">
                  {latestVisit.comments || "No comments available."}
                </p>
              </div>

              <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                  Last Updated
                </p>
                <p className="mt-1.5 break-words text-sm font-semibold text-slate-800">
                  {formatDateTime(latestVisit.lastUpdatedAt)}
                </p>
              </div>
            </div>
          </div>
        )}

        <JourneyOverview visits={sortedVisitsAsc} />

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-custom-blue">
                All Current Sea Legs Berthing Records Associated With This Vessel
              </p>
              <p className="mt-2 break-words text-sm text-slate-500">
                Full list of current sea leg records linked to this vessel
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">
              Total records:{" "}
              <span className="font-semibold text-slate-800">{sortedVisitsAsc.length}</span>
            </div>
          </div>

          <div className="mt-6 max-w-full overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold">Previous Port</th>
                  <th className="px-4 py-3 text-left font-semibold">Destination</th>
                  <th className="px-4 py-3 text-left font-semibold">Berth Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Internal Berthing Number</th>
                  <th className="px-4 py-3 text-left font-semibold">Berthing Shed</th>
                  <th className="px-4 py-3 text-left font-semibold">Discharge</th>
                  <th className="px-4 py-3 text-left font-semibold">Load</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Last Updated</th>
                </tr>
              </thead>

              <tbody className="bg-white">
                {sortedVisitsAsc.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                      No berthing records found for this vessel.
                    </td>
                  </tr>
                ) : (
                  sortedVisitsAsc.map((visit) => (
                    <tr
                      key={visit._id}
                      className="border-t border-slate-100 hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-4 break-words">
                        {visit.previousPortOfDeparture || "—"}
                      </td>
                      <td className="px-4 py-4 break-words">
                        {visit.destinationPortCode || "—"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {formatDate(visit.estimatedDateOfBerthing)}
                      </td>
                      <td className="px-4 py-4 break-all">{visit.berthingNumber}</td>
                      <td className="px-4 py-4 break-words">
                        {visit.berthingShed || "—"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {visit.containersToDischarge ?? "—"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {visit.containersToLoad ?? "—"}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex max-w-full break-words rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusTone(
                            visit.status
                          )}`}
                        >
                          {visit.status || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {formatDateTime(visit.lastUpdatedAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {pastVisits.length > 0 && (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-custom-blue">
              Past Berth History
            </p>

            <div className="mt-6 max-w-full overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left font-semibold">Previous Port</th>
                    <th className="px-4 py-3 text-left font-semibold">Destination</th>
                    <th className="px-4 py-3 text-left font-semibold">Port Berth Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Internal Berthing Number</th>
                    <th className="px-4 py-3 text-left font-semibold">Vessel Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {pastVisits.map((visit) => (
                    <tr
                      key={visit._id}
                      className="border-t border-slate-100 hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-4 break-words">
                        {visit.previousPortOfDeparture || "—"}
                      </td>
                      <td className="px-4 py-4 break-words">
                        {visit.destinationPortName || "—"}{" "}
                        {visit.destinationPortCode ? `(${visit.destinationPortCode})` : ""}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {formatDate(visit.estimatedDateOfBerthing)}
                      </td>
                      <td className="px-4 py-4 break-all">{visit.berthingNumber}</td>
                      <td className="px-4 py-4 break-words">{visit.status || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VesselDetailsPage;