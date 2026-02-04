'use client';
import React from 'react';
import { useChatStore } from '@/store/useChatStore';
import { useConversation } from '@/hooks/chat/useConversation';
import { User } from '@/types';

// Sub-components
import { ChatHeader } from '@/components/chat/window/ChatHeader';
import { MessageBubble } from '@/components/chat/window/MessageBubble';
import { ChatInput } from '@/components/chat/window/ChatInput';

export default function ChatPage() {
    const activeUser = useChatStore((state) => state.activeUser) as User | null;

    const {
        message,
        setMessage,
        chatHistory,
        sendMessage,
        scrollRef
    } = useConversation(activeUser);

    if (!activeUser) return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <h3 className="text-xl font-bold">Select a conversation</h3>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
            <ChatHeader user={activeUser} />

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatHistory.map((msg, i) => {
                    // Determine ownership
                    const isFromMe = msg.username !== activeUser.username && msg.author?.username !== activeUser.username;

                    return (
                        <MessageBubble
                            key={msg.id || i}
                            message={msg}
                            isFromMe={isFromMe}
                        />
                    );
                })}
                {/* Scroll Anchor */}
                <div ref={scrollRef} />
            </div>

            <ChatInput
                value={message}
                onChange={setMessage}
                onSend={sendMessage}
                recipientName={activeUser.username}
            />
        </div>
    );
}