import apiClient from "./api";

export const avatarService = {
    async uploadAvatar(file: File): Promise<{ avatar: string }> {
        const formData = new FormData();
        formData.append("avatar", file);
        const response = await apiClient.post("/avatar/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    async deleteAvatar(): Promise<void> {
        await apiClient.delete("/avatar");
    },

    async getAvatarUrl(userId: number): Promise<string | null> {
        try {
            const response = await apiClient.get(`/avatar/${userId}`, { responseType: "blob" });
            return URL.createObjectURL(response.data);
        } catch {
            return null;
        }
    },
    async getAvatarBlob(userId: number): Promise<Blob | null> {
        try {
            const response = await apiClient.get(`/avatar/${userId}`, { responseType: "blob" });
            return response.data;
        } catch {
            return null;
        }
    },
};
