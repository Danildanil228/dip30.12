export interface User {
    id: number;
    username: string;
    name: string;
    secondname: string;
}

export interface Chat {
    id: number;
    other_user_id: number;
    other_username: string;
    other_name: string;
    other_secondname: string;
    last_message: string | null;
    last_message_time: string | null;
    unread_count: number;
    deleted_by_user1: boolean;
    deleted_by_user2: boolean;
}

export interface Message {
    id: number;
    chat_id: number;
    sender_id: number;
    sender_name: string;
    message: string | null;
    image_url: string | null;
    file_url: string | null;
    file_name: string | null;
    file_size: number | null;
    is_read: boolean;
    read_at: string | null;
    edited_at: string | null;
    created_at: string;
}