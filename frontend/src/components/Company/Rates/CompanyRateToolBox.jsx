import { useState } from "react";

/* =========================
   REAL COMPONENTS
========================= */
import CompanyRate from "./CompanyRate";
import BasicCompanyInformation from "./BasicCompanyInformation";
import { AdditionalDetails } from "./AdditionalDetails";
import { Routing } from "./Routing";
import { ElectronicMessages } from "../ElectronicMessages";
import { Billing } from "./Billing";
import { Edocs } from "./";
import { Notes } from "./Notes";
import { Logs } from "./Logs";

/* =========================
   MODULE LIST
========================= */
const items = [
  { label: "Basic Company Information", key: "basic" },
  { label: "Additional Details", key: "details" },
  { label: "Rates", key: "rates" },
  { label: "Routing", key: "routing" },
  { label: "Electronic Messages", key: "messages" },
  { label: "Billing", key: "billing" },
  { label: "eDocs", key: "edocs" },
  { label: "Notes", key: "notes" },
  { label: "Logs", key: "logs" },
];

/* =========================
   COMPONENT MAPPING
========================= */
const componentMap = {
  basic: BasicCompanyInformation,
  details: AdditionalDetails,
  rates: CompanyRate,
  routing: Routing,
  messages: ElectronicMessages,
  billing: Billing,
  edocs: Edocs,
  notes: Notes,
  logs: Logs,
};

/* fallback */
const Fallback = () => (
  <div className="p-3 text-slate-400 text-[11px]">
    No module found
  </div>
);

/* =========================
   MAIN TOOL SWITCHER
========================= */
export default function CompanyRateToolBox() {
  const [active, setActive] = useState("basic");

  const ActiveComponent =
    componentMap[active] || Fallback;

  return (
    <div className="w-full bg-slate-100 text-[10px] text-slate-600 px-2 py-1">

      {/* =========================
          NAV BAR
      ========================= */}
      <div className="whitespace-nowrap overflow-x-auto pb-1">

        {items.map((item, index) => (
          <span key={item.key}>
            <button
              onClick={() => setActive(item.key)}
              className={`hover:text-slate-900 transition ${
                active === item.key
                  ? "text-slate-900 font-semibold"
                  : ""
              }`}
            >
              {item.label}
            </button>

            {index !== items.length - 1 && (
              <span className="mx-2 text-slate-400">
                |
              </span>
            )}
          </span>
        ))}

      </div>

      {/* =========================
          ACTIVE MODULE VIEW
      ========================= */}
      <div className="mt-3">
        <ActiveComponent />
      </div>

    </div>
  );
}