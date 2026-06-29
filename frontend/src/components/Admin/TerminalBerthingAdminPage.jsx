import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  createVessel,
  deleteVessel,
  fetchTerminalBerthings,
  searchVessels,
} from "../../api/berthingApi";

const VESSEL_TYPE_OPTIONS = [
  "Container Ship",
  "Bulk Carrier",
  "General Cargo Ship",
  "Tanker",
  "Ro-Ro Vessel",
  "Reefer Vessel",
  "Heavy Lift Vessel",
  "Multi-Purpose Vessel",
  "Feeder Vessel",
  "Passenger Vessel",
  "Tug",
  "Barge",
  "Offshore Support Vessel",
  "Other",
];

const FLAG_COUNTRIES = [
  { country: "Angola", code: "ao" },
  { country: "Argentina", code: "ar" },
  { country: "Australia", code: "au" },
  { country: "Bahamas", code: "bs" },
  { country: "Belgium", code: "be" },
  { country: "Brazil", code: "br" },
  { country: "Canada", code: "ca" },
  { country: "China", code: "cn" },
  { country: "Cyprus", code: "cy" },
  { country: "Denmark", code: "dk" },
  { country: "France", code: "fr" },
  { country: "Germany", code: "de" },
  { country: "Greece", code: "gr" },
  { country: "Hong Kong", code: "hk" },
  { country: "India", code: "in" },
  { country: "Indonesia", code: "id" },
  { country: "Italy", code: "it" },
  { country: "Japan", code: "jp" },
  { country: "Liberia", code: "lr" },
  { country: "Malta", code: "mt" },
  { country: "Marshall Islands", code: "mh" },
  { country: "Mozambique", code: "mz" },
  { country: "Namibia", code: "na" },
  { country: "Netherlands", code: "nl" },
  { country: "Norway", code: "no" },
  { country: "Panama", code: "pa" },
  { country: "Portugal", code: "pt" },
  { country: "Singapore", code: "sg" },
  { country: "South Africa", code: "za" },
  { country: "South Korea", code: "kr" },
  { country: "Spain", code: "es" },
  { country: "Switzerland", code: "ch" },
  { country: "Tanzania", code: "tz" },
  { country: "Turkey", code: "tr" },
  { country: "United Arab Emirates", code: "ae" },
  { country: "United Kingdom", code: "gb" },
  { country: "United States", code: "us" },
  { country: "Zambia", code: "zm" },
  { country: "Zimbabwe", code: "zw" },
];

const initialVesselForm = {
  vesselName: "",
  vesselDescription: "",
  vesselType: "",
  flagCountry: "",
  flagCode: "",
  imo: "",
  mmsi: "",
  callSign: "",
  vesselImage: "",
  operator: "",
  grossTonnage: "",
  deadweightTonnage: "",
  lengthOverall: "",
  beam: "",
  yearBuilt: "",
};

const normalizeVesselResults = (results) => {
  if (Array.isArray(results)) return results;
  if (Array.isArray(results?.vessels)) return results.vessels;
  if (Array.isArray(results?.data)) return results.data;
  if (Array.isArray(results?.results)) return results.results;
  if (Array.isArray(results?.data?.vessels)) return results.data.vessels;
  if (Array.isArray(results?.data?.results)) return results.data.results;
  if (Array.isArray(results?.data?.data)) return results.data.data;
  return [];
};

const flagLookup = FLAG_COUNTRIES.reduce((acc, item) => {
  acc[item.country.toLowerCase()] = item.code;
  return acc;
}, {});

const getFlagSuggestion = (value) => {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;

  return (
    FLAG_COUNTRIES.find((item) =>
      item.country.toLowerCase().startsWith(trimmed)
    ) || null
  );
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

const Input = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
  compact = false,
}) => (
  <div>
    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
      {label}
    </label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full rounded-xl border border-slate-200 bg-white text-xs outline-none transition focus:border-custom-blue disabled:bg-slate-50 disabled:text-slate-500 ${
        compact ? "px-2.5 py-2" : "px-3 py-2.5"
      }`}
    />
  </div>
);

Input.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  compact: PropTypes.bool,
};

const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  compact = false,
}) => (
  <div>
    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none rounded-xl border border-slate-200 bg-white text-xs outline-none transition focus:border-custom-blue ${
          compact ? "px-2.5 py-2 pr-10" : "px-3 py-2.5 pr-11"
        }`}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
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

      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  </div>
);

Select.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  placeholder: PropTypes.string,
  compact: PropTypes.bool,
};

const FlagCountryAutocomplete = ({
  value,
  onChange,
  onSelectSuggestion,
  compact = false,
}) => {
  const inputRef = useRef(null);
  const suggestion = getFlagSuggestion(value);
  const showSuggestion =
    suggestion &&
    value.trim() &&
    suggestion.country.toLowerCase() !== value.trim().toLowerCase();

  const suffix = showSuggestion ? suggestion.country.slice(value.length) : "";

  const acceptSuggestion = () => {
    if (suggestion) onSelectSuggestion(suggestion.country);
  };

  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        Flag Country
      </label>
      <div className="relative">
        {showSuggestion ? (
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-300">
            <span className="opacity-0">{value}</span>
            <span>{suffix}</span>
          </div>
        ) : null}

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.key === "Tab" || e.key === "Enter") && showSuggestion) {
              e.preventDefault();
              acceptSuggestion();
            }
          }}
          className={`relative z-10 w-full rounded-xl border border-slate-200 bg-transparent text-xs outline-none transition focus:border-custom-blue ${
            compact ? "px-2.5 py-2" : "px-3 py-2.5"
          }`}
        />
      </div>
    </div>
  );
};

FlagCountryAutocomplete.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSelectSuggestion: PropTypes.func.isRequired,
  compact: PropTypes.bool,
};

const TerminalBerthingAdminPage = () => {
  const navigate = useNavigate();

  const [vesselForm, setVesselForm] = useState(initialVesselForm);
  const [vesselQuery, setVesselQuery] = useState("");
  const [vesselResults, setVesselResults] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [existingRows, setExistingRows] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [imageFileName, setImageFileName] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const topVesselResults = vesselResults.slice(0, 5);

  const getLocalVesselMatches = useCallback(
    (query) => {
      const term = query.trim().toLowerCase();
      if (!term) return [];

      const vesselMap = new Map();

      existingRows.forEach((row) => {
        const vessel = row?.vessel;
        if (!vessel?._id) return;

        const matches =
          vessel.vesselName?.toLowerCase().includes(term) ||
          vessel.imo?.toLowerCase?.().includes(term) ||
          vessel.mmsi?.toLowerCase?.().includes(term) ||
          vessel.callSign?.toLowerCase?.().includes(term) ||
          vessel.operator?.toLowerCase?.().includes(term) ||
          row.berthingNumber?.toLowerCase().includes(term);

        if (matches) vesselMap.set(vessel._id, vessel);
      });

      return Array.from(vesselMap.values());
    },
    [existingRows]
  );

  const loadExisting = async () => {
    try {
      const data = await fetchTerminalBerthings({
        vesselSearch: "",
        generalSearch: "",
        country: "",
        portCode: "",
        limit: 200,
      });
      setExistingRows(data.results || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadExisting();
  }, []);

  useEffect(() => {
    const search = async () => {
      const query = vesselQuery.trim();

      if (!query) {
        setVesselResults([]);
        return;
      }

      const localResults = getLocalVesselMatches(query);

      if (localResults.length > 0) {
        setVesselResults(localResults);
        return;
      }

      try {
        const results = await searchVessels(query);
        setVesselResults(normalizeVesselResults(results));
      } catch (error) {
        console.error("Vessel search failed:", error);
        setVesselResults(localResults);
      }
    };

    const timer = setTimeout(search, 500);
    return () => clearTimeout(timer);
  }, [vesselQuery, getLocalVesselMatches]);

  const updateVesselField = (field, value) => {
    setVesselForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateFlagCountry = (value) => {
    const matchedCode = flagLookup[value.trim().toLowerCase()] || "";
    setVesselForm((prev) => ({
      ...prev,
      flagCountry: value,
      flagCode: matchedCode,
    }));
  };

  const handleAttachImage = async (file) => {
    if (!file) return;

    try {
      setUploadingImage(true);
      setImageFileName(file.name);

      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setVesselForm((prev) => ({
        ...prev,
        vesselImage: res.data.imageUrl || "",
      }));
    } catch (error) {
      console.error(error);
      alert("Failed to upload image.");
      setImageFileName("");
      setVesselForm((prev) => ({ ...prev, vesselImage: "" }));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateVessel = async () => {
    try {
      setSubmitting(true);

      const created = await createVessel({
        ...vesselForm,
        flagCode: vesselForm.flagCode.toLowerCase(),
        grossTonnage: Number(vesselForm.grossTonnage || 0),
        deadweightTonnage: Number(vesselForm.deadweightTonnage || 0),
        lengthOverall: Number(vesselForm.lengthOverall || 0),
        beam: Number(vesselForm.beam || 0),
        yearBuilt: vesselForm.yearBuilt ? Number(vesselForm.yearBuilt) : null,
      });

      const newVessel = Array.isArray(created)
        ? created[0]
        : created?.vessel || created?.data || created;

      if (!newVessel?._id) {
        throw new Error("Created vessel response was not in the expected format.");
      }

      setSelectedVessel(newVessel);
      setVesselQuery(newVessel.vesselName || "");
      setVesselResults((prev) => {
        const withoutDuplicate = (prev || []).filter((item) => item._id !== newVessel._id);
        return [newVessel, ...withoutDuplicate];
      });

      setVesselForm(initialVesselForm);
      setImageFileName("");
      await loadExisting();

      alert("Vessel created successfully.");
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to create vessel.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVessel = async (vessel) => {
    if (!vessel?._id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete vessel "${vessel.vesselName}"?`
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);
      await deleteVessel(vessel._id);

      if (selectedVessel?._id === vessel._id) {
        setSelectedVessel(null);
        setVesselQuery("");
      }

      setVesselResults((prev) => prev.filter((item) => item._id !== vessel._id));
      await loadExisting();

      alert("Vessel deleted successfully.");
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to delete vessel.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-custom-blue">
            Admin
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
            Terminal Berthing Management
          </h1>
          <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-600">
            Search for an existing vessel first. If it does not exist, create the vessel.
            Selecting a vessel will open a dedicated page to create or manage berth schedules.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionCard
            eyebrow="Step 1"
            title="Search Existing Vessel"
            description="Find a vessel by vessel name, IMO, MMSI, call sign, or berthing number before creating a new one."
            rightContent={
              selectedVessel ? (
                <div className="min-w-[230px] rounded-2xl border border-custom-blue/20 bg-gradient-to-r from-blue-50 to-slate-50 px-4 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-custom-blue">
                    Selected Vessel
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {selectedVessel.vesselName}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    IMO: {selectedVessel.imo || "—"} | MMSI: {selectedVessel.mmsi || "—"}
                  </div>
                </div>
              ) : null
            }
          >
            <input
              value={vesselQuery}
              onChange={(e) => setVesselQuery(e.target.value)}
              placeholder="Search vessel name, IMO, MMSI, call sign or berthing number"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-custom-blue"
            />

            <div className="mt-3 space-y-2">
              {topVesselResults.map((vessel) => (
                <div
                  key={vessel._id}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                >
                  <div className="text-xs font-semibold text-slate-900">
                    {vessel.vesselName}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-600">
                    IMO: {vessel.imo || "—"} | MMSI: {vessel.mmsi || "—"} | Type: {vessel.vesselType || "—"}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/admin/terminal-berthing/${vessel._id}/schedule`, {
                          state: { vessel },
                        })
                      }
                      className="rounded-lg border border-custom-blue px-2.5 py-1 font-medium text-custom-blue transition hover:bg-blue-50"
                    >
                      Select
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteVessel(vessel)}
                      disabled={submitting}
                      className="rounded-lg border border-red-200 px-2.5 py-1 font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete Vessel
                    </button>
                  </div>
                </div>
              ))}

              {!topVesselResults.length && vesselQuery.trim() ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-500">
                  No vessel found for that search.
                </div>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setVesselQuery("");
                  setVesselResults([]);
                  setSelectedVessel(null);
                }}
                className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear Search
              </button>
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Step 2"
            title="Create New Vessel"
            description="Only create a new vessel if it cannot be found in the search."
          >
            <div className="grid gap-2.5 md:grid-cols-2">
              <Input
                label="Vessel Name"
                value={vesselForm.vesselName}
                onChange={(value) => updateVesselField("vesselName", value)}
                compact
              />

              <Select
                label="Vessel Type"
                value={vesselForm.vesselType}
                onChange={(value) => updateVesselField("vesselType", value)}
                options={VESSEL_TYPE_OPTIONS}
                placeholder="Select vessel type"
                compact
              />

              <FlagCountryAutocomplete
                value={vesselForm.flagCountry}
                onChange={updateFlagCountry}
                onSelectSuggestion={updateFlagCountry}
                compact
              />

              <Input
                label="Flag Code"
                value={vesselForm.flagCode}
                onChange={(value) => updateVesselField("flagCode", value.toLowerCase())}
                disabled
                compact
              />

              <Input
                label="IMO"
                value={vesselForm.imo}
                onChange={(value) => updateVesselField("imo", value)}
                compact
              />

              <Input
                label="MMSI"
                value={vesselForm.mmsi}
                onChange={(value) => updateVesselField("mmsi", value)}
                compact
              />

              <Input
                label="Call Sign"
                value={vesselForm.callSign}
                onChange={(value) => updateVesselField("callSign", value)}
                compact
              />

              <Input
                label="Operator / Shipping Line"
                value={vesselForm.operator}
                onChange={(value) => updateVesselField("operator", value)}
                compact
              />

              <Input
                label="Gross Tonnage"
                value={vesselForm.grossTonnage}
                onChange={(value) => updateVesselField("grossTonnage", value)}
                type="number"
                compact
              />

              <Input
                label="Deadweight Tonnage"
                value={vesselForm.deadweightTonnage}
                onChange={(value) => updateVesselField("deadweightTonnage", value)}
                type="number"
                compact
              />

              <Input
                label="Length Overall"
                value={vesselForm.lengthOverall}
                onChange={(value) => updateVesselField("lengthOverall", value)}
                type="number"
                compact
              />

              <Input
                label="Beam"
                value={vesselForm.beam}
                onChange={(value) => updateVesselField("beam", value)}
                type="number"
                compact
              />

              <Input
                label="Year Built"
                value={vesselForm.yearBuilt}
                onChange={(value) => updateVesselField("yearBuilt", value)}
                type="number"
                compact
              />

              <div className="md:col-span-2">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Vessel Image
                </label>
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleAttachImage(e.target.files?.[0])}
                    className="block w-full text-xs text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-custom-blue file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:opacity-90"
                  />
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    {uploadingImage
                      ? "Uploading image..."
                      : imageFileName
                      ? `Attached: ${imageFileName}`
                      : "Attach a vessel image file."}
                  </p>

                  {vesselForm.vesselImage ? (
                    <div className="mt-2">
                      <img
                        src={vesselForm.vesselImage}
                        alt="Vessel preview"
                        className="h-24 w-40 rounded-lg border border-slate-200 object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                Vessel Description
              </label>
              <textarea
                value={vesselForm.vesselDescription}
                onChange={(e) => updateVesselField("vesselDescription", e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-custom-blue"
              />
            </div>

            <button
              onClick={handleCreateVessel}
              disabled={submitting || uploadingImage}
              className="mt-4 rounded-xl bg-custom-blue px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {uploadingImage ? "Uploading Image..." : "Create Vessel"}
            </button>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default TerminalBerthingAdminPage;