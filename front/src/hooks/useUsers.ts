import { useState, useCallback, useEffect } from 'react';
import { userService } from '@/services/userService';
import type { User } from '@/types/user.types';

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const usersData = await userService.getUsers();
            setUsers(usersData);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка загрузки пользователей');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createUser = useCallback(async (userData: any) => {
        try {
            setError(null);
            const newUser = await userService.createUser(userData);
            setUsers(prev => [newUser, ...prev]);
            return newUser;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка создания пользователя');
            throw err;
        }
    }, []);

    const updateUser = useCallback(async (userId: number, userData: Partial<User>) => {
        try {
            setError(null);
            const updatedUser = await userService.updateUser(userId, userData);
            setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
            return updatedUser;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка обновления пользователя');
            throw err;
        }
    }, []);

    const deleteUser = useCallback(async (userId: number) => {
        try {
            setError(null);
            await userService.deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка удаления пользователя');
            throw err;
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return {
        users,
        loading,
        error,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
    };
}