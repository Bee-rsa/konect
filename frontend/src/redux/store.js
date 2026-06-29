import { configureStore } from "@reduxjs/toolkit";
import authReducer       from "./slices/authSlice";
import adminReducer      from "./slices/adminSlice";
import caseStudyReducer  from "./slices/caseStudySlice";
import quoteReducer      from "./slices/quoteSlice";
import companyRateReducer from "./slices/companyRateSlice";
import driverReducer     from "./slices/driverSlice";
import liftClubReducer   from "./slices/liftClubSlice";   

const store = configureStore({
  reducer: {
    auth:        authReducer,
    admin:       adminReducer,
    caseStudies: caseStudyReducer,
    quotes:      quoteReducer,
    companyRate: companyRateReducer,
    driver:      driverReducer,
    liftClub:    liftClubReducer,                        
  },
});

export default store;