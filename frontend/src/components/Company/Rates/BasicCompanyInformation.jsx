import { useMemo, useState } from "react";
import SaveBar from "../Common/SaveBar";

const PORT_CODES = {
  ZADUR: ["Durban", "Pier 1", "Pier 2", "Maydon Wharf"],
  ZACPT: ["Cape Town"],
  ZAZBA: ["Ngqura"],
  ZAPLZ: ["Port Elizabeth"],
  ZARCB: ["Richards Bay"],
  MZMPM: ["Maputo"], MZBEW: ["Beira"], MZMNC: ["Nacala"],
  NAWVB: ["Walvis Bay"], NALUD: ["Luderitz"],
  TZDAR: ["Dar es Salaam"], TZTGT: ["Tanga"], TZMYW: ["Mtwara"],
  AOLAD: ["Luanda"], AOLOB: ["Lobito"],
  MGTNR: ["Toamasina"], MUPLU: ["Port Louis"],
  CDMAT: ["Matadi"], ZMMPB: ["Mpulungu"],
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

const COUNTRY_CODES = {
  "South Africa": "+27", Mozambique: "+258", Namibia: "+264",
  Tanzania: "+255", Angola: "+244", Madagascar: "+261",
  Mauritius: "+230", "Democratic Republic of the Congo": "+243",
  Zambia: "+260", Botswana: "+267", Zimbabwe: "+263",
  Malawi: "+265", Eswatini: "+268", Lesotho: "+266",
  Seychelles: "+248", Comoros: "+269",
};

const SERVICE_MODES = ["Courier", "Trucking", "Both"];

const OPERATING_REGIONS = [
  "Gauteng", "KwaZulu-Natal", "Western Cape", "Eastern Cape",
  "Limpopo", "Mpumalanga", "North West", "Free State",
  "Northern Cape", "National", "Cross-Border SADC",
];

/* ── shared styles ── */
const card = "rounded-lg border border-slate-200 bg-white flex flex-col overflow-hidden";
const hdr  = "flex items-center gap-2 px-3 py-2 border-b border-slate-200 bg-slate-50 shrink-0";
const inp  = "h-[26px] w-full rounded border border-slate-200 bg-white px-2 text-[11px] text-slate-800 outline-none focus:border-custom-blue focus:ring-1 focus:ring-custom-blue/10 transition";
const sel  = `${inp} appearance-none cursor-pointer`;
const lbl  = "text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap";
const row  = "grid grid-cols-[100px_1fr] items-center gap-2";

const HDR = ({ color = "#000042", title }) => (
  <div className={hdr}>
    <div className="w-0.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.1em]">{title}</span>
  </div>
);

const Row = ({ label, children, align = "center" }) => (
  <div className={`grid grid-cols-[100px_1fr] gap-2`} style={{ alignItems: align }}>
    <div className={lbl}>{label}</div>
    <div>{children}</div>
  </div>
);

export default function BasicCompanyInformation() {
  const [isDirty, setDirty] = useState(false);
  const dirty = () => { if (!isDirty) setDirty(true); };

  const [d, setD] = useState({
    companyName: "", tradingName: "", headquarters: "",
    description: "", website: "", country: "South Africa",
    email: "", telephone: "", fax: "",
    addressLine1: "", addressLine2: "", suburb: "",
    city: "", province: "", postalCode: "",
    serviceMode: "Courier", vatNumber: "", regNumber: "",
    insuranceProvider: "", insurancePolicyNumber: "",
    primaryContact: "", primaryContactTitle: "",
    operatingRegions: [],
    trackingAvailable: true, weekendDelivery: false,
    dangerousGoods: false, temperatureControlled: false,
    fragileGoods: true, insuranceIncluded: false,
  });

  const set = (field, value) => {
    setD((p) => ({ ...p, [field]: value }));
    dirty();
  };

  const toggleRegion = (r) => {
    setD((p) => ({
      ...p,
      operatingRegions: p.operatingRegions.includes(r)
        ? p.operatingRegions.filter((x) => x !== r)
        : [...p.operatingRegions, r],
    }));
    dirty();
  };

  const companyCode = useMemo(() => {
    if (!d.companyName) return "";
    const words = d.companyName.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(" ").filter(Boolean);
    const prefix = words.length === 1
      ? words[0].slice(0, 4).toUpperCase()
      : words.map((w) => w[0]).join("").slice(0, 4).toUpperCase();
    return `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
  }, [d.companyName]);

  const portCode = useMemo(() => {
    const hq = d.headquarters.toLowerCase();
    for (const [code, cities] of Object.entries(PORT_CODES)) {
      if (cities.find((c) => hq.includes(c.toLowerCase()))) return code;
    }
    return "";
  }, [d.headquarters]);

  const flag     = COUNTRY_FLAGS[d.country];
  const dialCode = COUNTRY_CODES[d.country];

  const Toggle = ({ field, label }) => (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-slate-600">{label}</span>
      <button
        type="button"
        onClick={() => set(field, !d[field])}
        className={`w-8 h-4 rounded-full transition-colors relative flex-shrink-0 ${d[field] ? "bg-custom-blue" : "bg-slate-200"}`}
      >
        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${d[field] ? "translate-x-4" : "translate-x-0.5"}`} />
      </button>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden" style={{ backgroundColor: "#f0f0ee" }}>
      <div className="flex-1 p-2.5 grid grid-cols-3 gap-2.5 overflow-hidden min-h-0">

        {/* ══════════════════════════════
            COL 1 — IDENTITY + CONTACT
        ══════════════════════════════ */}
        <div className="flex flex-col gap-2.5 min-h-0 overflow-hidden">

          {/* Identity */}
          <section className={`${card} flex-1`}>
            <HDR color="#000042" title="Company Identity" />
            <div className="p-2.5 space-y-2 flex-1">

              <Row label="Company Name">
                <div className="grid grid-cols-[1fr_72px] gap-1.5">
                  <input className={inp} value={d.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Registered name" />
                  <input className={`${inp} bg-slate-50 text-center text-slate-400 font-mono text-[9px]`} value={companyCode} readOnly title="Auto code" />
                </div>
              </Row>

              <Row label="Trading Name">
                <input className={inp} value={d.tradingName} onChange={(e) => set("tradingName", e.target.value)} placeholder="Trading as (if different)" />
              </Row>

              <Row label="Service Mode">
                <select className={sel} value={d.serviceMode} onChange={(e) => set("serviceMode", e.target.value)}>
                  {SERVICE_MODES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Row>

              <Row label="Country">
                <div className="relative">
                  <select className={`${sel} pl-7`} value={d.country} onChange={(e) => set("country", e.target.value)}>
                    {Object.keys(COUNTRY_FLAGS).map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <img src={flag} alt={d.country} className="absolute left-1.5 top-1/2 -translate-y-1/2 w-4 h-3 rounded-sm object-cover pointer-events-none" />
                </div>
              </Row>

              <Row label="Reg. Number">
                <input className={inp} value={d.regNumber} onChange={(e) => set("regNumber", e.target.value)} placeholder="Business reg. number" />
              </Row>

              <Row label="VAT Number">
                <input className={inp} value={d.vatNumber} onChange={(e) => set("vatNumber", e.target.value)} placeholder="VAT / Tax number" />
              </Row>

              <Row label="Description" align="start">
                <textarea
                  className="h-[48px] w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-800 outline-none resize-none focus:border-custom-blue transition"
                  value={d.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Brief company overview..."
                />
              </Row>

            </div>
          </section>

          {/* Contact */}
          <section className={`${card} flex-shrink-0`}>
            <HDR color="#2E7D32" title="Contact Details" />
            <div className="p-2.5 space-y-2">

              <Row label="Primary Contact">
                <div className="grid grid-cols-[80px_1fr] gap-1.5">
                  <input className={inp} value={d.primaryContactTitle} onChange={(e) => set("primaryContactTitle", e.target.value)} placeholder="Title" />
                  <input className={inp} value={d.primaryContact} onChange={(e) => set("primaryContact", e.target.value)} placeholder="Full name" />
                </div>
              </Row>

              <Row label="Email">
                <input className={inp} type="email" value={d.email} onChange={(e) => set("email", e.target.value)} placeholder="contact@company.com" />
              </Row>

              <Row label="Telephone">
                <div className="grid grid-cols-[60px_1fr] gap-1.5">
                  <div className="h-[26px] rounded border border-slate-200 bg-slate-50 px-1.5 flex items-center gap-1 text-[10px] text-slate-600">
                    <img src={flag} alt="" className="w-4 h-3 rounded-sm object-cover" />
                    <span className="font-mono">{dialCode}</span>
                  </div>
                  <input className={inp} value={d.telephone} onChange={(e) => set("telephone", e.target.value)} placeholder="Number" />
                </div>
              </Row>

              <Row label="Fax">
                <input className={inp} value={d.fax} onChange={(e) => set("fax", e.target.value)} placeholder="Fax number (optional)" />
              </Row>

              <Row label="Website">
                <input className={inp} value={d.website} onChange={(e) => set("website", e.target.value)} placeholder="https://www.company.com" />
              </Row>

            </div>
          </section>
        </div>

        {/* ══════════════════════════════
            COL 2 — ADDRESS + CAPABILITIES
        ══════════════════════════════ */}
        <div className="flex flex-col gap-2.5 min-h-0 overflow-hidden">

          {/* Physical Address */}
          <section className={`${card} flex-shrink-0`}>
            <HDR color="#000042" title="Physical Address" />
            <div className="p-2.5 space-y-2">

              <Row label="Headquarters">
                <div className="grid grid-cols-[1fr_68px] gap-1.5">
                  <input className={inp} value={d.headquarters} onChange={(e) => set("headquarters", e.target.value)} placeholder="City / port name" />
                  <input className={`${inp} bg-slate-50 text-center text-slate-400 font-mono text-[9px]`} value={portCode} readOnly title="Auto port code" />
                </div>
              </Row>

              <Row label="Address 1">
                <input className={inp} value={d.addressLine1} onChange={(e) => set("addressLine1", e.target.value)} placeholder="Street address" />
              </Row>

              <Row label="Address 2">
                <input className={inp} value={d.addressLine2} onChange={(e) => set("addressLine2", e.target.value)} placeholder="Suite / building (optional)" />
              </Row>

              <Row label="Suburb">
                <input className={inp} value={d.suburb} onChange={(e) => set("suburb", e.target.value)} placeholder="Suburb" />
              </Row>

              <Row label="City">
                <input className={inp} value={d.city} onChange={(e) => set("city", e.target.value)} placeholder="City" />
              </Row>

              <Row label="Province">
                <input className={inp} value={d.province} onChange={(e) => set("province", e.target.value)} placeholder="Province / state" />
              </Row>

              <Row label="Postal Code">
                <input className={inp} value={d.postalCode} onChange={(e) => set("postalCode", e.target.value)} placeholder="Postal code" />
              </Row>

            </div>
          </section>

          {/* Insurance */}
          <section className={`${card} flex-shrink-0`}>
            <HDR color="#2E7D32" title="Insurance" />
            <div className="p-2.5 space-y-2">

              <Row label="Provider">
                <input className={inp} value={d.insuranceProvider} onChange={(e) => set("insuranceProvider", e.target.value)} placeholder="Insurance company name" />
              </Row>

              <Row label="Policy No.">
                <input className={inp} value={d.insurancePolicyNumber} onChange={(e) => set("insurancePolicyNumber", e.target.value)} placeholder="Policy number" />
              </Row>

            </div>
          </section>

          {/* Service Capabilities */}
          <section className={`${card} flex-1`}>
            <HDR color="#B45309" title="Service Capabilities" />
            <div className="p-2.5 space-y-2">
              <Toggle field="trackingAvailable"    label="Live tracking available" />
              <Toggle field="weekendDelivery"       label="Weekend delivery" />
              <Toggle field="dangerousGoods"        label="Dangerous goods (DG) certified" />
              <Toggle field="temperatureControlled" label="Temperature controlled" />
              <Toggle field="fragileGoods"          label="Fragile goods handling" />
              <Toggle field="insuranceIncluded"     label="Insurance included in rate" />
            </div>
          </section>

        </div>

        {/* ══════════════════════════════
            COL 3 — REGIONS + PREVIEW
        ══════════════════════════════ */}
        <div className="flex flex-col gap-2.5 min-h-0 overflow-hidden">

          {/* Operating Regions */}
          <section className={`${card} flex-shrink-0`}>
            <HDR color="#000042" title="Operating Regions" />
            <div className="p-2.5">
              <div className="flex flex-wrap gap-1.5">
                {OPERATING_REGIONS.map((r) => {
                  const active = d.operatingRegions.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleRegion(r)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border transition
                        ${active
                          ? "text-white border-transparent"
                          : "border-slate-200 text-slate-500 hover:border-slate-300 bg-white"}`}
                      style={active ? { backgroundColor: "#000042" } : {}}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Live Preview */}
          <section className={`${card} flex-1`}>
            <div className={hdr}>
              <div className="w-0.5 h-3.5 rounded-full bg-amber-400 flex-shrink-0" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.1em] flex-1">Customer Preview</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-slate-400">Live</span>
              </div>
            </div>

            <div className="flex-1 p-2.5 overflow-hidden">
              <div className="rounded-lg border border-slate-200 bg-white h-full flex flex-col overflow-hidden">

                {/* Gradient strip */}
                <div className="h-0.5 w-full flex-shrink-0" style={{ background: "linear-gradient(90deg, #000042, #2E7D32)" }} />

                <div className="p-3 space-y-2 flex-1 overflow-hidden">

                  {/* Company header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[13px] font-bold text-slate-800 leading-tight">
                        {d.companyName || "Company Name"}
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                        {companyCode || "CODE-000"}
                      </div>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-[9px] font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: d.serviceMode === "Trucking" ? "#2E7D32" : "#000042" }}
                    >
                      {d.serviceMode}
                    </span>
                  </div>

                  {/* Location */}
                  {(d.city || d.headquarters) && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{d.city || d.headquarters}</span>
                      {portCode && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[9px] text-slate-500">{portCode}</span>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2 line-clamp-2">
                    {d.description || "Company description will appear here."}
                  </p>

                  {/* Capability badges */}
                  {(d.trackingAvailable || d.weekendDelivery || d.dangerousGoods || d.temperatureControlled || d.insuranceIncluded) && (
                    <div className="flex flex-wrap gap-1 border-t border-slate-100 pt-2">
                      {d.trackingAvailable    && <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-medium">Live tracking</span>}
                      {d.weekendDelivery      && <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[9px] font-medium">Weekend</span>}
                      {d.dangerousGoods       && <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 text-[9px] font-medium">DG certified</span>}
                      {d.temperatureControlled && <span className="px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 text-[9px] font-medium">Temp control</span>}
                      {d.insuranceIncluded    && <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-[9px] font-medium">Insured</span>}
                    </div>
                  )}

                  {/* Regions */}
                  {d.operatingRegions.length > 0 && (
                    <div className="border-t border-slate-100 pt-2">
                      <div className="text-[9px] text-slate-400 uppercase tracking-wide mb-1">Serves</div>
                      <div className="flex flex-wrap gap-1">
                        {d.operatingRegions.slice(0, 4).map((r) => (
                          <span key={r} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px]">{r}</span>
                        ))}
                        {d.operatingRegions.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 text-[9px]">+{d.operatingRegions.length - 4}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  <div className="border-t border-slate-100 pt-2 space-y-1">
                    {d.email && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{d.email}</span>
                      </div>
                    )}
                    {d.telephone && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{dialCode} {d.telephone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <img src={flag} alt={d.country} className="w-4 h-3 rounded-sm object-cover flex-shrink-0" />
                      <span>{d.country}</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {isDirty && (
        <SaveBar
          onSave={() => setDirty(false)}
          onSaveClose={() => setDirty(false)}
          onCancel={() => setDirty(false)}
        />
      )}
    </div>
  );
}