export interface User {
    id: number;
    username: string;
    role: 'admin' | 'accountant' | 'storekeeper'; 
    name: string;
    secondname: string;
    email?: string;
    phone?: string;
    birthday?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface UserProfile extends User {
    created_at: string;
    updated_at: string;
}
export interface LoginResponse {
    message: string;
    user: User;
    accessToken: string;  
}
