import { useEffect, useState } from "react";
import { ChatSearch } from "./ChatSearch";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";
import { Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Chat, User } from "./types";
import { ScrollArea } from "../ui/scroll-area";

interface ChatListProps {
    onSelectChat: (chat: Chat) => void;
    selectedChatId: number | null;
    onChatDeleted?: () => void;
}

export function ChatList({ onSelectChat, selectedChatId, onChatDeleted }: ChatListProps) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; chat: Chat | null; forBoth: boolean }>({
        open: false,
        chat: null,
        forBoth: false
    });

    const fetchChats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/chats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChats(response.data.chats);
        } catch (error) {
            console.error("Ошибка загрузки чатов:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    const handleSelectUser = async (user: User) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${API_BASE_URL}/chats`, { otherUserId: user.id }, { headers: { Authorization: `Bearer ${token}` } });
            await fetchChats();
            const newChat = response.data.chat;
            const fullChat = chats.find((c) => c.id === newChat.id) || {
                id: newChat.id,
                other_user_id: user.id,
                other_username: user.username,
                other_name: user.name,
                other_secondname: user.secondname,
                last_message: null,
                last_message_time: null,
                unread_count: 0,
                deleted_by_user1: false,
                deleted_by_user2: false
            };
            onSelectChat(fullChat);
        } catch (error) {
            console.error("Ошибка создания чата:", error);
        }
    };

    const handleDeleteChat = async (chat: Chat, forBoth: boolean) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_BASE_URL}/chats/${chat.id}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { forBoth }
            });
            await fetchChats();
            if (onChatDeleted) onChatDeleted();
            if (selectedChatId === chat.id) {
                onSelectChat(chats.find((c) => c.id !== chat.id) || (null as any));
            }
        } catch (error) {
            console.error("Ошибка удаления чата:", error);
        } finally {
            setDeleteDialog({ open: false, chat: null, forBoth: false });
        }
    };

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return format(date, "HH:mm");
        } else if (diffDays === 1) {
            return "Вчера";
        } else if (diffDays < 7) {
            return format(date, "EEEE", { locale: ru });
        } else {
            return format(date, "dd.MM.yyyy");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <ChatSearch onSelectUser={handleSelectUser} />
            </div>
            <ScrollArea className="flex-1">
                <div className="space-y-1 p-2">
                    {chats.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            Нет чатов
                            <br />
                            <span className="text-sm">Начните диалог с поиска пользователя</span>
                        </div>
                    ) : (
                        chats.map((chat) => (
                            <div
                                key={chat.id}
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedChatId === chat.id ? "bg-muted" : "hover:bg-muted/50"}`}
                                onClick={() => onSelectChat(chat)}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium truncate">
                                            {chat.other_name} {chat.other_secondname}
                                        </span>
                                        {chat.last_message_time && <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{formatTime(chat.last_message_time)}</span>}
                                    </div>
                                    <div className="text-sm text-muted-foreground truncate">{chat.last_message || "Нет сообщений"}</div>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                    {chat.unread_count > 0 && <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">{chat.unread_count}</span>}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteDialog({ open: true, chat, forBoth: false });
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Удалить чат
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteDialog({ open: true, chat, forBoth: true });
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Удалить для обоих
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{deleteDialog.forBoth ? "Удалить чат для обоих?" : "Удалить чат?"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteDialog.forBoth
                                ? `Чат с ${deleteDialog.chat?.other_name} ${deleteDialog.chat?.other_secondname} будет удален у обоих участников. Восстановить будет невозможно.`
                                : `Чат с ${deleteDialog.chat?.other_name} ${deleteDialog.chat?.other_secondname} будет удален только у вас. Собеседник сохранит историю.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteDialog.chat && handleDeleteChat(deleteDialog.chat, deleteDialog.forBoth)}>
                            Удалить
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
