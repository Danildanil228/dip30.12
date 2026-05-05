export interface Category {
    id: number;
    name: string;
    description: string | null;
    created_by: number | null;
    updated_by: number | null;
    created_by_username?: string | null;
    updated_by_username?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Material {
    id: number;
    name: string;
    code: string;
    description: string | null;
    unit: string;
    quantity: number;
    category_id: number | null;
    category_name?: string | null;
    created_by: number | null;
    updated_by: number | null;
    created_by_username?: string | null;
    updated_by_username?: string | null;
    created_at: string;
    updated_at: string;
}