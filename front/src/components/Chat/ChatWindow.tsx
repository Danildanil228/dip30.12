import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Image, Smile } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import type { Chat, Message } from "./types";
import { useSocket } from "@/hooks/useSocket";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import EmojiPicker from "emoji-picker-react";
import { LoadingSpinner } from "../LoadingSpinner";

interface ChatWindowProps {
    chat: Chat | null;
}

export function ChatWindow({ chat }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { socket, isConnected } = useSocket();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!chat) return;

        const fetchMessages = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_BASE_URL}/chats/${chat.id}/messages`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessages(response.data.messages);

                const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                const unreadMessages = response.data.messages.filter((m: Message) => !m.is_read && m.sender_id !== currentUser.id);

                if (unreadMessages.length > 0 && socket && isConnected) {
                    socket.emit("mark_read", {
                        chatId: chat.id,
                        messageIds: unreadMessages.map((m: Message) => m.id),
                    });
                }
            } catch (error) {
                console.error("Ошибка загрузки сообщений:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        if (socket) {
            socket.emit("join_chat", chat.id);
        }

        return () => {
            if (socket) {
                socket.emit("leave_chat", chat.id);
            }
        };
    }, [chat, socket, isConnected]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message: Message) => {
            if (message.chat_id === chat?.id) {
                setMessages((prev) => [...prev, message]);
                const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                if (message.sender_id !== currentUser.id && socket && isConnected) {
                    socket.emit("mark_read", {
                        chatId: chat.id,
                        messageIds: [message.id],
                    });
                }
            }
        };

        const handleMessagesRead = ({ messageIds, readerId, chatId }: { messageIds: number[]; readerId: number; chatId: number }) => {
            if (chatId === chat?.id) {
                setMessages((prev) => prev.map((msg) => (messageIds.includes(msg.id) && msg.sender_id !== readerId ? { ...msg, is_read: true, read_at: new Date().toISOString() } : msg)));
            }
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
                    message: inputMessage.trim(),
                });
                setInputMessage("");
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
                    Authorization: `Bearer ${token}`,
                },
            });

            if (socket && isConnected) {
                socket.emit("send_message", {
                    chatId: chat.id,
                    message: null,
                    imageUrl: type === "image" ? response.data.fileUrl : null,
                    fileUrl: type === "file" ? response.data.fileUrl : null,
                    fileName: type === "file" ? response.data.fileName : null,
                    fileSize: type === "file" ? response.data.fileSize : null,
                });
            }
        } catch (error) {
            console.error("Ошибка загрузки файла:", error);
            alert("Ошибка загрузки файла");
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
        const file = e.target.files?.[0];
        if (!file) return;

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
    };

    if (!chat) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                    <p className="text-lg">Выберите чат</p>
                    <p className="text-sm">или начните новый диалог</p>
                </div>
            </div>
        );
    }

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <div className="flex flex-col h-160 sm:h-full">
            <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="font-medium">
                        {chat.other_name} {chat.other_secondname}
                    </div>
                    <div className="text-sm text-muted-foreground">@{chat.other_username}</div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{isConnected ? "Подключено" : "Подключение..."}</div>
            </div>

            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <LoadingSpinner />
                ) : messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-center">
                        <div>
                            <p>Нет сообщений</p>
                            <p className="text-sm">Напишите что-нибудь...</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} isOwn={message.sender_id === currentUser.id} onEdit={handleEditMessage} onDelete={handleDeleteMessage} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            <div className="p-4 border-t mb-18 sm:mb-0">
                <div className="flex gap-2 items-end">
                    <div className="flex gap-1">
                        <input type="file" ref={imageInputRef} hidden accept="image/*" onChange={(e) => handleFileSelect(e, "image")} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => imageInputRef.current?.click()}>
                            <Image className="h-5 w-5" />
                        </Button>

                        <input type="file" ref={fileInputRef} hidden onChange={(e) => handleFileSelect(e, "file")} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                            <Paperclip className="h-5 w-5" />
                        </Button>

                        <div className="relative">
                            <Button type="button" variant="ghost" size="icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                <Smile className="h-5 w-5" />
                            </Button>
                            {showEmojiPicker && (
                                <div ref={emojiPickerRef} className="absolute bottom-full mb-2 right-0 z-50">
                                    <EmojiPicker onEmojiClick={onEmojiClick} />
                                </div>
                            )}
                        </div>
                    </div>

                    <Input placeholder="Введите сообщение..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} disabled={sending} className="flex-1" />

                    <Button onClick={sendMessage} disabled={!inputMessage.trim() || sending} size="icon">
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
