export interface Log {
    id: number;
    user_id: number;
    type: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    user_name: string;
    name: string;
    secondname: string;
}

export interface SelectOption {
    value: string;
    label: string;
}

export interface ColumnConfig {
    accessorKey: string;
    header: string;
    width?: string;
    format?: (value: any, row?: any) => React.ReactNode;
}