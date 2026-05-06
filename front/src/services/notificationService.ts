import apiClient from './api';
import type { Log } from '@/types/common.types';

export const notificationService = {
    async getLogs(): Promise<Log[]> {
        const response = await apiClient.get('/logs');
        return response.data.logs;
    },

    async deleteLog(logId: number): Promise<void> {
        await apiClient.delete(`/logs/${logId}`);
    },

    async deleteAllLogs(): Promise<void> {
        await apiClient.delete('/logs');
    },
};