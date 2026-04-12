import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, UserPlus } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/components/api';
import type { User } from './types';

interface ChatSearchProps {
    onSelectUser: (user: User) => void;
}

export function ChatSearch({ onSelectUser }: ChatSearchProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const searchUsers = async () => {
            if (searchTerm.length < 2) {
                setUsers([]);
                return;
            }

            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                console.log('Token being sent:', token);
                const response = await axios.get(`${API_BASE_URL}/users/search`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { q: searchTerm }
                });
                setUsers(response.data.users);
                setShowResults(true);
            } catch (error) {
                console.error('Ошибка поиска:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm]);

    const handleSelectUser = (user: User) => {
        onSelectUser(user);
        setSearchTerm('');
        setShowResults(false);
    };

    return (
        <div className="relative" ref={searchRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Поиск по имени, фамилии или логину..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
                    className="pl-10"
                />
            </div>

            {showResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {loading && (
                        <div className="p-4 text-center text-muted-foreground">Поиск...</div>
                    )}
                    {!loading && users.length === 0 && searchTerm.length >= 2 && (
                        <div className="p-4 text-center text-muted-foreground">Пользователи не найдены</div>
                    )}
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                            onClick={() => handleSelectUser(user)}
                        >
                            <div>
                                <div className="font-medium">{user.name} {user.secondname}</div>
                                <div className="text-sm text-muted-foreground">@{user.username}</div>
                            </div>
                            <UserPlus className="h-4 w-4 text-muted-foreground" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}