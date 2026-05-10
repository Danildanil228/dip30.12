import React from "react";
import DesktopNavigation from "./Navigation/DesktopNavigation";
import MobileNavigation from "./Navigation/MobileNavigation";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";

const Layout: React.FC = () => {
    const location = useLocation();
    const isAuthPage = location.pathname === "/login" || location.pathname === "/";

    return (
        <div className="relative min-h-screen flex flex-col">
            <Header />
            <DesktopNavigation />
            <main className="container flex-1">
                <Outlet />
            </main>
            {!isAuthPage && <Footer />}
            <MobileNavigation />
        </div>
    );
};

export default Layout;