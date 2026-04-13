import { useEffect, useState } from "react";
import { ChatSearch } from "./ChatSearch";
import type { Chat, User } from "./types";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";
import { Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "../LoadingSpinner";
import { useSocket } from "@/hooks/useSocket";

interface ChatListProps {
    onSelectChat: (chat: Chat) => void;
    selectedChatId: number | null;
}

export function ChatList({ onSelectChat, selectedChatId }: ChatListProps) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        chat: Chat | null;
        forBoth: boolean;
    }>({
        open: false,
        chat: null,
        forBoth: false,
    });
    const { socket } = useSocket();

    const fetchChats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/chats`, {
                headers: { Authorization: `Bearer ${token}` },
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

    useEffect(() => {
        if (!socket) return;

        const handleChatUpdated = (data: { chatId: number; last_message: string; last_message_time: string; unread_count: number }) => {
            console.log("Chat updated:", data);
            setChats((prev) =>
                prev.map((chat) =>
                    chat.id === data.chatId
                        ? {
                              ...chat,
                              last_message: data.last_message,
                              last_message_time: data.last_message_time,
                              unread_count: data.unread_count,
                          }
                        : chat,
                ),
            );
        };

        socket.on("chat_updated", handleChatUpdated);

        return () => {
            socket.off("chat_updated", handleChatUpdated);
        };
    }, [socket]);

    const handleSelectUser = async (user: User) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${API_BASE_URL}/chats`, { otherUserId: user.id }, { headers: { Authorization: `Bearer ${token}` } });
            await fetchChats();
            const newChat = response.data.chat;
            const fullChat: Chat = {
                id: newChat.id,
                other_user_id: user.id,
                other_username: user.username,
                other_name: user.name,
                other_secondname: user.secondname,
                last_message: null,
                last_message_time: null,
                unread_count: 0,
                deleted_by_user1: false,
                deleted_by_user2: false,
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
                params: { forBoth },
            });
            await fetchChats();
            if (selectedChatId === chat.id) {
                const nextChat = chats.find((c) => c.id !== chat.id);
                onSelectChat(nextChat || (null as any));
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
        return <LoadingSpinner />;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <ChatSearch onSelectUser={handleSelectUser} />
            </div>

            <div className="flex-1 overflow-y-auto">
                {chats.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Нет чатов
                        <br />
                        Начните диалог с поиска пользователя
                    </div>
                ) : (
                    <div className="divide-y">
                        {chats.map((chat) => (
                            <div key={chat.id} onClick={() => onSelectChat(chat)} className={`p-4 cursor-pointer hover:bg-muted transition-colors ${selectedChatId === chat.id ? "bg-muted" : ""}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium">
                                                {chat.other_name} {chat.other_secondname}
                                            </span>
                                            {chat.last_message_time && <span className="text-xs text-muted-foreground">{formatTime(chat.last_message_time)}</span>}
                                        </div>
                                        <div className="text-sm text-muted-foreground truncate mt-1">{chat.last_message || "Нет сообщений"}</div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-2">
                                        {chat.unread_count > 0 && <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">{chat.unread_count}</span>}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteDialog({ open: true, chat, forBoth: false });
                                                    }}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Удалить чат
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
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
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
                        <AlertDialogAction onClick={() => deleteDialog.chat && handleDeleteChat(deleteDialog.chat, deleteDialog.forBoth)}>Удалить</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
