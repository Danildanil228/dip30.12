import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { LoadingSpinner } from './LoadingSpinner';

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { isAdmin, loading } = useUser();
        if (loading) {
        return <LoadingSpinner />;
    }
    if (!isAdmin) {
        return <Navigate to="/main" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;