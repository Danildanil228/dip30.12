import React from "react";
import DesktopNavigation from "./Navigation/DesktopNavigation";
import MobileNavigation from "./Navigation/MobileNavigation";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout: React.FC = () => {
  return (
    <div className="relative min-h-screen pb-20">
      <Header />
      <DesktopNavigation />
      <main className="container">
        <Outlet />
      </main>
      <MobileNavigation />
    </div>
  );
};

export default Layout;