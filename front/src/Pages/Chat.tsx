import { useState } from "react";
import { ChatList } from "@/components/Chat/ChatList";
import { ChatWindow } from "@/components/Chat/ChatWindow";
import { ScrollToTop } from "@/components/ScrollToTop";
import type { Chat } from "@/components/Chat/types";

export default function ChatPage() {
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

    const handleSelectChat = (chat: Chat) => {
        setSelectedChat(chat);
    };

    return (
        <div className="h-[calc(100vh-200px)]">
            <ScrollToTop />
            <div className="flex h-full border rounded-lg overflow-hidden bg-background">
                {/* Левая панель - список чатов */}
                <div className="w-80 border-r flex flex-col">
                    <ChatList onSelectChat={handleSelectChat} selectedChatId={selectedChat?.id || null} />
                </div>

                {/* Правая панель - окно чата */}
                <div className="flex-1">
                    <ChatWindow chat={selectedChat} />
                </div>
            </div>
        </div>
    );
}
