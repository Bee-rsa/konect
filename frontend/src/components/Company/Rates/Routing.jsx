export function Routing() {
  return (
    <div className="grid grid-cols-3 gap-3 p-2">

      <section className="rounded-md border border-slate-200 bg-white shadow-sm flex flex-col">
        <div className="border-b border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 bg-slate-50">
          Origin Rules
        </div>

        <div className="p-2 space-y-2">
          <input className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px]" placeholder="Default Origin Port" />
          <input className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px]" placeholder="Allowed Origins" />
          <input className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px]" placeholder="Blocked Origins" />
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white shadow-sm flex flex-col">
        <div className="border-b border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 bg-slate-50">
          Routing Logic
        </div>

        <div className="p-2 space-y-2">
          <input className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px]" placeholder="Auto Route Enable (Yes/No)" />
          <input className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px]" placeholder="Preferred Carrier" />
          <input className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px]" placeholder="Fallback Route" />
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white shadow-sm flex flex-col">
        <div className="border-b border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 bg-slate-50">
          Destination Rules
        </div>

        <div className="p-2 space-y-2">
          <input className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px]" placeholder="Allowed Countries" />
          <input className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px]" placeholder="Restricted Zones" />
          <input className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px]" placeholder="Priority Destinations" />
        </div>
      </section>

    </div>
  );
}