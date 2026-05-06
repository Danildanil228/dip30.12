import apiClient from './api';
import type { Request, RequestItem } from '@/types/request.types';

export const requestService = {
    async getRequests(params?: { status?: string }): Promise<Request[]> {
        const response = await apiClient.get('/requests', { params });
        return response.data.requests;
    },

    async getRequestById(id: number): Promise<{ request: Request; items: RequestItem[] }> {
        const response = await apiClient.get(`/requests/${id}`);
        return response.data;
    },

    async createRequest(requestData: any): Promise<Request> {
        const response = await apiClient.post('/requests', requestData);
        return response.data.request;
    },

    async approveRequest(requestId: number): Promise<void> {
        await apiClient.put(`/requests/${requestId}/approve`);
    },

    async rejectRequest(requestId: number, rejection_reason: string): Promise<void> {
        await apiClient.put(`/requests/${requestId}/reject`, { rejection_reason });
    },
};