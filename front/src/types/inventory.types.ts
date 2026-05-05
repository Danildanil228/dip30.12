export interface Inventory {
    id: number;
    title: string;
    status: 'draft' | 'in_progress' | 'completed' | 'approved' | 'cancelled' | 'expired';
    created_by: number;
    created_by_username: string;
    responsible_person: number;
    responsible_username: string;
    start_date: string;
    end_date: string;
    description: string | null;
    created_at: string;
    completed_at: string | null;
    approved_at: string | null;
    approved_by?: number | null;        
    approved_by_username?: string | null; 
    total_items?: number;
    checked_items?: number;
}

export interface InventoryItem {
    id: number;
    inventory_id: number;
    material_id: number;
    name: string;
    code: string;
    unit: string;
    system_quantity: number;
    actual_quantity: number | null;
    difference: number | null;
    reason: string | null;
}