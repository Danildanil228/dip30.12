export interface RequestItem {
    id: number;
    material_id: number;
    name: string;
    code: string;
    unit: string;
    quantity: number;
    current_quantity_at_request: number;
}

export interface RequestPreviewItem {
    id: number;
    name: string;
    quantity: number;
}

export interface Request {
    id: number;
    title: string;
    request_type: 'incoming' | 'outgoing';
    status: 'pending' | 'approved' | 'rejected' | 'draft';
    created_by: number;
    created_by_username: string;
    created_by_name?: string;
    created_by_secondname?: string;
    created_at: string;
    reviewed_by: number | null;
    reviewed_by_username: string | null;
    reviewed_at: string | null;
    notes: string | null;
    rejection_reason: string | null;
    is_public: boolean;
    items_preview?: RequestPreviewItem[];
}