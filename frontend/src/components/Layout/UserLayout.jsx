import { Outlet, useLocation } from "react-router-dom";
import Header from "../Common/Header";

const UserLayout = () => {
  const location = useLocation();

  // routes where header should NOT show
  const hideHeaderRoutes = [
    "/company-home",
    "/terminal-berthing",
  ];

  const shouldHideHeader = hideHeaderRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <>
      {!shouldHideHeader && <Header />}

      <main>
        <Outlet />
      </main>
    </>
  );
};

export default UserLayout;