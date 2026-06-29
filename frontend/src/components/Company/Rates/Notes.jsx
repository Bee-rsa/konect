export function Notes() {
  return (
    <div className="p-2">

      {/* =========================
          INTERNAL NOTES
      ========================= */}
      <section className="rounded-md border border-slate-200 bg-white shadow-sm flex flex-col">

        <div className="border-b border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 bg-slate-50">
          Internal Notes
        </div>

        <div className="p-2">

          <textarea
            className="w-full min-h-[160px] rounded-md border border-slate-200 p-2 text-[10px] outline-none focus:border-blue-500"
            placeholder="Write internal company notes..."
          />

        </div>

      </section>

    </div>
  );
}