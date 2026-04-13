import { useState } from "react";
import { ChatList } from "@/components/Chat/ChatList";
import { ChatWindow } from "@/components/Chat/ChatWindow";
import type { Chat } from "@/components/Chat/types";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export default function ChatPage() {
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

    return (
        <div className="text-base h-130 border rounded-sm">
            <div className="">
                <ResizablePanelGroup orientation="horizontal">
                    <ResizablePanel defaultSize={33}>
                        <div className="">
                            <ChatList onSelectChat={setSelectedChat} selectedChatId={selectedChat?.id || null} />
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={67}>
                        <div className="">
                            <ChatWindow chat={selectedChat} />
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
            {/* <div className="md:hidden">
                fsdfs
            </div> */}
        </div>
    );
}