import { useState, useCallback, useEffect } from 'react';
import { requestService } from '@/services/requestService';
import type { Request, RequestItem } from '@/types/request.types';

export function useRequests() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [currentRequest, setCurrentRequest] = useState<Request | null>(null);
    const [currentRequestItems, setCurrentRequestItems] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = useCallback(async (status?: string) => {
        try {
            setLoading(true);
            setError(null);
            const requestsData = await requestService.getRequests({ status });
            setRequests(requestsData);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка загрузки заявок');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRequestById = useCallback(async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const data = await requestService.getRequestById(id);
            setCurrentRequest(data.request);
            setCurrentRequestItems(data.items);
            return data;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка загрузки заявки');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createRequest = useCallback(async (requestData: any) => {
        try {
            setError(null);
            const newRequest = await requestService.createRequest(requestData);
            setRequests(prev => [newRequest, ...prev]);
            return newRequest;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка создания заявки');
            throw err;
        }
    }, []);

    const approveRequest = useCallback(async (requestId: number) => {
        try {
            setError(null);
            await requestService.approveRequest(requestId);
            await fetchRequests();
            if (currentRequest?.id === requestId) {
                await fetchRequestById(requestId);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка подтверждения заявки');
            throw err;
        }
    }, [fetchRequests, fetchRequestById, currentRequest]);

    const rejectRequest = useCallback(async (requestId: number, reason: string) => {
        try {
            setError(null);
            await requestService.rejectRequest(requestId, reason);
            await fetchRequests();
            if (currentRequest?.id === requestId) {
                await fetchRequestById(requestId);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка отклонения заявки');
            throw err;
        }
    }, [fetchRequests, fetchRequestById, currentRequest]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    return {
        requests,
        currentRequest,
        currentRequestItems,
        loading,
        error,
        fetchRequests,
        fetchRequestById,
        createRequest,
        approveRequest,
        rejectRequest,
    };
}