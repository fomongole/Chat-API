import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/store/useAuthStore';
import { User, Message } from '@/types';

/**
 * Custom Hook: useConversation
 * * Manages the logic for a specific active chat window.
 * * Responsibilities:
 * 1. Joins the specific Socket.io room for the conversation.
 * 2. Fetches and stores chat history.
 * 3. Handles sending messages, deleting messages, and typing indicators.
 * 4. Manages the "Active Chat" state (e.g., preventing messages from other chats appearing here).
 */
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

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isRemoteTyping, replyTo]);

    // ----------------------------------------------------
    // CONVERSATION LIFECYCLE
    // ----------------------------------------------------
    useEffect(() => {
        if (!socket || !activeUser) return;

        // Step 1: Join the room.
        // The backend will create the conversation if it doesn't exist.
        socket.emit("join_conversation", { recipientId: activeUser.id });

        const handleConversationJoined = (data: { conversationId: string }) => {
            setConversationId(data.conversationId);
            // Immediately mark as read since we just opened the window
            socket.emit("mark_as_read", {
                conversationId: data.conversationId,
                recipientId: activeUser.id
            });
        };

        const handleLoadHistory = (history: Message[]) => {
            setChatHistory(history);
        };

        // Step 2: Listen for incoming messages
        const handleReceiveMessage = (newMessage: Message) => {
            setChatHistory((prev) => {
                // Deduplication check
                if (prev.some(m => m.id === newMessage.id)) return prev;

                // SECURITY / BUG FIX: Ghost Message Prevention
                // Ensure this message actually belongs to the conversation we are currently looking at.
                if (newMessage.conversationId !== conversationId) {
                    return prev;
                }
                return [...prev, newMessage];
            });

            // If the other person sent a message, they stopped typing.
            if (newMessage.authorId === activeUser.id) {
                setIsRemoteTyping(false);
            }

            // Mark read if window is focused
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

        // Step 3: Handle Typing Indicators
        const handleUserTyping = (data: { userId: string }) => {
            // Strict Check: Is the person typing actually the person I'm talking to?
            if (data.userId === activeUser.id) {
                setIsRemoteTyping(true);
            }
        };

        const handleUserStopTyping = (data: { userId: string }) => {
            if (data.userId === activeUser.id) {
                setIsRemoteTyping(false);
            }
        };

        const handleUserStatusChange = (data: { userId: string, isOnline: boolean }) => {
            if (data.userId === activeUser.id && !data.isOnline) {
                setIsRemoteTyping(false);
            }
        };

        // Step 4: Handle Read Receipts (Double Checks)
        const handleMessagesRead = (data: { conversationId: string, readerId: string }) => {
            if (data.conversationId === conversationId && data.readerId === activeUser.id) {
                setChatHistory(prev => prev.map(msg => ({ ...msg, isRead: true })));
            }
        };

        // Register Listeners
        socket.on("conversation_joined", handleConversationJoined);
        socket.on("load_history", handleLoadHistory);
        socket.on("receive_message", handleReceiveMessage);
        socket.on("message_deleted", handleMessageDeleted);
        socket.on("user_typing", handleUserTyping);
        socket.on("user_stop_typing", handleUserStopTyping);
        socket.on("user_status_change", handleUserStatusChange);
        socket.on("messages_read", handleMessagesRead);

        // Cleanup: Important to prevent memory leaks and duplicate listeners
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

    // ----------------------------------------------------
    // ACTIONS
    // ----------------------------------------------------

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

        // Stop typing indicator immediately after send
        socket.emit("stop_typing", { conversationId, recipientId: activeUser.id });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };

    const deleteMessage = (messageId: string) => {
        if (!socket || !conversationId) return;
        socket.emit("delete_message", { conversationId, messageId });
    };

    /**
     * Handles typing input with debounced "stop typing" emission.
     */
    const handleTyping = (text: string) => {
        setMessage(text);

        if (!socket || !conversationId || !activeUser) return;
        if (currentUser?.isPrivate) return;

        socket.emit("typing", { conversationId, recipientId: activeUser.id });

        // Debounce: Wait 2 seconds of inactivity before sending "stop_typing"
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