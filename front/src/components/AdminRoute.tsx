import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { isAdmin, loading } = useUser();
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2"></div>
            </div>
        );
    }
    if (!isAdmin) {
        return <Navigate to="/main" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;