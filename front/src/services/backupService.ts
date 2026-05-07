import apiClient from "./api";
import type { Backup } from "@/types/backup.types";

export const backupService = {
    async getBackups(): Promise<Backup[]> {
        const response = await apiClient.get("/backups");
        return response.data.backups;
    },

    async createBackup(description?: string): Promise<Backup> {
        const response = await apiClient.post("/backups", { description });
        return response.data.backup;
    },

    async downloadBackup(backupId: number): Promise<Blob> {
        const response = await apiClient.get(`/backups/${backupId}/download`, {
            responseType: "blob"
        });
        return response.data;
    },

    async deleteBackup(backupId: number): Promise<void> {
        await apiClient.delete(`/backups/${backupId}`);
    }
};
