import { useState } from "react";
import CompanyTopBar from "../../components/Company/Common/CompanyTopBar";
import ToolBar from "../../components/Company/Common/ToolBox";
import Filter from "../../components/Company/Common/Filter";

const ServiceRate = () => {
  const [showFilter, setShowFilter] = useState(true);
  const [rows, setRows] = useState([
    { id: "1", label: "Service", shortValue: "", longValue: "" },
    { id: "2", label: "Region", shortValue: "", longValue: "" },
    { id: "3", label: "Branch", shortValue: "", longValue: "" },
  ]);

  const handleShortChange = (id, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, shortValue: value } : row
      )
    );
  };

  const handleLongChange = (id, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, longValue: value } : row
      )
    );
  };

  const handleRemove = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#dcdcdc]">
      <CompanyTopBar homeLink="/company-home" />
      <ToolBar
        showFilter={showFilter}
        onToggleFilter={() => setShowFilter((prev) => !prev)}
      />

      {showFilter && (
        <Filter
          rows={rows}
          setRows={setRows}
          onShortChange={handleShortChange}
          onLongChange={handleLongChange}
          onRemove={handleRemove}
        />
      )}
    </div>
  );
};

export default ServiceRate;