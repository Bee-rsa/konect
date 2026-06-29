import { useEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { Toaster, toast } from "sonner";

import store from "./redux/store";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import FirstTimeFlowGuard from "./components/Common/FirstTimeFlowGuard";
import { trackAnalyticsEvent } from "./utils/analytics";
import {
  updateLastActivity,
  forceLogoutForInactivity,
  clearSessionExpired,
} from "./redux/slices/authSlice";

import UserLayout from "./components/Layout/UserLayout";
import AdminLayout from "./components/Admin/AdminLayout";

import Home from "./pages/Home";
import UserHomePage from "./pages/UserHomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import About from "./pages/About Konect/AboutCargoKonect";
import HelpCentre from "./pages/About Konect/HelpCenter";
import PrivacyPolicy from "./pages/About Konect/PrivacyPolicy";
import CompanyTermsAndConditions from "./pages/About Konect/TermsAndConditions";
import TermsAcceptancePage from "./pages/TermsAndConditionsPage";
import WelcomePage from "./pages/WelcomePage";
import AdminHomePage from "./pages/AdminHomePage";
import CaseStudiesPage from "./pages/CaseStudiesPage";
import CaseStudyDetailsPage from "./pages/CaseStudyDetailsPage";
import WeightCalculator from "./pages/Resources/WeightCalculator";
import MarketForecast from "./pages/Resources/MArketForecast";
import TerminalBerthingPage from "./pages/Konect Core/TerminalBerthingPage";
import VesselDetailsPage from "./pages/VesselDetailsPage";
import QuoteResultsPage from "./pages/QuoteResultsPage";

import Ride from "./pages/Ride";
import KonectRide from "./pages/KonectRide";
import RideTracking from "./pages/RideTracking";
import Cargo from "./pages/Cargo";
import KonectCargo from "./pages/KonectCargo";

import UserManagement from "./components/Admin/UserManagement";
import CaseStudyForm from "./components/Form/CaseStudyForm";
import AdminCaseStudiesPage from "./components/Admin/AdminCaseStudiesPage";
import TerminalBerthingAdminPage from "./components/Admin/TerminalBerthingAdminPage";
import TerminalBerthingSchedulePage from "./components/Admin/TerminalBerthingSchedulePage";
import AdminNotificationsPage from "./components/Admin/AdminNotificationsPage";
import AdminDrivers from "./components/Admin/AdminDrivers";


import CompanyHomePage from "./pages/Konect Core/CompanyHomePage";
import CompanyLogin from "./pages/Konect Core/CompanyLogin";
import CompanyRegister from "./pages/Konect Core/CompanyRegister";
import MasterPage from "./pages/Konect Core/MasterPage";
import ServiceRate from "./pages/Konect Core/ServiceRate";
import NewServiceRate from "./pages/Konect Core/NewServiceRate";

import DriverRegister          from "./pages/Driver/DriverRegister";
import DriverRegisterVehicle   from "./pages/Driver/DriverRegisterVehicle";
import DriverRegisterDocuments from "./pages/Driver/DriverRegisterDocuments";
import DriverRegisterBank      from "./pages/Driver/DriverRegisterBank";
import DriverRegisterPending   from "./pages/Driver/DriverRegisterPending";
import DriverLogin from "./pages/Driver/DriverLogin";
import DriverHome  from "./pages/Driver/DriverHome";
import DriverEarnings  from "./pages/Driver/DriverEarnings";
import DriverLiftClubs from "./pages/Driver/DriverLiftsClub";
import DriverProfile   from "./pages/Driver/DriverProfile";

import LiftClubSearch      from "./pages/LiftClubSearch";
import LiftClubResults     from "./pages/LiftClubResults";
import LiftClubDetail      from "./pages/LiftClubDetails";
import LiftClubRequestSent from "./pages/LiftClubRequestSent";


const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const SessionWatcher = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, sessionExpired } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) return;

    const shouldLogoutForInactivity = () => {
      const lastActivityAt = Number(localStorage.getItem("lastActivityAt") || 0);
      const now = Date.now();

      return !!lastActivityAt && now - lastActivityAt >= INACTIVITY_LIMIT_MS;
    };

    const logoutAndRedirect = () => {
      dispatch(forceLogoutForInactivity());
    };

    const handleActivity = () => {
      if (shouldLogoutForInactivity()) {
        logoutAndRedirect();
        return;
      }

      dispatch(updateLastActivity());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && shouldLogoutForInactivity()) {
        logoutAndRedirect();
      }
    };

    const handleWindowFocus = () => {
      if (shouldLogoutForInactivity()) {
        logoutAndRedirect();
      }
    };

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    const interval = setInterval(() => {
      if (shouldLogoutForInactivity()) {
        logoutAndRedirect();
      }
    }, 5000);

    if (shouldLogoutForInactivity()) {
      logoutAndRedirect();
    }

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      clearInterval(interval);
    };
  }, [dispatch, user]);

  useEffect(() => {
    if (!sessionExpired) return;

    if (location.pathname !== "/login") {
      toast.error("You were logged out after 30 minutes of inactivity.");
      navigate("/login", { replace: true });
    }

    dispatch(clearSessionExpired());
  }, [sessionExpired, navigate, dispatch, location.pathname]);

  return null;
};

const AppRoutes = () => {
  useEffect(() => {
    trackAnalyticsEvent({
      eventType: "visit",
      page: "app-entry",
    });
  }, []);

  return (
    <>
      <ScrollToTop />
      <SessionWatcher />

      <FirstTimeFlowGuard>
        <Routes>
          {/* PUBLIC ROUTES (NO LAYOUT) */}
          <Route path="/login" element={<Login />} />
          <Route path="/company-login" element={<CompanyLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/company-register" element={<CompanyRegister />} />

          <Route
            path="/welcome"
            element={
              <ProtectedRoute>
                <WelcomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/terms-acceptance"
            element={
              <ProtectedRoute>
                <TermsAcceptancePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/master"
            element={
              <ProtectedRoute>
                <MasterPage />
              </ProtectedRoute>
            }
          />

          {/* USER LAYOUT ROUTES */}
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Home />} />

            <Route
              path="user-home"
              element={
                <ProtectedRoute>
                  <UserHomePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="quote-results"
              element={
                <ProtectedRoute>
                  <QuoteResultsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="company-home"
              element={
                <ProtectedRoute>
                  <CompanyHomePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* DRIVER */}
            <Route path="/driver-register"            element={<DriverRegister />} />
            <Route path="/driver-register/vehicle"    element={<DriverRegisterVehicle />} />
            <Route path="/driver-register/documents"  element={<DriverRegisterDocuments />} />
            <Route path="/driver-register/bank"       element={<DriverRegisterBank />} />
            <Route path="/driver-register/pending"    element={<DriverRegisterPending />} />
            <Route path="/driver-login" element={<DriverLogin />} />
            <Route path="/driver-home"  element={<DriverHome />} />
            <Route path="/driver/earnings"   element={<DriverEarnings />} />
            <Route path="/driver/lift-clubs" element={<DriverLiftClubs />} />
            <Route path="/driver/profile"    element={<DriverProfile />} />

            <Route path="about-cargo-konect" element={<About />} />
            <Route path="help-centre" element={<HelpCentre />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms&conditions" element={<CompanyTermsAndConditions />} />
            <Route path="case-studies/:slug" element={<CaseStudyDetailsPage />} />
            <Route path="terminal-berthing" element={<TerminalBerthingPage />} />
            <Route
              path="terminal-berthing/vessel/:slug"
              element={<VesselDetailsPage />}
            />
          </Route>

          {/* OTHER PAGES */}
          <Route path="/weight-calculator" element={<WeightCalculator />} />
          <Route path="/market-forecast" element={<MarketForecast />} />
          <Route path="case-studies" element={<CaseStudiesPage />} />

          {/* RIDE */}
          <Route path="ride" element={<Ride />} />
          <Route path="/konect-ride" element={<KonectRide />} />
          <Route path="/ride-tracking" element={<RideTracking />} />

          {/* CARGO */}
          <Route path="cargo" element={<Cargo />} />
          <Route path="/konect-cargo" element={<KonectCargo />} />

          {/* COMPANY */}
          <Route path="/service-rate" element={<ServiceRate />} />
          <Route path="/new-service" element={<NewServiceRate />} />

          {/* LIFT CLUBS */}
          <Route path="/lift-clubs"              element={<LiftClubSearch />}      />
          <Route path="/lift-clubs/results"      element={<LiftClubResults />}     />
          <Route path="/lift-clubs/:id"          element={<LiftClubDetail />}      />
          <Route path="/lift-clubs/request-sent" element={<LiftClubRequestSent />} />
          
          
          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHomePage />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="case-studies" element={<AdminCaseStudiesPage />} />
            <Route path="case-studies/new" element={<CaseStudyForm />} />
            <Route path="terminal-berthing" element={<TerminalBerthingAdminPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="/admin/drivers" element={<AdminDrivers />} />
            <Route
              path="terminal-berthing/:vesselId/schedule"
              element={<TerminalBerthingSchedulePage />}
            />
          </Route>
        </Routes>
      </FirstTimeFlowGuard>
    </>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
};

export default App;

