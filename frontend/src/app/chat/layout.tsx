'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useChatStore } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';

interface User {
    id: string;
    username: string;
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    const [users, setUsers] = useState<User[]>([]);
    const setActiveUser = useChatStore((state) => state.setActiveUser);
    const selectedUser = useChatStore((state) => state.activeUser);
    const currentUser = useAuthStore((state) => state.user);

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
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold border-2 ${
                                selectedUser?.id === user.id ? "border-white/20 bg-white/10" : "border-primary/10 bg-primary/5 text-primary"
                            }`}>
                                {user.username[0].toUpperCase()}
                            </div>
                            <div className="text-left overflow-hidden">
                                <p className="text-sm font-semibold truncate">{user.username}</p>
                                <p className={`text-xs truncate ${selectedUser?.id === user.id ? "text-white/70" : "text-zinc-500"}`}>
                                    Click to chat
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3 px-2">
                        <div className="h-8 w-8 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold truncate">{currentUser?.username}</p>
                            <p className="text-[10px] text-green-500 font-medium uppercase">Online</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Chat Content */}
            <main className="flex-1 flex flex-col relative">
                {children}
            </main>
        </div>
    );
}