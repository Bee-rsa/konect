export function AdditionalDetails() {
  return (
    <div className="grid grid-cols-2 gap-3 p-2">

      {/* =========================
          COMPANY PROFILE
      ========================= */}
      <section className="rounded-md border border-slate-200 bg-white shadow-sm flex flex-col">
        
        <div className="border-b border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 bg-slate-50">
          Company Profile
        </div>

        <div className="p-2 space-y-2">

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Registration Number"
          />

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="VAT Number"
          />

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Tax Status"
          />

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Industry Type"
          />

        </div>
      </section>

      {/* =========================
          OPERATIONAL INFO
      ========================= */}
      <section className="rounded-md border border-slate-200 bg-white shadow-sm flex flex-col">

        <div className="border-b border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 bg-slate-50">
          Operational Info
        </div>

        <div className="p-2 space-y-2">

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Operating Hours"
          />

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Service Coverage Area"
          />

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Fleet Size"
          />

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Warehouse Capacity"
          />

        </div>
      </section>

    </div>
  );
}