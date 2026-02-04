import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from "sonner";
import { User, Message } from '@/types';

export const useConversation = (activeUser: User | null) => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const socket = useSocket();
    const currentUser = useAuthStore((state) => state.user);

    // Auto-scroll to bottom when history changes
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    useEffect(() => {
        if (!socket || !activeUser) return;

        socket.emit("join_conversation", { recipientId: activeUser.id });

        socket.on("conversation_joined", (data: { conversationId: string }) => {
            setConversationId(data.conversationId);
        });

        socket.on("load_history", (history: Message[]) => {
            setChatHistory(history);
            if (history.length > 0) setConversationId(history[0].conversationId || null);
        });

        socket.on("receive_message", (newMessage: Message) => {
            setChatHistory((prev) => [...prev, newMessage]);
            if (currentUser && newMessage.username !== currentUser.username) {
                toast.info(`New message from ${newMessage.username}`, {
                    description: (newMessage.message || newMessage.content || "").substring(0, 30),
                });
            }
        });

        return () => {
            socket.off("conversation_joined");
            socket.off("load_history");
            socket.off("receive_message");
        };
    }, [socket, activeUser, currentUser]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !socket || !activeUser || !conversationId) return;

        socket.emit("send_message", { conversationId, recipientId: activeUser.id, message });
        setMessage('');
    };

    return {
        message,
        setMessage,
        chatHistory,
        sendMessage,
        scrollRef
    };
};