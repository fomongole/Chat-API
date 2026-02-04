import React from 'react';
import { Message } from '@/types';

interface MessageBubbleProps {
    message: Message;
    isFromMe: boolean;
}

export function MessageBubble({ message, isFromMe }: MessageBubbleProps) {
    return (
        <div className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[70%] p-4 rounded-2xl text-sm ${
                isFromMe
                    ? 'bg-primary text-white'
                    : 'bg-zinc-100 dark:bg-zinc-900'
            }`}>
                {message.message || message.content}
            </div>
        </div>
    );
}