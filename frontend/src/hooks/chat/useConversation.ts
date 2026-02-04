import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/store/useAuthStore';
import { User, Message } from '@/types';

export const useConversation = (activeUser: User | null) => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [replyTo, setReplyTo] = useState<Message | null>(null);
    const [isRemoteTyping, setIsRemoteTyping] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const socket = useSocket();
    const currentUser = useAuthStore((state) => state.user);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isRemoteTyping, replyTo]);

    useEffect(() => {
        if (!socket || !activeUser) return;

        // Join the specific conversation room
        socket.emit("join_conversation", { recipientId: activeUser.id });

        const handleConversationJoined = (data: { conversationId: string }) => {
            setConversationId(data.conversationId);
            socket.emit("mark_as_read", {
                conversationId: data.conversationId,
                recipientId: activeUser.id
            });
        };

        const handleLoadHistory = (history: Message[]) => {
            setChatHistory(history);
        };

        const handleReceiveMessage = (newMessage: Message) => {
            setChatHistory((prev) => {
                if (prev.some(m => m.id === newMessage.id)) return prev;

                // If message isn't for this active conversation, ignore it
                if (newMessage.conversationId !== conversationId) {
                    return prev;
                }
                return [...prev, newMessage];
            });

            // If the person we are talking to sent a message, stop the typing animation
            if (newMessage.authorId === activeUser.id) {
                setIsRemoteTyping(false);
            }

            if (document.visibilityState === 'visible' && newMessage.conversationId === conversationId) {
                socket.emit("mark_as_read", {
                    conversationId: newMessage.conversationId,
                    recipientId: activeUser.id
                });
            }
        };

        const handleMessageDeleted = (deletedMsg: Message) => {
            setChatHistory(prev => prev.map(msg => msg.id === deletedMsg.id ? deletedMsg : msg));
        };

        const handleUserTyping = (data: { userId: string }) => {
            // Is the person typing (data.userId) the person I am looking at (activeUser.id)?
            if (data.userId === activeUser.id) {
                setIsRemoteTyping(true);
            }
        };

        const handleUserStopTyping = (data: { userId: string }) => {
            // Only stop typing if the active user stopped
            if (data.userId === activeUser.id) {
                setIsRemoteTyping(false);
            }
        };

        const handleUserStatusChange = (data: { userId: string, isOnline: boolean }) => {
            if (data.userId === activeUser.id && !data.isOnline) {
                setIsRemoteTyping(false);
            }
        };

        const handleMessagesRead = (data: { conversationId: string, readerId: string }) => {
            if (data.conversationId === conversationId && data.readerId === activeUser.id) {
                setChatHistory(prev => prev.map(msg => ({ ...msg, isRead: true })));
            }
        };

        socket.on("conversation_joined", handleConversationJoined);
        socket.on("load_history", handleLoadHistory);
        socket.on("receive_message", handleReceiveMessage);
        socket.on("message_deleted", handleMessageDeleted);
        socket.on("user_typing", handleUserTyping);
        socket.on("user_stop_typing", handleUserStopTyping);
        socket.on("user_status_change", handleUserStatusChange);
        socket.on("messages_read", handleMessagesRead);

        return () => {
            socket.off("conversation_joined", handleConversationJoined);
            socket.off("load_history", handleLoadHistory);
            socket.off("receive_message", handleReceiveMessage);
            socket.off("message_deleted", handleMessageDeleted);
            socket.off("user_typing", handleUserTyping);
            socket.off("user_stop_typing", handleUserStopTyping);
            socket.off("user_status_change", handleUserStatusChange);
            socket.off("messages_read", handleMessagesRead);
        };
    }, [socket, activeUser, currentUser, conversationId]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !socket || !activeUser || !conversationId) return;

        socket.emit("send_message", {
            conversationId,
            recipientId: activeUser.id,
            message,
            replyToId: replyTo?.id
        });

        setMessage('');
        setReplyTo(null);

        socket.emit("stop_typing", { conversationId, recipientId: activeUser.id });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };

    const deleteMessage = (messageId: string) => {
        if (!socket || !conversationId) return;
        socket.emit("delete_message", { conversationId, messageId });
    };

    const handleTyping = (text: string) => {
        setMessage(text);

        if (!socket || !conversationId || !activeUser) return;
        if (currentUser?.isPrivate) return;

        socket.emit("typing", { conversationId, recipientId: activeUser.id });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            if (activeUser) {
                socket.emit("stop_typing", { conversationId, recipientId: activeUser.id });
            }
        }, 2000);
    };

    return {
        message,
        setMessage: handleTyping,
        chatHistory,
        conversationId,
        sendMessage,
        deleteMessage,
        replyTo,
        setReplyTo,
        isRemoteTyping,
        scrollRef
    };
};