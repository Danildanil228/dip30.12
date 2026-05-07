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
        const checkAuth = async () => {
            const accessToken = sessionStorage.getItem("accessToken");

            if (!accessToken) {
                setIsAuthenticated(false);
                return;
            }

            try {
                const result = await authService.verifyToken();
                if (result.valid) {
                    setIsAuthenticated(true);
                } else {
                    authService.clearSession();
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error("Auth check error:", error);
                authService.clearSession();
                setIsAuthenticated(false);
            }
        };

        checkAuth();
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
