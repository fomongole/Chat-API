import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Message } from '@/types';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: (e: React.FormEvent) => void;
    recipientName: string;
    replyTo: Message | null;
    onCancelReply: () => void;
}

export function ChatInput({ value, onChange, onSend, recipientName, replyTo, onCancelReply }: ChatInputProps) {
    return (
        <footer className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">

            {/* Reply Banner */}
            {replyTo && (
                <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg border-l-4 border-primary">
                    <div className="text-sm">
                        <span className="text-primary font-bold block">Replying to {replyTo.username}</span>
                        <span className="text-zinc-500 truncate block max-w-xs">
                            {replyTo.message || replyTo.content}
                        </span>
                    </div>
                    <button
                        onClick={onCancelReply}
                        className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                    </button>
                </div>
            )}

            <form onSubmit={onSend} className="flex gap-2 max-w-4xl w-full mx-auto">
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={replyTo ? "Type your reply..." : `Write to ${recipientName}...`}
                    className="flex-1 bg-zinc-50 dark:bg-zinc-900 border-none focus-visible:ring-1"
                    autoFocus
                />
                <Button type="submit">Send</Button>
            </form>
        </footer>
    );
}