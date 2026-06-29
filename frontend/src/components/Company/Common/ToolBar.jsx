import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const toolbarMenus = {
  File: [
    { label: "New", type: "action", action: "new" },
    { label: "Save", type: "action", action: "save" },
    { label: "Save & Close", type: "action", action: "save-close" },
    { label: "Delete", type: "action", action: "delete" },
    { label: "Reload this form", type: "action", action: "reload-form" },
    { label: "Close", type: "action", action: "close" },
  ],
  Edit: [
    { label: "Cut", type: "action", action: "cut" },
    { label: "Copy", type: "action", action: "copy" },
    { label: "Paste", type: "action", action: "paste" },
  ],
  View: [
    { label: "No options yet", type: "disabled" },
  ],
  "Electronic Messaging": [
    { label: "In-house", type: "action", action: "in-house" },
    { label: "Agents", type: "action", action: "agents" },
  ],
  Documents: [
    { label: "View", type: "action", action: "documents-view" },
    { label: "Logs", type: "action", action: "documents-logs" },
    { label: "Create Type", type: "action", action: "documents-create-type" },
  ],
  Help: [
    { label: "My account", type: "link", to: "/my-account" },
    { label: "Traning Academy", type: "link", to: "/training-academy" },
    { label: "Help Centre", type: "link", to: "/help-centre" },
    { label: "About", type: "link", to: "/about" },
  ],
};

const ToolBar = () => {
  const [openMenu, setOpenMenu] = useState("");
  const navigate = useNavigate();

  const handleMenuToggle = (menuName) => {
    setOpenMenu((prev) => (prev === menuName ? "" : menuName));
  };

  const handleAction = (action) => {
    setOpenMenu("");

    switch (action) {
      case "reload-form":
        window.location.reload();
        break;

      case "close":
        navigate("/company-home");
        break;

      default:
        console.log(`Toolbar action clicked: ${action}`);
        break;
    }
  };

  return (
    <div className="relative z-40 w-full bg-custom-blue text-white">
      <div className="flex min-h-[36px] items-center gap-4 px-4 sm:px-6">
        {Object.keys(toolbarMenus).map((menuName) => (
          <div key={menuName} className="relative">
            <button
              type="button"
              onClick={() => handleMenuToggle(menuName)}
              className={`flex items-center gap-1 border-b px-0 py-2 text-[11px] font-medium transition sm:text-xs md:text-[12px] ${
                openMenu === menuName ? "border-white" : "border-transparent"
              }`}
            >
              <span>{menuName}</span>
            </button>

            {openMenu === menuName && (
              <div className="absolute left-0 top-full z-[999] mt-1 min-w-[190px] rounded-md border border-slate-200 bg-white py-1 text-slate-800 shadow-lg">
                {toolbarMenus[menuName].map((item) => {
                  if (item.type === "link") {
                    return (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={() => setOpenMenu("")}
                        className="block px-4 py-2 text-[12px] transition hover:bg-slate-50"
                      >
                        {item.label}
                      </Link>
                    );
                  }

                  if (item.type === "disabled") {
                    return (
                      <div
                        key={item.label}
                        className="cursor-default px-4 py-2 text-[12px] text-slate-400"
                      >
                        {item.label}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleAction(item.action)}
                      className="block w-full px-4 py-2 text-left text-[12px] transition hover:bg-slate-50"
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolBar;