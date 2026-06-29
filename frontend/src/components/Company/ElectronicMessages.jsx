export function ElectronicMessages() {
  const messages = [
    {
      from: "System",
      subject: "Rate Update Notification",
      preview: "Courier rates updated for Durban routing rules...",
      time: "10:42",
      unread: true,
    },
    {
      from: "Ops Team",
      subject: "Routing Alert",
      preview: "Fallback route activated for ZACPT shipments...",
      time: "09:15",
      unread: false,
    },
    {
      from: "Billing System",
      subject: "Invoice Batch Completed",
      preview: "NET30 invoices generated successfully...",
      time: "Yesterday",
      unread: false,
    },
  ];

  const threads = [
    { sender: "System", message: "EDI connection established.", time: "10:40" },
    { sender: "You", message: "Monitoring active shipments.", time: "10:41" },
    { sender: "System", message: "No errors detected.", time: "10:42" },
  ];

  return (
    <div className="w-full h-full p-2">

      {/* =========================
          RESPONSIVE GRID WRAPPER
          MOBILE: 1 COL
          TABLET: 2 COL
          DESKTOP: 3 COL
      ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

        {/* =========================
            INBOX
        ========================= */}
        <section className="bg-white border rounded-md flex flex-col min-h-[320px]">

          <div className="px-3 py-2 border-b text-[11px] font-semibold uppercase bg-slate-50">
            Inbox
          </div>

          <div className="flex-1 overflow-y-auto">

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 border-b hover:bg-slate-50 ${
                  msg.unread ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex justify-between">
                  <span className="text-[10px] font-semibold">
                    {msg.from}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {msg.time}
                  </span>
                </div>

                <div className="text-[10px] font-medium">
                  {msg.subject}
                </div>

                <div className="text-[9px] text-slate-500 truncate">
                  {msg.preview}
                </div>
              </div>
            ))}

          </div>

        </section>

        {/* =========================
            THREAD (FULL HEIGHT SAFE)
        ========================= */}
        <section className="bg-white border rounded-md flex flex-col min-h-[320px]">

          <div className="px-3 py-2 border-b text-[11px] font-semibold uppercase bg-slate-50">
            Message Thread
          </div>

          <div className="flex-1 p-2 space-y-2 overflow-y-auto bg-slate-50">

            {threads.map((t, i) => (
              <div
                key={i}
                className={`max-w-[85%] p-2 rounded-md text-[10px] ${
                  t.sender === "You"
                    ? "ml-auto bg-blue-600 text-white"
                    : "bg-white border"
                }`}
              >
                <div className="text-[9px] opacity-70 mb-1">
                  {t.sender} • {t.time}
                </div>
                {t.message}
              </div>
            ))}

          </div>

          <div className="border-t p-2 flex gap-2">

            <input
              className="flex-1 h-[30px] border rounded-md px-2 text-[10px]"
              placeholder="Type message..."
            />

            <button className="px-3 h-[30px] bg-blue-600 text-white text-[10px] rounded-md">
              Send
            </button>

          </div>

        </section>

        {/* =========================
            SETTINGS PANEL
        ========================= */}
        <section className="bg-white border rounded-md flex flex-col min-h-[320px]">

          <div className="px-3 py-2 border-b text-[11px] font-semibold uppercase bg-slate-50">
            Integration Settings
          </div>

          <div className="p-2 space-y-2 overflow-y-auto">

            <div className="text-[10px] font-semibold text-slate-600">
              EDI Configuration
            </div>

            <input className="h-[28px] w-full border rounded-md px-2 text-[10px]" placeholder="EDI Enabled" />
            <input className="h-[28px] w-full border rounded-md px-2 text-[10px]" placeholder="Message Format" />
            <input className="h-[28px] w-full border rounded-md px-2 text-[10px]" placeholder="Endpoint URL" />

            <div className="text-[10px] font-semibold text-slate-600 pt-2">
              Notifications
            </div>

            <input className="h-[28px] w-full border rounded-md px-2 text-[10px]" placeholder="Email Alerts" />
            <input className="h-[28px] w-full border rounded-md px-2 text-[10px]" placeholder="SMS Alerts" />
            <input className="h-[28px] w-full border rounded-md px-2 text-[10px]" placeholder="Webhook URL" />

          </div>

        </section>

      </div>

    </div>
  );
}