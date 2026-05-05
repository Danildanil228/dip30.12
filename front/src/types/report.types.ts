export interface MovementItem {
    date: string;
    request_title: string;
    request_type: string;
    material_name: string;
    code: string;
    category_name: string;
    quantity: number;
    created_by_username: string;
}

export interface TurnoverItem {
    id: number;
    name: string;
    code: string;
    unit: string;
    category_name: string;
    opening_balance: number;
    incoming: number;
    outgoing: number;
    closing_balance: number;
}

export interface UserActivity {
    id: number;
    username: string;
    name: string;
    secondname: string;
    role: string;
    requests_created: number;
    requests_approved: number;
    requests_rejected: number;
    inventories_completed: number;
}