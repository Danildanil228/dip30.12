import React from 'react';
import DesktopNavigation from './DesktopNavigation';
import MobileNavigation from './MobileNavigation';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout: React.FC = () => {
    return (
        <div className="min-h-screen ">
            <Header/>
            <DesktopNavigation />
            <main className="container">
                <Outlet /> 
            </main>
            <MobileNavigation />
        </div>
    );
};

export default Layout;