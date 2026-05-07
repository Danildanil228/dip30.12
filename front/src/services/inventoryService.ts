import apiClient from "./api";
import type { Inventory, InventoryItem } from "@/types/inventory.types";

export const inventoryService = {
    async getInventories(): Promise<Inventory[]> {
        const response = await apiClient.get("/inventories");
        return response.data.inventories;
    },

    async getInventoryById(id: number): Promise<{ inventory: Inventory; results: InventoryItem[] }> {
        const response = await apiClient.get(`/inventories/${id}`);
        return response.data;
    },

    async createInventory(inventoryData: any): Promise<Inventory> {
        const response = await apiClient.post("/inventories", inventoryData);
        return response.data.inventory;
    },

    async updateInventory(inventoryId: number, inventoryData: Partial<Inventory>): Promise<Inventory> {
        const response = await apiClient.put(`/inventories/${inventoryId}`, inventoryData);
        return response.data.inventory;
    },

    async startInventory(inventoryId: number): Promise<void> {
        await apiClient.put(`/inventories/${inventoryId}/start`);
    },

    async saveInventoryResults(inventoryId: number, results: any[]): Promise<void> {
        await apiClient.put(`/inventories/${inventoryId}/results`, { results });
    },

    async completeInventory(inventoryId: number): Promise<void> {
        await apiClient.put(`/inventories/${inventoryId}/complete`);
    },

    async approveInventory(inventoryId: number): Promise<void> {
        await apiClient.put(`/inventories/${inventoryId}/approve`);
    },

    async cancelInventory(inventoryId: number): Promise<void> {
        await apiClient.put(`/inventories/${inventoryId}/cancel`);
    },

    async deleteInventory(inventoryId: number): Promise<void> {
        await apiClient.delete(`/inventories/${inventoryId}`);
    }
};
