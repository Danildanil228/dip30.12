import { useState, useEffect } from 'react';

interface User {
    id: number;
    username: string;
    role: string;
    name: string;
    secondname: string;
}

export const useUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error('Ошибка при парсинге user из localStorage:', error);
            }
        }
        setLoading(false);
    }, []);

    const isAdmin = user?.role === 'admin';

    return { user, loading, isAdmin };
};