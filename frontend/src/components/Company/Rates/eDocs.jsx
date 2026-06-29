export function Edocs() {
  return (
    <div className="grid grid-cols-2 gap-3 p-2">

      {/* =========================
          DOCUMENT RULES
      ========================= */}
      <section className="rounded-md border border-slate-200 bg-white shadow-sm flex flex-col">

        <div className="border-b border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 bg-slate-50">
          Document Rules
        </div>

        <div className="p-2 space-y-2">

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Allowed File Types"
          />

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Max File Size (MB)"
          />

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Retention Period"
          />

        </div>
      </section>

      {/* =========================
          STORAGE SETTINGS
      ========================= */}
      <section className="rounded-md border border-slate-200 bg-white shadow-sm flex flex-col">

        <div className="border-b border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 bg-slate-50">
          Storage
        </div>

        <div className="p-2 space-y-2">

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Cloud Provider"
          />

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Folder Structure Rule"
          />

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Archive Policy"
          />

        </div>
      </section>

    </div>
  );
}