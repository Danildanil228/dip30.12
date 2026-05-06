import { useState, useCallback, useEffect } from 'react';
import { inventoryService } from '@/services/inventoryService';
import type { Inventory, InventoryItem } from '@/types/inventory.types';

export function useInventories() {
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [currentInventory, setCurrentInventory] = useState<Inventory | null>(null);
    const [inventoryResults, setInventoryResults] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInventories = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const inventoriesData = await inventoryService.getInventories();
            setInventories(inventoriesData);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка загрузки инвентаризаций');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchInventoryById = useCallback(async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const data = await inventoryService.getInventoryById(id);
            setCurrentInventory(data.inventory);
            setInventoryResults(data.results);
            return data;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка загрузки инвентаризации');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createInventory = useCallback(async (inventoryData: any) => {
        try {
            setError(null);
            const newInventory = await inventoryService.createInventory(inventoryData);
            setInventories(prev => [newInventory, ...prev]);
            return newInventory;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка создания инвентаризации');
            throw err;
        }
    }, []);

    const updateInventory = useCallback(async (inventoryId: number, inventoryData: Partial<Inventory>) => {
        try {
            setError(null);
            const updatedInventory = await inventoryService.updateInventory(inventoryId, inventoryData);
            setInventories(prev => prev.map(i => i.id === inventoryId ? updatedInventory : i));
            if (currentInventory?.id === inventoryId) {
                setCurrentInventory(updatedInventory);
            }
            return updatedInventory;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка обновления инвентаризации');
            throw err;
        }
    }, [currentInventory]);

    const startInventory = useCallback(async (inventoryId: number) => {
        try {
            setError(null);
            await inventoryService.startInventory(inventoryId);
            await fetchInventories();
            if (currentInventory?.id === inventoryId) {
                await fetchInventoryById(inventoryId);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка начала инвентаризации');
            throw err;
        }
    }, [fetchInventories, fetchInventoryById, currentInventory]);

    const saveResults = useCallback(async (inventoryId: number, results: any[]) => {
        try {
            setError(null);
            await inventoryService.saveInventoryResults(inventoryId, results);
            if (currentInventory?.id === inventoryId) {
                await fetchInventoryById(inventoryId);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка сохранения результатов');
            throw err;
        }
    }, [fetchInventoryById, currentInventory]);

    const completeInventory = useCallback(async (inventoryId: number) => {
        try {
            setError(null);
            await inventoryService.completeInventory(inventoryId);
            await fetchInventories();
            if (currentInventory?.id === inventoryId) {
                await fetchInventoryById(inventoryId);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка завершения инвентаризации');
            throw err;
        }
    }, [fetchInventories, fetchInventoryById, currentInventory]);

    const approveInventory = useCallback(async (inventoryId: number) => {
        try {
            setError(null);
            await inventoryService.approveInventory(inventoryId);
            await fetchInventories();
            if (currentInventory?.id === inventoryId) {
                await fetchInventoryById(inventoryId);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка подтверждения инвентаризации');
            throw err;
        }
    }, [fetchInventories, fetchInventoryById, currentInventory]);

    const cancelInventory = useCallback(async (inventoryId: number) => {
        try {
            setError(null);
            await inventoryService.cancelInventory(inventoryId);
            await fetchInventories();
            if (currentInventory?.id === inventoryId) {
                await fetchInventoryById(inventoryId);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка отмены инвентаризации');
            throw err;
        }
    }, [fetchInventories, fetchInventoryById, currentInventory]);

    const deleteInventory = useCallback(async (inventoryId: number) => {
        try {
            setError(null);
            await inventoryService.deleteInventory(inventoryId);
            await fetchInventories();
            if (currentInventory?.id === inventoryId) {
                setCurrentInventory(null);
                setInventoryResults([]);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка удаления инвентаризации');
            throw err;
        }
    }, [fetchInventories, currentInventory]);

    useEffect(() => {
        fetchInventories();
    }, [fetchInventories]);

    return {
        inventories,
        currentInventory,
        inventoryResults,
        loading,
        error,
        fetchInventories,
        fetchInventoryById,
        createInventory,
        updateInventory,
        startInventory,
        saveResults,
        completeInventory,
        approveInventory,
        cancelInventory,
        deleteInventory,
    };
}