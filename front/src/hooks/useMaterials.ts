import { useState, useCallback, useEffect } from 'react';
import { materialService } from '@/services/materialService';
import type { Material, Category } from '@/types/material.types';

export function useMaterials() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMaterials = useCallback(async (params?: { category_id?: string; search?: string; low_stock?: string }) => {
        try {
            setLoading(true);
            setError(null);
            const { materials: materialsData } = await materialService.getMaterials(params);
            setMaterials(materialsData);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка загрузки материалов');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const categoriesData = await materialService.getCategories();
            setCategories(categoriesData);
        } catch (err: any) {
            console.error(err);
        }
    }, []);

    const createMaterial = useCallback(async (materialData: any) => {
        try {
            setError(null);
            const newMaterial = await materialService.createMaterial(materialData);
            setMaterials(prev => [newMaterial, ...prev]);
            return newMaterial;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка создания материала');
            throw err;
        }
    }, []);

    const updateMaterial = useCallback(async (materialId: number, materialData: Partial<Material>) => {
        try {
            setError(null);
            const updatedMaterial = await materialService.updateMaterial(materialId, materialData);
            setMaterials(prev => prev.map(m => m.id === materialId ? updatedMaterial : m));
            return updatedMaterial;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка обновления материала');
            throw err;
        }
    }, []);

    const deleteMaterial = useCallback(async (materialId: number) => {
        try {
            setError(null);
            await materialService.deleteMaterial(materialId);
            setMaterials(prev => prev.filter(m => m.id !== materialId));
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка удаления материала');
            throw err;
        }
    }, []);

    const createCategory = useCallback(async (categoryData: { name: string; description?: string | null }) => {
        try {
            setError(null);
            const newCategory = await materialService.createCategory(categoryData);
            setCategories(prev => [newCategory, ...prev]);
            return newCategory;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка создания категории');
            throw err;
        }
    }, []);

    const updateCategory = useCallback(async (categoryId: number, categoryData: { name: string; description?: string | null }) => {
        try {
            setError(null);
            const updatedCategory = await materialService.updateCategory(categoryId, categoryData);
            setCategories(prev => prev.map(c => c.id === categoryId ? updatedCategory : c));
            return updatedCategory;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка обновления категории');
            throw err;
        }
    }, []);

    const deleteCategory = useCallback(async (categoryId: number) => {
        try {
            setError(null);
            await materialService.deleteCategory(categoryId);
            setCategories(prev => prev.filter(c => c.id !== categoryId));
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка удаления категории');
            throw err;
        }
    }, []);

    useEffect(() => {
        fetchMaterials();
        fetchCategories();
    }, [fetchMaterials, fetchCategories]);

    return {
        materials,
        categories,
        loading,
        error,
        fetchMaterials,
        fetchCategories,
        createMaterial,
        updateMaterial,
        deleteMaterial,
        createCategory,
        updateCategory,
        deleteCategory,
    };
}