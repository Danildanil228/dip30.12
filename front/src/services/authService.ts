import apiClient from './api';
import type { LoginResponse } from '@/types/user.types';

export const authService = {
    async countUsers(): Promise<{ hasUsers: boolean }> {
        const response = await apiClient.get('/countUsers');
        return response.data;
    },

    async registerFirst(username: string, password: string): Promise<LoginResponse> {
        const response = await apiClient.post('/registerFirst', { username, password });
        return response.data;
    },

    async login(username: string, password: string): Promise<LoginResponse> {
        const response = await apiClient.post('/login', { username, password });
        return response.data;
    },

    async verifyToken(): Promise<{ valid: boolean; user?: any }> {
        const response = await apiClient.get('/verifyToken');
        return response.data;
    },
};