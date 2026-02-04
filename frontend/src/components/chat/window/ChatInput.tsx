import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: (e: React.FormEvent) => void;
    recipientName: string;
}

export function ChatInput({ value, onChange, onSend, recipientName }: ChatInputProps) {
    return (
        <footer className="p-4 border-t border-zinc-200 dark:border-zinc-800">
            <form onSubmit={onSend} className="flex gap-2 max-w-4xl mx-auto">
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={`Write to ${recipientName}...`}
                    className="flex-1 bg-zinc-50 dark:bg-zinc-900 border-none"
                />
                <Button type="submit">Send</Button>
            </form>
        </footer>
    );
}