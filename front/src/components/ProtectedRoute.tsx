import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { LoadingSpinner } from "./LoadingSpinner";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const accessToken = sessionStorage.getItem("accessToken");

        if (!accessToken) {
            setIsAuthenticated(false);
            return;
        }

        authService
            .verifyToken()
            .then(() => setIsAuthenticated(true))
            .catch(() => {
                sessionStorage.removeItem("accessToken");
                sessionStorage.removeItem("user");
                setIsAuthenticated(false);
            });
    }, []);

    if (isAuthenticated === null) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
