import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Image, X, Smile } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { useSocket } from "@/hooks/useSocket";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EmojiPicker from "emoji-picker-react";
import type { Chat, Message } from "./types";

interface ChatWindowProps {
    chat: Chat | null;
    onMessageSent?: () => void;
}

export function ChatWindow({ chat, onMessageSent }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { socket, isConnected } = useSocket();
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Загрузка сообщений
    useEffect(() => {
        if (!chat) return;

        const fetchMessages = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_BASE_URL}/chats/${chat.id}/messages`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(response.data.messages);

                // Отмечаем непрочитанные сообщения
                const unreadMessages = response.data.messages.filter((m: Message) => !m.is_read && m.sender_id !== JSON.parse(localStorage.getItem("user") || "{}").id);
                if (unreadMessages.length > 0 && socket) {
                    socket.emit("mark_read", {
                        chatId: chat.id,
                        messageIds: unreadMessages.map((m: Message) => m.id)
                    });
                }
            } catch (error) {
                console.error("Ошибка загрузки сообщений:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        // Присоединяемся к комнате чата
        if (socket) {
            socket.emit("join_chat", chat.id);
        }

        return () => {
            if (socket) {
                socket.emit("leave_chat", chat.id);
            }
        };
    }, [chat, socket]);

    // Прокрутка вниз при новых сообщениях
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // WebSocket слушатели
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message: Message) => {
            if (message.chat_id === chat?.id) {
                setMessages((prev) => [...prev, message]);

                // Если сообщение не от текущего пользователя, отмечаем как прочитанное
                const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                if (message.sender_id !== currentUser.id && socket) {
                    socket.emit("mark_read", {
                        chatId: chat.id,
                        messageIds: [message.id]
                    });
                }
            }
        };

        const handleMessagesRead = ({ messageIds, readerId }: { messageIds: number[]; readerId: number }) => {
            setMessages((prev) => prev.map((msg) => (messageIds.includes(msg.id) && msg.sender_id !== readerId ? { ...msg, is_read: true, read_at: new Date().toISOString() } : msg)));
        };

        const handleMessageEdited = ({ id, message, edited_at }: { id: number; message: string; edited_at: string }) => {
            setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, message, edited_at } : msg)));
        };

        const handleMessageDeleted = ({ messageId, forBoth }: { messageId: number; forBoth: boolean }) => {
            if (forBoth) {
                setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
            } else {
                setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, message: "[Сообщение удалено]", image_url: null, file_url: null } : msg)));
            }
        };

        socket.on("new_message", handleNewMessage);
        socket.on("messages_read", handleMessagesRead);
        socket.on("message_edited", handleMessageEdited);
        socket.on("message_deleted", handleMessageDeleted);

        return () => {
            socket.off("new_message", handleNewMessage);
            socket.off("messages_read", handleMessagesRead);
            socket.off("message_edited", handleMessageEdited);
            socket.off("message_deleted", handleMessageDeleted);
        };
    }, [socket, chat?.id]);

    const sendMessage = async () => {
        if (!inputMessage.trim() || !chat || sending) return;

        setSending(true);
        try {
            if (socket && isConnected) {
                socket.emit("send_message", {
                    chatId: chat.id,
                    message: inputMessage.trim()
                });
                setInputMessage("");
                if (onMessageSent) onMessageSent();
            } else {
                console.error("Socket не подключен");
            }
        } catch (error) {
            console.error("Ошибка отправки сообщения:", error);
        } finally {
            setSending(false);
        }
    };

    const uploadFile = async (file: File, type: "image" | "file") => {
        if (!chat) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            });

            if (socket && isConnected) {
                socket.emit("send_message", {
                    chatId: chat.id,
                    message: null,
                    imageUrl: type === "image" ? response.data.fileUrl : null,
                    fileUrl: type === "file" ? response.data.fileUrl : null,
                    fileName: type === "file" ? response.data.fileName : null,
                    fileSize: type === "file" ? response.data.fileSize : null
                });
                if (onMessageSent) onMessageSent();
            }
        } catch (error) {
            console.error("Ошибка загрузки файла:", error);
            alert("Ошибка загрузки файла");
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Проверка размера (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert("Файл слишком большой. Максимальный размер 10MB");
            return;
        }

        uploadFile(file, type);
        e.target.value = "";
    };

    const handleEditMessage = async (id: number, newText: string) => {
        if (!socket) return;
        socket.emit("edit_message", { messageId: id, message: newText });
    };

    const handleDeleteMessage = async (id: number, forBoth: boolean) => {
        if (!socket || !chat) return;
        socket.emit("delete_message", { messageId: id, forBoth, chatId: chat.id });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const onEmojiClick = (emojiObject: any) => {
        setInputMessage((prev) => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    if (!chat) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p className="text-lg">Выберите чат</p>
                <p className="text-sm">или начните новый диалог</p>
            </div>
        );
    }

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <div className="flex flex-col h-full">
            {/* Header чата */}
            <div className="p-4 border-b">
                <div>
                    <div className="font-medium text-lg">
                        {chat.other_name} {chat.other_secondname}
                    </div>
                    <div className="text-sm text-muted-foreground">@{chat.other_username}</div>
                </div>
            </div>

            {/* Сообщения */}
            <ScrollArea className="flex-1 p-4">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-10">
                        Нет сообщений
                        <br />
                        <span className="text-sm">Напишите что-нибудь...</span>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} isOwn={message.sender_id === currentUser.id} onEdit={handleEditMessage} onDelete={handleDeleteMessage} />
                        ))}
                        <div ref={scrollRef} />
                    </>
                )}
            </ScrollArea>

            {/* Input область */}
            <div className="p-4 border-t">
                <div className="flex gap-2 items-end">
                    <div className="flex gap-1">
                        <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, "image")} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => imageInputRef.current?.click()}>
                            <Image className="h-5 w-5" />
                        </Button>

                        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileSelect(e, "file")} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                            <Paperclip className="h-5 w-5" />
                        </Button>

                        <div className="relative">
                            <Button type="button" variant="ghost" size="icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                <Smile className="h-5 w-5" />
                            </Button>
                            {showEmojiPicker && (
                                <div className="absolute bottom-full mb-2 right-0 z-50">
                                    <EmojiPicker onEmojiClick={onEmojiClick} />
                                </div>
                            )}
                        </div>
                    </div>

                    <Input placeholder="Введите сообщение..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} className="flex-1" disabled={sending} />

                    <Button onClick={sendMessage} disabled={!inputMessage.trim() || sending}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-2">{isConnected ? "🟢 Подключено" : "🔴 Подключение..."}</div>
            </div>
        </div>
    );
}
