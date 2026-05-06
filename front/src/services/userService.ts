import apiClient from './api';
import type { User, UserProfile } from '@/types/user.types';

export const userService = {
    async getUsers(): Promise<User[]> {
        const response = await apiClient.get('/users');
        return response.data.users;
    },

    async getUserById(id: number): Promise<UserProfile> {
        const response = await apiClient.get(`/users/${id}`);
        return response.data.user;
    },

    async createUser(userData: { username: string; password: string; name: string; secondname: string; role: string }): Promise<User> {
        const response = await apiClient.post('/createUser', userData);
        return response.data.user;
    },

    async updateUser(userId: number, userData: Partial<User>): Promise<User> {
        const response = await apiClient.put(`/users/${userId}`, userData);
        return response.data.user;
    },

    async deleteUser(userId: number): Promise<void> {
        await apiClient.delete(`/users/${userId}`);
    },

    async changePassword(userId: number, data: { currentPassword?: string; newPassword: string; isAdminChange: boolean }): Promise<void> {
        await apiClient.put(`/users/${userId}/password`, data);
    },
};