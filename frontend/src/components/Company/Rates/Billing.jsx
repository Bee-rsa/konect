export function Billing() {
  return (
    <div className="grid grid-cols-3 gap-3 p-2">

      {/* =========================
          INVOICE SETUP
      ========================= */}
      <section className="rounded-md border border-slate-200 bg-white shadow-sm flex flex-col">

        <div className="border-b border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 bg-slate-50">
          Invoice Setup
        </div>

        <div className="p-2 space-y-2">

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Billing Cycle"
          />

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Invoice Format"
          />

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Tax Rule"
          />

        </div>
      </section>

      {/* =========================
          PAYMENT TERMS
      ========================= */}
      <section className="rounded-md border border-slate-200 bg-white shadow-sm flex flex-col">

        <div className="border-b border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 bg-slate-50">
          Payment Terms
        </div>

        <div className="p-2 space-y-2">

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Net 7 / 14 / 30"
          />

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Late Fee %"
          />

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Credit Limit"
          />

        </div>
      </section>

      {/* =========================
          BANKING DETAILS
      ========================= */}
      <section className="rounded-md border border-slate-200 bg-white shadow-sm flex flex-col">

        <div className="border-b border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 bg-slate-50">
          Banking Details
        </div>

        <div className="p-2 space-y-2">

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Bank Name"
          />

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Account Number"
          />

          <input
            className="h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Branch Code"
          />

        </div>
      </section>

    </div>
  );
}