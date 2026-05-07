import apiClient from "./api";
import type { LoginResponse } from "@/types/user.types";

export const authService = {
    async countUsers(): Promise<{ hasUsers: boolean }> {
        const response = await apiClient.get("/countUsers");
        return response.data;
    },

    async registerFirst(username: string, password: string): Promise<LoginResponse> {
        const response = await apiClient.post("/registerFirst", { username, password });
        if (response.data.accessToken) {
            sessionStorage.setItem("accessToken", response.data.accessToken);
        }
        if (response.data.user) {
            sessionStorage.setItem("user", JSON.stringify(response.data.user));
        }
        return response.data;
    },

    async login(username: string, password: string): Promise<LoginResponse> {
        const response = await apiClient.post("/login", { username, password });
        if (response.data.accessToken) {
            sessionStorage.setItem("accessToken", response.data.accessToken);
        }
        if (response.data.user) {
            sessionStorage.setItem("user", JSON.stringify(response.data.user));
        }
        return response.data;
    },

    async verifyToken(): Promise<{ valid: boolean; user?: any }> {
        try {
            const response = await apiClient.get("/verifyToken");
            if (response.data.user) {
                sessionStorage.setItem("user", JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            return { valid: false };
        }
    },

    async logout(): Promise<void> {
        try {
            await apiClient.post("/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            sessionStorage.removeItem("accessToken");
            sessionStorage.removeItem("user");
        }
    }
};
