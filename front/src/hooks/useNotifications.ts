import { useState, useCallback, useEffect } from "react";
import { notificationService } from "@/services/notificationService";
import type { Log } from "@/types/common.types";

export function useNotifications() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const logsData = await notificationService.getLogs();
            setLogs(logsData);
        } catch (err: any) {
            setError(err.response?.data?.error || "Ошибка загрузки логов");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteLog = useCallback(async (logId: number) => {
        try {
            setError(null);
            await notificationService.deleteLog(logId);
            setLogs((prev) => prev.filter((log) => log.id !== logId));
        } catch (err: any) {
            setError(err.response?.data?.error || "Ошибка удаления лога");
            throw err;
        }
    }, []);

    const deleteAllLogs = useCallback(async () => {
        try {
            setError(null);
            await notificationService.deleteAllLogs();
            setLogs([]);
        } catch (err: any) {
            setError(err.response?.data?.error || "Ошибка удаления логов");
            throw err;
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return {
        logs,
        loading,
        error,
        fetchLogs,
        deleteLog,
        deleteAllLogs,
    };
}
