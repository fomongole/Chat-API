import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { useChatStore } from '@/store/useChatStore';
import { toast } from "sonner";
import { User } from '@/types';

export const useTeamData = () => {
    const [users, setUsers] = useState<User[]>([]);
    // This state variable exists solely to force a re-render
    const [, setTick] = useState(0);

    const socket = useSocket();
    const setActiveUser = useChatStore((state) => state.setActiveUser);
    const selectedUser = useChatStore((state) => state.activeUser);

    // Helper to force the UI to update time strings
    const forceUpdate = useCallback(() => {
        setTick(t => t + 1);
    }, []);

    // 1. Initial Fetch
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/users');
                setUsers(response.data.data.users);
            } catch (error) {
                console.error("Failed to load users:", error);
                toast.error("Failed to sync team list.");
            }
        };
        fetchUsers();
    }, []);

    // 2. The "Heartbeat" Timer & Wake-up Handler
    useEffect(() => {
        const intervalId = setInterval(forceUpdate, 60000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                forceUpdate();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", forceUpdate);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", forceUpdate);
        };
    }, [forceUpdate]);

    // 3. Socket Event Listeners
    useEffect(() => {
        if (!socket) return;

        // Connectivity Update (Online/Offline)
        const handleStatusChange = (data: { userId: string, isOnline: boolean, lastSeen: string }) => {
            // A. Update the list (Pure state update)
            setUsers(prevUsers => prevUsers.map(user => {
                if (user.id === data.userId) {
                    return { ...user, isOnline: data.isOnline, lastSeen: data.lastSeen };
                }
                return user;
            }));

            // B. Update the active user (Side effect) - DONE SEPARATELY
            if (selectedUser?.id === data.userId) {
                // We use the existing selectedUser and merge the new data
                setActiveUser({
                    ...selectedUser,
                    isOnline: data.isOnline,
                    lastSeen: data.lastSeen
                });
            }
        };

        // Profile Update (Bio, Image, Privacy)
        const handleUserUpdate = (data: any) => {
            // A. Update the list
            setUsers(prevUsers => prevUsers.map(user => {
                if (user.id === data.userId) {
                    return { ...user, ...data };
                }
                return user;
            }));

            // B. Update the active user - DONE SEPARATELY
            if (selectedUser?.id === data.userId) {
                setActiveUser({ ...selectedUser, ...data });
            }
        };

        socket.on("user_status_change", handleStatusChange);
        socket.on("user_update", handleUserUpdate);

        return () => {
            socket.off("user_status_change", handleStatusChange);
            socket.off("user_update", handleUserUpdate);
        };
    }, [socket, selectedUser, setActiveUser]);

    return { users };
};