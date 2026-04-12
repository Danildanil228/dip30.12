import { createContext, useContext, useState, ReactNode } from "react";

interface ChatContextType {
    isChatScreenActive: boolean;
    setIsChatScreenActive: (active: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [isChatScreenActive, setIsChatScreenActive] = useState(false);

    return (
        <ChatContext.Provider value={{ isChatScreenActive, setIsChatScreenActive }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChatContext() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChatContext must be used within ChatProvider");
    }
    return context;
}