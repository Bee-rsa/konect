import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  fetchMyRates,
  saveCompanyProfile,
  clearSaveSuccess,
} from "../../redux/slices/companyRateSlice";

import CompanyTopBar    from "../../components/Company/Common/CompanyTopBar";
import ToolBar          from "../../components/Company/Common/ToolBar";
import CompanyRateToolBox from "../../components/Company/Rates/CompanyRateToolBox";
import SaveBar          from "../../components/Company/Common/SaveBar";

const NewServiceRate = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { saveSuccess, error } = useSelector((s) => s.companyRate);

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    dispatch(fetchMyRates());
  }, [dispatch]);

  useEffect(() => {
    if (saveSuccess) {
      setIsDirty(false);
      const t = setTimeout(() => dispatch(clearSaveSuccess()), 2500);
      return () => clearTimeout(t);
    }
  }, [saveSuccess, dispatch]);

  const handleSave = () => {
    dispatch(saveCompanyProfile({}));
  };

  const handleSaveClose = () => {
    dispatch(saveCompanyProfile({})).then(() => navigate("/company-home"));
  };

  const handleCancel = () => {
    setIsDirty(false);
    navigate("/company-home");
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[#dcdcdc] flex flex-col">

      <div className="shrink-0">
        <CompanyTopBar homeLink="/company-home" />
      </div>

      <div className="shrink-0">
        <ToolBar />
      </div>

      <div className="shrink-0">
        <CompanyRateToolBox />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {saveSuccess && (
          <div className="mb-2 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-[11px] rounded-md">
            Rates saved successfully.
          </div>
        )}
        {error && (
          <div className="mb-2 px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-[11px] rounded-md">
            {error}
          </div>
        )}
      </div>

      {isDirty && (
        <SaveBar
          onSave={handleSave}
          onSaveClose={handleSaveClose}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default NewServiceRate;