'use client';
import React from 'react';
import { useChatStore } from '@/store/useChatStore';
import { useConversation } from '@/hooks/chat/useConversation';
import { User } from '@/types';
import { getMessageDateLabel } from '@/lib/dateUtils';

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
        deleteMessage,
        replyTo,
        setReplyTo,
        isRemoteTyping,
        scrollRef
    } = useConversation(activeUser);

    if (!activeUser) return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <h3 className="text-xl font-bold">Select a conversation</h3>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
            <ChatHeader
                user={activeUser}
                isTyping={isRemoteTyping}
            />

            <div className="flex-1 overflow-y-auto p-6 space-y-2">
                {chatHistory.map((msg, i) => {
                    const isFromMe = msg.username !== activeUser.username;

                    // Date Grouping Logic
                    const showDateHeader = i === 0 ||
                        getMessageDateLabel(msg.timestamp) !== getMessageDateLabel(chatHistory[i - 1].timestamp);

                    return (
                        <React.Fragment key={msg.id || i}>
                            {showDateHeader && (
                                <div className="flex justify-center my-4">
                                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full uppercase tracking-wider">
                                        {getMessageDateLabel(msg.timestamp)}
                                    </span>
                                </div>
                            )}

                            <MessageBubble
                                message={msg}
                                isFromMe={isFromMe}
                                onReply={setReplyTo}
                                onDelete={deleteMessage}
                            />
                        </React.Fragment>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            <ChatInput
                value={message}
                onChange={setMessage}
                onSend={sendMessage}
                recipientName={activeUser.username}
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
            />
        </div>
    );
}