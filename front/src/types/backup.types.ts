export interface Backup {
    id: number;
    filename: string;
    filepath: string;
    file_size: number;
    created_by: number | null;
    created_at: string;
    description: string | null;
    created_by_username: string | null;
    name: string | null;
    secondname: string | null;
    file_exists: boolean;
}