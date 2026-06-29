import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  PlusSquare,
  Pencil,
  Copy,
  UserX,
  Settings2,
  FilterX,
  Filter,
} from "lucide-react";

const ToolBox = ({ showFilter = true, onToggleFilter }) => {
  const navigate = useNavigate();

  const handleAction = (action) => {
    switch (action) {
      case "view":
        console.log("View clicked");
        break;
      case "new":
        navigate("/new-service");
        break;
      case "edit":
        console.log("Edit clicked");
        break;
      case "copy":
        console.log("Copy clicked");
        break;
      case "deactivate":
        console.log("Deactivate clicked");
        break;
      case "actions":
        console.log("Actions clicked");
        break;
      case "toggle-filter":
        if (onToggleFilter) onToggleFilter();
        break;
      default:
        break;
    }
  };

  const toolbarItems = [
    { label: "View", icon: Eye, action: "view" },
    { label: "New", icon: PlusSquare, action: "new" },
    { label: "Edit", icon: Pencil, action: "edit" },
    { label: "Copy", icon: Copy, action: "copy" },
    { label: "Deactivate", icon: UserX, action: "deactivate" },
    { label: "Actions", icon: Settings2, action: "actions" },
    {
      label: showFilter ? "Hide Filter" : "Show Filter",
      icon: showFilter ? FilterX : Filter,
      action: "toggle-filter",
    },
  ];

  return (
    <div className="relative z-40 w-full bg-custom-blue text-white">
      <div className="flex min-h-[36px] items-center gap-4 px-4 sm:px-6">
        {toolbarItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleAction(item.action)}
              className="flex items-center gap-1 py-2 text-[11px] font-medium transition hover:opacity-80 sm:text-xs md:text-[12px]"
            >
              <Icon size={13} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

ToolBox.propTypes = {
  showFilter: PropTypes.bool,
  onToggleFilter: PropTypes.func,
};

export default ToolBox;