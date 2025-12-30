import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { API_BASE_URL } from '@/components/api';
import axios from 'axios';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setIsAuthenticated(false);
            return;
        }

        // Проверяем токен
        axios.get(`${API_BASE_URL}/verifyToken`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => setIsAuthenticated(true))
        .catch(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
        });
    }, []);

    // Пока проверяем
    if (isAuthenticated === null) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Если не авторизован - на логин
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Если авторизован - показываем содержимое
    return <>{children}</>;
};

export default ProtectedRoute;