'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSocket } from '@/hooks/useSocket';
import { useChatStore } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import { formatLastSeen } from '@/lib/formatTime'; // Import this
import { toast } from "sonner";

export default function ChatPage() {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const socket = useSocket();
    // activeUser updates automatically
    const activeUser = useChatStore((state) => state.activeUser);
    const currentUser = useAuthStore((state) => state.user);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    useEffect(() => {
        if (!socket || !activeUser) return;

        socket.emit("join_conversation", { recipientId: activeUser.id });

        // Listen for the ID immediately (Prevents crash on new chats)
        socket.on("conversation_joined", (data: { conversationId: string }) => {
            setConversationId(data.conversationId);
        });

        socket.on("load_history", (history: any[]) => {
            setChatHistory(history);
            // Fallback: If we reconnect, we might get ID here too
            if (history.length > 0) {
                setConversationId(history[0].conversationId);
            }
        });

        socket.on("receive_message", (newMessage: any) => {
            setChatHistory((prev) => [...prev, newMessage]);

            if (currentUser && newMessage.username !== currentUser.username) {
                const previewText = (newMessage.message || newMessage.content || "");
                toast.info(`New message from ${newMessage.username}`, {
                    description: previewText.substring(0, 30) + (previewText.length > 30 ? '...' : ''),
                });
            }
        });

        return () => {
            socket.off("conversation_joined"); // Clean up
            socket.off("load_history");
            socket.off("receive_message");
        };
    }, [socket, activeUser, currentUser]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        // Guard clause: Cannot send if conversationId is missing
        if (!message.trim() || !socket || !activeUser || !conversationId) return;

        socket.emit("send_message", {
            conversationId: conversationId,
            recipientId: activeUser.id,
            message: message
        });

        setMessage('');
    };

    if (!activeUser) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-xl font-bold">Select a conversation</h3>
                <p className="text-zinc-500 max-w-xs mt-2">Pick a teammate from the sidebar to start collaborating in real-time.</p>
            </div>
        );
    }

    // Casting activeUser to any to access dynamic props if interface isn't fully updated in global types
    const user = activeUser as any;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
            {/* Header Area */}
            <header className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-primary flex items-center justify-center text-white font-bold relative">
                        {user.image ? (
                            <img src={user.image} alt={user.username} className="h-full w-full object-cover" />
                        ) : (
                            <span>{user.username[0].toUpperCase()}</span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold leading-none">{user.username}</h3>

                        {/* FIX: Dynamic Status Text */}
                        {user.isOnline ? (
                            <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Active Now</span>
                        ) : (
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                {formatLastSeen(user.lastSeen)}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Messages Display Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatHistory.map((msg, i) => {
                    const isFromMe = msg.username !== activeUser.username && msg.author?.username !== activeUser.username;

                    return (
                        <div key={msg.id || i} className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}>
                            <span className="text-[10px] text-zinc-400 mb-1 px-1 uppercase font-bold tracking-tighter">
                                {msg.username || msg.author?.username}
                            </span>
                            <div className={`max-w-[70%] p-4 rounded-2xl text-sm shadow-sm ${
                                isFromMe
                                    ? 'bg-primary text-white rounded-tr-none'
                                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-tl-none'
                            }`}>
                                {msg.message || msg.content}
                            </div>
                            <span className="text-[10px] text-zinc-400 mt-1 px-1">
                                {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input Footer */}
            <footer className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <form onSubmit={handleSend} className="flex gap-2 max-w-4xl mx-auto">
                    <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Write to ${activeUser.username}...`}
                        className="flex-1 bg-zinc-50 dark:bg-zinc-900 border-none focus-visible:ring-primary/20"
                    />
                    <Button type="submit" className="rounded-full px-6 shadow-lg shadow-primary/20 transition-transform active:scale-95">
                        Send
                    </Button>
                </form>
            </footer>
        </div>
    );
}