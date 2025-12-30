import React from 'react';
import DesktopNavigation from './DesktopNavigation';
import MobileNavigation from './MobileNavigation';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
    return (
        <div className="min-h-screen pb-16 lg:pb-0">
            
            <DesktopNavigation />
            <main className="container p-4 lg:p-6">
                <Outlet /> 
            </main>
            <MobileNavigation />
        </div>
    );
};

export default Layout;