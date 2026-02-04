import React, { useState, useEffect, useRef } from 'react';
import { Message } from '@/types';
import { formatMessageTime } from '@/lib/dateUtils';
import { useAuthStore } from '@/store/useAuthStore';

interface MessageBubbleProps {
    message: Message;
    isFromMe: boolean;
    onReply: (msg: Message) => void;
    onDelete: (id: string) => void;
}

export function MessageBubble({ message, isFromMe, onReply, onDelete }: MessageBubbleProps) {
    const currentUser = useAuthStore(state => state.user);
    const canDelete = isFromMe && !message.isDeleted;

    // Local state to handle the "Are you sure?" toggle
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    // Ref to handle the timeout cleanup so we don't get memory leaks
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Effect to clean up the timer if the component unmounts
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const handleDeleteClick = () => {
        if (isConfirmingDelete) {
            onDelete(message.id);
            setIsConfirmingDelete(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        } else {
            setIsConfirmingDelete(true);
            timeoutRef.current = setTimeout(() => {
                setIsConfirmingDelete(false);
            }, 3000);
        }
    };

    return (
        <div className={`flex flex-col mb-2 ${isFromMe ? 'items-end' : 'items-start'} group/bubble`}>

            <div className={`relative max-w-[70%] rounded-2xl p-1 ${
                isFromMe ? 'bg-primary text-white' : 'bg-zinc-100 dark:bg-zinc-800'
            }`}>

                {/* 1. Reply Context */}
                {message.replyTo && (
                    <div className={`mb-1 mx-1 p-2 rounded-lg text-xs border-l-4 ${
                        isFromMe
                            ? 'bg-white/20 border-white/50 text-white/90'
                            : 'bg-zinc-200 dark:bg-zinc-700 border-primary text-zinc-600 dark:text-zinc-300'
                    }`}>
                        <span className="font-bold block">{message.replyTo.username}</span>
                        <span className="truncate block opacity-80">{message.replyTo.content}</span>
                    </div>
                )}

                {/* 2. Main Content */}
                <div className={`px-3 py-2 text-sm ${message.isDeleted ? "italic opacity-60" : ""}`}>
                    {message.isDeleted && (
                        <span className="inline-flex items-center gap-1 mr-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
                        </span>
                    )}
                    {message.message || message.content}
                </div>

                {/* 3. Timestamp & Read Receipts */}
                <div className={`text-[10px] px-3 pb-1 text-right flex items-center justify-end gap-1 ${
                    isFromMe ? 'text-white/60' : 'text-zinc-400'
                }`}>
                    {formatMessageTime(message.timestamp)}

                    {/* Read Receipts (Only on my messages) */}
                    {isFromMe && !message.isDeleted && (
                        <span title={message.isRead ? "Read" : "Sent"} className="flex items-center">
                            {message.isRead ? (
                                // Double Check (Read)
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-200"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>
                            ) : (
                                // Single Check (Sent)
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            )}
                        </span>
                    )}
                </div>
            </div>

            {/* 4. Action Buttons */}
            {!message.isDeleted && (
                <div className={`flex items-center gap-2 mt-1 px-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity ${
                    isFromMe ? 'flex-row-reverse' : 'flex-row'
                }`}>
                    <button
                        onClick={() => onReply(message)}
                        className="text-xs text-zinc-400 hover:text-primary transition-colors"
                        title="Reply"
                    >
                        Reply
                    </button>

                    {canDelete && (
                        <button
                            onClick={handleDeleteClick}
                            className={`text-xs transition-all duration-200 ${
                                isConfirmingDelete
                                    ? "text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full"
                                    : "text-zinc-400 hover:text-red-500"
                            }`}
                            title="Delete"
                        >
                            {isConfirmingDelete ? "Confirm?" : "Delete"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}