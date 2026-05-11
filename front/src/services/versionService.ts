import apiClient from './api';

export interface VersionEntry {
    version: string;
    date: string;
    changes: string[];
}

export const versionService = {
    async getVersions(): Promise<{ versions: VersionEntry[]; currentVersion: string }> {
        const response = await apiClient.get('/versions');
        return response.data;
    }
};