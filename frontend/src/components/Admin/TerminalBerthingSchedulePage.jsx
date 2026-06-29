import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  createBerthing,
  fetchTerminalBerthings,
  updateBerthing,
} from "../../api/berthingApi";
import { SADC_COUNTRIES, SADC_PORTS } from "../../constants/sadcPorts";

const DEFAULT_COUNTRY = "South Africa";
const DEFAULT_PORT =
  SADC_PORTS.find((item) => item.country === DEFAULT_COUNTRY)?.portCode || "";

const createInitialLeg = () => ({
  previousPortOfDeparture: "",
  destinationCountry: DEFAULT_COUNTRY,
  destinationPortCode: DEFAULT_PORT,
  estimatedDateOfBerthing: "",
  estimatedTimeOfBerthing: "",
  containersToDischarge: 0,
  containersToLoad: 0,
  berthingShed: "",
  comments: "",
  status: "Expected",
  actualDateOfBerthing: "",
  actualTimeOfBerthing: "",
  departureDate: "",
  departureTime: "",
});

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

const SectionCard = ({ eyebrow, title, description, rightContent, children }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-custom-blue">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-xl font-semibold text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs text-slate-600">{description}</p>
        ) : null}
      </div>
      {rightContent ? <div>{rightContent}</div> : null}
    </div>
    <div className="mt-4">{children}</div>
  </div>
);

SectionCard.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  rightContent: PropTypes.node,
  children: PropTypes.node.isRequired,
};

const ExcelField = ({ label, children, className = "" }) => (
  <div className={`border-r border-b border-slate-200 bg-white ${className}`}>
    <div className="flex h-8 items-center border-b border-slate-100 px-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
      {label}
    </div>
    <div className="p-1.5">{children}</div>
  </div>
);

ExcelField.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const ExcelInput = ({ value, onChange, type = "text" }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full border-0 bg-transparent px-1 py-1 text-xs outline-none focus:ring-0"
  />
);

ExcelInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
};

const ExcelSelect = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full border-0 bg-transparent px-1 py-1 text-xs outline-none focus:ring-0"
  >
    {options.map((option) => {
      const optionValue = typeof option === "string" ? option : option.value;
      const optionLabel = typeof option === "string" ? option : option.label;

      return (
        <option key={optionValue} value={optionValue}>
          {optionLabel}
        </option>
      );
    })}
  </select>
);

ExcelSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
};

const BackArrowButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 transition hover:text-slate-900"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 19.5 8.25 12l7.5-7.5"
      />
    </svg>
    Back to vessels
  </button>
);

BackArrowButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

const TerminalBerthingSchedulePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { vesselId } = useParams();

  const [selectedVessel, setSelectedVessel] = useState(location.state?.vessel || null);
  const [existingRows, setExistingRows] = useState([]);
  const [berthingLegs, setBerthingLegs] = useState([createInitialLeg()]);
  const [editingBerthing, setEditingBerthing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredPortsByLeg = useMemo(() => {
    return berthingLegs.map((leg) =>
      SADC_PORTS.filter((item) => item.country === leg.destinationCountry)
    );
  }, [berthingLegs]);

  const vesselRows = useMemo(() => {
    if (!selectedVessel?._id) return [];
    return existingRows.filter((row) => row.vessel?._id === selectedVessel._id);
  }, [existingRows, selectedVessel]);

  const loadExisting = useCallback(async () => {
    try {
      const data = await fetchTerminalBerthings({
        vesselSearch: "",
        generalSearch: "",
        country: "",
        portCode: "",
        limit: 200,
      });

      const results = data.results || [];
      setExistingRows(results);

      if (!selectedVessel && vesselId) {
        const matchedVessel =
          results.find((row) => row.vessel?._id === vesselId)?.vessel || null;
        setSelectedVessel(matchedVessel);
      }
    } catch (error) {
      console.error(error);
    }
  }, [selectedVessel, vesselId]);

  useEffect(() => {
    loadExisting();
  }, [loadExisting]);

  const updateLegField = (index, field, value) => {
    setBerthingLegs((prev) =>
      prev.map((leg, i) => {
        if (i !== index) return leg;

        if (field === "destinationCountry") {
          const portsForCountry = SADC_PORTS.filter(
            (item) => item.country === value
          );

          const nextPortCode = portsForCountry.some(
            (port) => port.portCode === leg.destinationPortCode
          )
            ? leg.destinationPortCode
            : portsForCountry[0]?.portCode || "";

          return {
            ...leg,
            destinationCountry: value,
            destinationPortCode: nextPortCode,
          };
        }

        return {
          ...leg,
          [field]: value,
        };
      })
    );
  };

  const validateLeg = (leg, legIndex) => {
    const missing = [];

    if (!leg.previousPortOfDeparture?.trim()) missing.push("Previous Port");
    if (!leg.destinationCountry?.trim()) missing.push("Destination Country");
    if (!leg.destinationPortCode?.trim()) missing.push("Destination Port");
    if (!leg.estimatedDateOfBerthing?.trim()) missing.push("ETA Date");
    if (!leg.estimatedTimeOfBerthing?.trim()) missing.push("ETA Time");
    if (!leg.berthingShed?.trim()) missing.push("Berthing Shed");

    if (
      leg.containersToDischarge === "" ||
      leg.containersToDischarge === null ||
      Number.isNaN(Number(leg.containersToDischarge))
    ) {
      missing.push("Containers to Discharge");
    }

    if (
      leg.containersToLoad === "" ||
      leg.containersToLoad === null ||
      Number.isNaN(Number(leg.containersToLoad))
    ) {
      missing.push("Containers to Load");
    }

    if (missing.length > 0) {
      return `Leg ${legIndex + 1} is missing: ${missing.join(", ")}`;
    }

    return null;
  };

  const addAnotherLeg = () => {
    const lastLeg = berthingLegs[berthingLegs.length - 1];
    const nextCountry = lastLeg.destinationCountry || DEFAULT_COUNTRY;
    const portsForCountry = SADC_PORTS.filter(
      (item) => item.country === nextCountry
    );

    setBerthingLegs((prev) => [
      ...prev,
      {
        ...createInitialLeg(),
        previousPortOfDeparture: lastLeg.destinationPortCode || "",
        destinationCountry: nextCountry,
        destinationPortCode: portsForCountry[0]?.portCode || "",
      },
    ]);
  };

  const removeLeg = (index) => {
    if (berthingLegs.length === 1) return;
    setBerthingLegs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateOrUpdateBerthing = async () => {
    if (!selectedVessel) {
      alert("No vessel selected.");
      return;
    }

    try {
      setSubmitting(true);

      const validationErrors = berthingLegs
        .map((leg, index) => validateLeg(leg, index))
        .filter(Boolean);

      if (validationErrors.length > 0) {
        alert(validationErrors.join("\n"));
        return;
      }

      if (editingBerthing) {
        const leg = berthingLegs[0];

        await updateBerthing(editingBerthing._id, {
          ...leg,
          vessel: selectedVessel._id,
          containersToDischarge: Number(leg.containersToDischarge),
          containersToLoad: Number(leg.containersToLoad),
          actualDateOfBerthing: leg.actualDateOfBerthing || null,
          departureDate: leg.departureDate || null,
        });

        alert("Berthing updated successfully.");
      } else {
        const createdLegNumbers = [];

        for (let i = 0; i < berthingLegs.length; i += 1) {
          const leg = berthingLegs[i];

          const created = await createBerthing({
            ...leg,
            vessel: selectedVessel._id,
            containersToDischarge: Number(leg.containersToDischarge),
            containersToLoad: Number(leg.containersToLoad),
            actualDateOfBerthing: leg.actualDateOfBerthing || null,
            departureDate: leg.departureDate || null,
          });

          createdLegNumbers.push(created?.berthingNumber || `Leg ${i + 1}`);
        }

        alert(
          `Berthing schedules created successfully.\n${createdLegNumbers.join(", ")}`
        );
      }

      setBerthingLegs([createInitialLeg()]);
      setEditingBerthing(null);
      await loadExisting();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to save berthing.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForSameVessel = () => {
    setEditingBerthing(null);
    setBerthingLegs([createInitialLeg()]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingBerthing(null);
    setBerthingLegs([createInitialLeg()]);
  };

  const startEdit = (item) => {
    setEditingBerthing(item);
    setBerthingLegs([
      {
        previousPortOfDeparture: item.previousPortOfDeparture || "",
        destinationCountry: item.destinationCountry || DEFAULT_COUNTRY,
        destinationPortCode: item.destinationPortCode || DEFAULT_PORT,
        estimatedDateOfBerthing: item.estimatedDateOfBerthing?.slice(0, 10) || "",
        estimatedTimeOfBerthing: item.estimatedTimeOfBerthing || "",
        containersToDischarge: item.containersToDischarge ?? 0,
        containersToLoad: item.containersToLoad ?? 0,
        berthingShed: item.berthingShed || "",
        comments: item.comments || "",
        status: item.status || "Expected",
        actualDateOfBerthing: item.actualDateOfBerthing
          ? item.actualDateOfBerthing.slice(0, 10)
          : "",
        actualTimeOfBerthing: item.actualTimeOfBerthing || "",
        departureDate: item.departureDate ? item.departureDate.slice(0, 10) : "",
        departureTime: item.departureTime || "",
      },
    ]);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!selectedVessel) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-5 md:px-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <div className="-mb-2">
            <BackArrowButton onClick={() => navigate(-1)} />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-semibold text-slate-900">No vessel selected</h1>
            <p className="mt-2 text-sm text-slate-600">
              Please go back and select a vessel first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 md:px-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="-mb-2">
          <BackArrowButton onClick={() => navigate(-1)} />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-custom-blue">
            Berthing Schedule
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
            {selectedVessel.vesselName}
          </h1>
          <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-600">
            Create and manage berth schedules for the selected vessel.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={handleResetForSameVessel}
              className="rounded-xl bg-custom-blue px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
            >
              Add New Berthing
            </button>
          </div>
        </div>

        {vesselRows.length > 0 ? (
          <SectionCard
            eyebrow="Selected Vessel"
            title={`Existing Berthings For ${selectedVessel.vesselName}`}
            description="Current berthing schedules already linked to this vessel."
          >
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-[11px]">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-2.5 py-2 text-left font-semibold text-slate-700">
                      Berthing No.
                    </th>
                    <th className="px-2.5 py-2 text-left font-semibold text-slate-700">
                      Port
                    </th>
                    <th className="px-2.5 py-2 text-left font-semibold text-slate-700">
                      ETA Date
                    </th>
                    <th className="px-2.5 py-2 text-left font-semibold text-slate-700">
                      ETA Time
                    </th>
                    <th className="px-2.5 py-2 text-left font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-2.5 py-2 text-left font-semibold text-slate-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {vesselRows.map((row) => (
                    <tr key={row._id} className="border-t border-slate-100">
                      <td className="px-2.5 py-2">{row.berthingNumber || "—"}</td>
                      <td className="px-2.5 py-2">{row.destinationPortCode || "—"}</td>
                      <td className="px-2.5 py-2">
                        {row.estimatedDateOfBerthing?.slice(0, 10) || "—"}
                      </td>
                      <td className="px-2.5 py-2">{row.estimatedTimeOfBerthing || "—"}</td>
                      <td className="px-2.5 py-2">{row.status || "—"}</td>
                      <td className="px-2.5 py-2">
                        <button
                          onClick={() => startEdit(row)}
                          className="rounded-lg border border-slate-300 px-2.5 py-1 font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        ) : null}

        <SectionCard
          eyebrow="Step 3"
          title={editingBerthing ? "Update Berthing Schedule" : "Create Berthing Schedule"}
          description={
            editingBerthing
              ? "Edit the selected berthing schedule."
              : "Create one or more berthing legs for the selected vessel."
          }
          rightContent={
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              <span className="font-semibold">Current vessel:</span> {selectedVessel.vesselName}
              {editingBerthing ? (
                <>
                  {" "}
                  | <span className="font-semibold">Editing:</span>{" "}
                  {editingBerthing.berthingNumber}
                </>
              ) : null}
            </div>
          }
        >
          <div className="space-y-4">
            {berthingLegs.map((leg, index) => {
              const filteredPorts = filteredPortsByLeg[index] || [];

              return (
                <div key={`leg-${index}`} className="border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Leg {index + 1}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Add the next port stop for this vessel.
                      </p>
                    </div>

                    {!editingBerthing && berthingLegs.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeLeg(index)}
                        className="border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Remove Leg
                      </button>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-7 border-l border-t border-slate-200">
                    <ExcelField label="Previous Port">
                      <ExcelInput
                        value={leg.previousPortOfDeparture}
                        onChange={(value) =>
                          updateLegField(index, "previousPortOfDeparture", value)
                        }
                      />
                    </ExcelField>

                    <ExcelField label="Destination Country">
                      <ExcelSelect
                        value={leg.destinationCountry}
                        onChange={(value) =>
                          updateLegField(index, "destinationCountry", value)
                        }
                        options={SADC_COUNTRIES}
                      />
                    </ExcelField>

                    <ExcelField label="Destination Port">
                      <ExcelSelect
                        value={leg.destinationPortCode}
                        onChange={(value) =>
                          updateLegField(index, "destinationPortCode", value)
                        }
                        options={filteredPorts.map((port) => ({
                          value: port.portCode,
                          label: port.portCode,
                        }))}
                      />
                    </ExcelField>

                    <ExcelField label="ETA Date">
                      <ExcelInput
                        type="date"
                        value={leg.estimatedDateOfBerthing}
                        onChange={(value) =>
                          updateLegField(index, "estimatedDateOfBerthing", value)
                        }
                      />
                    </ExcelField>

                    <ExcelField label="ETA Time">
                      <ExcelInput
                        type="time"
                        value={leg.estimatedTimeOfBerthing}
                        onChange={(value) =>
                          updateLegField(index, "estimatedTimeOfBerthing", value)
                        }
                      />
                    </ExcelField>

                    <ExcelField label="ATA Date">
                      <ExcelInput
                        type="date"
                        value={leg.actualDateOfBerthing}
                        onChange={(value) =>
                          updateLegField(index, "actualDateOfBerthing", value)
                        }
                      />
                    </ExcelField>

                    <ExcelField label="ATA Time" className="border-r-0">
                      <ExcelInput
                        type="time"
                        value={leg.actualTimeOfBerthing}
                        onChange={(value) =>
                          updateLegField(index, "actualTimeOfBerthing", value)
                        }
                      />
                    </ExcelField>

                    <ExcelField label="Berthing Shed">
                      <ExcelInput
                        value={leg.berthingShed}
                        onChange={(value) => updateLegField(index, "berthingShed", value)}
                      />
                    </ExcelField>

                    <ExcelField label="Containers Discharge">
                      <ExcelInput
                        type="number"
                        value={String(leg.containersToDischarge)}
                        onChange={(value) =>
                          updateLegField(index, "containersToDischarge", Number(value))
                        }
                      />
                    </ExcelField>

                    <ExcelField label="Containers Load">
                      <ExcelInput
                        type="number"
                        value={String(leg.containersToLoad)}
                        onChange={(value) =>
                          updateLegField(index, "containersToLoad", Number(value))
                        }
                      />
                    </ExcelField>

                    <ExcelField label="Status">
                      <ExcelSelect
                        value={leg.status}
                        onChange={(value) => updateLegField(index, "status", value)}
                        options={["Expected", "Berthed", "Delayed", "Departed", "Cancelled"]}
                      />
                    </ExcelField>

                    <ExcelField label="ETD Date">
                      <ExcelInput
                        type="date"
                        value={leg.departureDate}
                        onChange={(value) => updateLegField(index, "departureDate", value)}
                      />
                    </ExcelField>

                    <ExcelField label="ETD Time">
                      <ExcelInput
                        type="time"
                        value={leg.departureTime}
                        onChange={(value) => updateLegField(index, "departureTime", value)}
                      />
                    </ExcelField>

                    <ExcelField label="Comments" className="border-r-0">
                      <textarea
                        value={leg.comments}
                        onChange={(e) => updateLegField(index, "comments", e.target.value)}
                        rows={2}
                        className="w-full resize-none border-0 bg-transparent px-1 py-1 text-xs outline-none"
                      />
                    </ExcelField>
                  </div>
                </div>
              );
            })}

            {!editingBerthing ? (
              <button
                type="button"
                onClick={addAnotherLeg}
                className="rounded-xl border border-custom-blue px-4 py-2 text-xs font-semibold text-custom-blue transition hover:bg-blue-50"
              >
                Add Another Leg
              </button>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCreateOrUpdateBerthing}
                disabled={submitting}
                className="rounded-xl bg-custom-sage px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {editingBerthing
                  ? "Update Berthing Schedule"
                  : `Create ${berthingLegs.length} Berthing ${
                      berthingLegs.length === 1 ? "Leg" : "Legs"
                    }`}
              </button>

              <button
                onClick={handleResetForSameVessel}
                type="button"
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Reset Form For Same Vessel
              </button>

              {editingBerthing ? (
                <button
                  onClick={handleCancelEdit}
                  type="button"
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Records"
          title="All Existing Berthing Records"
          description="Full list of berthing records currently in the system for this vessel."
        >
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-[11px]">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-2.5 py-2 text-left font-semibold text-slate-700">
                    Vessel
                  </th>
                  <th className="px-2.5 py-2 text-left font-semibold text-slate-700">
                    Port
                  </th>
                  <th className="px-2.5 py-2 text-left font-semibold text-slate-700">
                    ETA Date
                  </th>
                  <th className="px-2.5 py-2 text-left font-semibold text-slate-700">
                    ETA Time
                  </th>
                  <th className="px-2.5 py-2 text-left font-semibold text-slate-700">
                    Berthing No.
                  </th>
                  <th className="px-2.5 py-2 text-left font-semibold text-slate-700">
                    Last Updated
                  </th>
                  <th className="px-2.5 py-2 text-left font-semibold text-slate-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {vesselRows.map((row) => (
                  <tr key={row._id} className="border-t border-slate-100">
                    <td className="px-2.5 py-2">{row.vessel?.vesselName || "—"}</td>
                    <td className="px-2.5 py-2">{row.destinationPortCode || "—"}</td>
                    <td className="px-2.5 py-2">
                      {row.estimatedDateOfBerthing?.slice(0, 10) || "—"}
                    </td>
                    <td className="px-2.5 py-2">{row.estimatedTimeOfBerthing || "—"}</td>
                    <td className="px-2.5 py-2">{row.berthingNumber || "—"}</td>
                    <td className="px-2.5 py-2">{formatDateTime(row.lastUpdatedAt)}</td>
                    <td className="px-2.5 py-2">
                      <button
                        onClick={() => startEdit(row)}
                        className="rounded-lg border border-slate-300 px-2.5 py-1 font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}

                {vesselRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                      No berthing records yet for this vessel.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default TerminalBerthingSchedulePage;