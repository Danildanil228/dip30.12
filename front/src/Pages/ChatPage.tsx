import { useState } from "react";
import { ChatList } from "@/components/Chat/ChatList";
import { ChatWindow } from "@/components/Chat/ChatWindow";
import type { Chat } from "@/components/Chat/types";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export default function ChatPage() {
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

    return (
        <div className="text-base">
            <div className="flex h-full border rounded-lg overflow-hidden bg-background">
                <ResizablePanelGroup orientation="horizontal">
                    <ResizablePanel defaultSize={33}>
                        <div className="flex flex-col h-full">
                            <ChatList onSelectChat={setSelectedChat} selectedChatId={selectedChat?.id || null} />
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={67}>
                        <div className="flex-1 flex flex-col h-full">
                            <ChatWindow chat={selectedChat} />
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}