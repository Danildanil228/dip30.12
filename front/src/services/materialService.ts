import apiClient from './api';
import type { Category, Material } from '@/types/material.types';

export const materialService = {
    // Categories
    async getCategories(): Promise<Category[]> {
        const response = await apiClient.get('/categories');
        return response.data.categories;
    },

    async createCategory(data: { name: string; description?: string | null }): Promise<Category> {
        const response = await apiClient.post('/categories', data);
        return response.data.category;
    },

    async updateCategory(categoryId: number, data: { name: string; description?: string | null }): Promise<Category> {
        const response = await apiClient.put(`/categories/${categoryId}`, data);
        return response.data.category;
    },

    async deleteCategory(categoryId: number): Promise<void> {
        await apiClient.delete(`/categories/${categoryId}`);
    },

    // Materials
    async getMaterials(params?: { category_id?: string; search?: string; low_stock?: string }): Promise<{ materials: Material[]; stats: any }> {
        const response = await apiClient.get('/materials', { params });
        return response.data;
    },

    async getMaterialById(id: number): Promise<Material> {
        const response = await apiClient.get(`/materials/${id}`);
        return response.data.material;
    },

    async createMaterial(materialData: Omit<Material, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by' | 'created_by_username' | 'updated_by_username' | 'category_name'>): Promise<Material> {
        const response = await apiClient.post('/materials', materialData);
        return response.data.material;
    },

    async updateMaterial(materialId: number, materialData: Partial<Material>): Promise<Material> {
        const response = await apiClient.put(`/materials/${materialId}`, materialData);
        return response.data.material;
    },

    async deleteMaterial(materialId: number): Promise<void> {
        await apiClient.delete(`/materials/${materialId}`);
    },
};