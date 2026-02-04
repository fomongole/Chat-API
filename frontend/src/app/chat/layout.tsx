'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useChatStore } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocket } from '@/hooks/useSocket';
import { formatLastSeen } from '@/lib/formatTime';
import EditProfileModal from '@/components/EditProfileModal';
import LogoutModal from '@/components/LogoutModal';

interface User {
    id: string;
    username: string;
    image?: string;
    about?: string;
    isOnline: boolean;
    lastSeen?: string;
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    const [users, setUsers] = useState<User[]>([]);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    const setActiveUser = useChatStore((state) => state.setActiveUser);
    const selectedUser = useChatStore((state) => state.activeUser);

    const { user: currentUser, logout } = useAuthStore();
    const router = useRouter();
    const socket = useSocket();

    // Fetch initial users list
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/auth/users');
                setUsers(response.data.data.users);
            } catch (error) {
                console.error("Failed to load users:", error);
            }
        };
        fetchUsers();
    }, []);

    // Listen for real-time status updates
    useEffect(() => {
        if (!socket) return;

        const handleStatusChange = (data: { userId: string, isOnline: boolean, lastSeen: string }) => {
            setUsers(prevUsers => prevUsers.map(user => {
                if (user.id === data.userId) {
                    const updatedUser = { ...user, isOnline: data.isOnline, lastSeen: data.lastSeen };

                    // If this updated user is currently active in the chat window,
                    // update the store too so the header changes immediately.
                    if (selectedUser?.id === data.userId) {
                        setActiveUser(updatedUser);
                    }

                    return updatedUser;
                }
                return user;
            }));
        };

        socket.on("user_status_change", handleStatusChange);

        return () => {
            socket.off("user_status_change", handleStatusChange);
        };
    }, [socket, selectedUser, setActiveUser]);

    const handleLogout = () => {
        logout();
        if (socket) socket.disconnect();
        router.replace('/login');
    };

    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-950">
            {/* Sidebar */}
            <aside className="w-80 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/10">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-primary">Messages</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 mb-2">Direct Messages</p>
                    {users.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => setActiveUser(user)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                                selectedUser?.id === user.id
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                            }`}
                        >
                            <div className="relative">
                                {user.image ? (
                                    <img
                                        src={user.image}
                                        alt={user.username}
                                        className="h-10 w-10 rounded-full object-cover border-2 border-zinc-100 bg-zinc-200"
                                    />
                                ) : (
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold border-2 ${
                                        selectedUser?.id === user.id ? "border-white/20 bg-white/10" : "border-primary/10 bg-primary/5 text-primary"
                                    }`}>
                                        {user.username[0].toUpperCase()}
                                    </div>
                                )}

                                {user.isOnline && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                                )}
                            </div>

                            <div className="text-left overflow-hidden flex-1">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-semibold truncate">{user.username}</p>
                                </div>
                                <p className={`text-xs truncate ${selectedUser?.id === user.id ? "text-white/70" : "text-zinc-500"}`}>
                                    {user.isOnline ? "Online" : formatLastSeen(user.lastSeen)}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex-1 flex items-center gap-3 cursor-pointer group"
                            onClick={() => setIsProfileOpen(true)}
                        >
                            <div className="h-8 w-8 rounded-full bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center overflow-hidden border border-transparent group-hover:border-primary transition-all">
                                {currentUser?.image ? (
                                    <img src={currentUser.image} alt="Me" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-xs font-bold">{currentUser?.username?.[0]?.toUpperCase()}</span>
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{currentUser?.username}</p>
                                <p className="text-[10px] text-zinc-500 font-medium uppercase truncate">
                                    {currentUser?.about || "Edit Profile"}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsLogoutOpen(true)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            title="Log Out"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col relative">
                {children}
            </main>

            <EditProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
            <LogoutModal
                isOpen={isLogoutOpen}
                onClose={() => setIsLogoutOpen(false)}
                onConfirm={handleLogout}
            />
        </div>
    );
}