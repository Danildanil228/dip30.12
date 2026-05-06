import { useState, useCallback } from "react";
import { reportService } from "@/services/reportService";

export function useReports() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getDashboardMetrics = useCallback(async (params: { startDate: string; endDate: string }) => {
        try {
            setLoading(true);
            setError(null);
            return await reportService.getDashboardMetrics(params);
        } catch (err: any) {
            setError(err.response?.data?.error || "Ошибка загрузки метрик");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getDashboardMovement = useCallback(async (params: { startDate: string; endDate: string }) => {
        try {
            setLoading(true);
            setError(null);
            return await reportService.getDashboardMovement(params);
        } catch (err: any) {
            setError(err.response?.data?.error || "Ошибка загрузки движения");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getMaterialMovementReport = useCallback(async (params: any) => {
        try {
            setLoading(true);
            setError(null);
            return await reportService.getMaterialMovementReport(params);
        } catch (err: any) {
            setError(err.response?.data?.error || "Ошибка загрузки отчета");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getRequestsReport = useCallback(async (params: any) => {
        try {
            setLoading(true);
            setError(null);
            return await reportService.getRequestsReport(params);
        } catch (err: any) {
            setError(err.response?.data?.error || "Ошибка загрузки отчета");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getTurnoverBalanceReport = useCallback(async (params: any) => {
        try {
            setLoading(true);
            setError(null);
            return await reportService.getTurnoverBalanceReport(params);
        } catch (err: any) {
            setError(err.response?.data?.error || "Ошибка загрузки отчета");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getUserActivityReport = useCallback(async (params: any) => {
        try {
            setLoading(true);
            setError(null);
            return await reportService.getUserActivityReport(params);
        } catch (err: any) {
            setError(err.response?.data?.error || "Ошибка загрузки отчета");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        getDashboardMetrics,
        getDashboardMovement,
        getMaterialMovementReport,
        getRequestsReport,
        getTurnoverBalanceReport,
        getUserActivityReport,
    };
}
