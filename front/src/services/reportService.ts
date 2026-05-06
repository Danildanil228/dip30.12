import apiClient from './api';
import type { MovementItem, TurnoverItem, UserActivity } from '@/types/report.types';

export const reportService = {
    async getDashboardMetrics(params: { startDate: string; endDate: string }): Promise<any> {
        const response = await apiClient.get('/dashboard/metrics', { params });
        return response.data;
    },

    async getDashboardMovement(params: { startDate: string; endDate: string }): Promise<any> {
        const response = await apiClient.get('/dashboard/movement', { params });
        return response.data;
    },

    async getMaterialMovementReport(params: any): Promise<{ data: MovementItem[]; summary: any }> {
        const response = await apiClient.get('/reports/material-movement', { params });
        return response.data;
    },

    async getRequestsReport(params: any): Promise<any> {
        const response = await apiClient.get('/reports/requests', { params });
        return response.data;
    },

    async getTurnoverBalanceReport(params: any): Promise<{ data: TurnoverItem[]; summary: any }> {
        const response = await apiClient.get('/reports/turnover-balance', { params });
        return response.data;
    },

    async getUserActivityReport(params: any): Promise<{ data: UserActivity[] }> {
        const response = await apiClient.get('/reports/user-activity', { params });
        return response.data;
    },
};