export function Logs() {
  const logs = [
    "Company created",
    "Rates updated",
    "Routing changed",
    "Billing cycle updated",
    "eDocs configuration saved",
    "Additional details modified",
    "User login detected",
    "System sync completed",
  ];

  return (
    <div className="p-2">

      {/* =========================
          SYSTEM LOGS
      ========================= */}
      <section className="rounded-md border border-slate-200 bg-white shadow-sm flex flex-col">

        <div className="border-b border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 bg-slate-50">
          System Logs
        </div>

        <div className="p-2 max-h-[400px] overflow-y-auto space-y-1">

          {logs.map((log, i) => (
            <div
              key={i}
              className="text-[10px] border-b border-slate-100 py-1 text-slate-600 flex items-start gap-2"
            >
              <span className="text-slate-400">•</span>
              <span>{log}</span>
            </div>
          ))}

        </div>

      </section>

    </div>
  );
}