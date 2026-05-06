import { useState, useCallback, useEffect } from 'react';
import { backupService } from '@/services/backupService';
import type { Backup } from '@/types/backup.types';

export function useBackups() {
    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState<number | null>(null);

    const fetchBackups = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const backupsData = await backupService.getBackups();
            setBackups(backupsData);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка загрузки бэкапов');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createBackup = useCallback(async (description?: string) => {
        try {
            setError(null);
            const newBackup = await backupService.createBackup(description);
            setBackups(prev => [newBackup, ...prev]);
            return newBackup;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка создания бэкапа');
            throw err;
        }
    }, []);

    const downloadBackup = useCallback(async (id: number, filename: string) => {
        try {
            setDownloading(id);
            setError(null);
            const blob = await backupService.downloadBackup(id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка скачивания бэкапа');
            console.error(err);
        } finally {
            setDownloading(null);
        }
    }, []);

    const deleteBackup = useCallback(async (id: number) => {
        try {
            setError(null);
            await backupService.deleteBackup(id);
            setBackups(prev => prev.filter(b => b.id !== id));
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка удаления бэкапа');
            throw err;
        }
    }, []);

    useEffect(() => {
        fetchBackups();
    }, [fetchBackups]);

    return {
        backups,
        loading,
        error,
        downloading,
        fetchBackups,
        createBackup,
        downloadBackup,
        deleteBackup,
    };
}