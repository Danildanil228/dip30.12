import { useState } from "react";
import { ChatList } from "@/components/Chat/ChatList";
import { ChatWindow } from "@/components/Chat/ChatWindow";
import type { Chat } from "@/components/Chat/types";

export default function ChatPage() {
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

    return (
        <div className="flex h-screen">
            <div className="w-96 border-r flex flex-col">
                <ChatList onSelectChat={setSelectedChat} selectedChatId={selectedChat?.id || null} />
            </div>
            <div className="flex-1 flex flex-col">
                <ChatWindow chat={selectedChat} />
            </div>
        </div>
    );
}