import React from 'react';
import { User } from '@/types';
import { useChatStore } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';

// Sub-components
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarUserItem } from './sidebar/SidebarUserItem';
import { SidebarFooter } from './sidebar/SidebarFooter';

interface ChatSidebarProps {
    users: User[];
    onProfileClick: () => void;
    onLogoutClick: () => void;
    onViewUser: (user: User) => void;
}

export default function ChatSidebar({ users, onProfileClick, onLogoutClick, onViewUser }: ChatSidebarProps) {
    const setActiveUser = useChatStore((state) => state.setActiveUser);
    const selectedUser = useChatStore((state) => state.activeUser);
    const currentUser = useAuthStore((state) => state.user);

    return (
        <aside className="w-80 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/10">
            <SidebarHeader />

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 mb-2">Direct Messages</p>
                {users.map((user) => (
                    <SidebarUserItem
                        key={user.id}
                        user={user}
                        isActive={selectedUser?.id === user.id}
                        onClick={() => setActiveUser(user)}
                        onViewProfile={onViewUser}
                    />
                ))}
            </div>

            <SidebarFooter
                currentUser={currentUser}
                onProfileClick={onProfileClick}
                onLogoutClick={onLogoutClick}
            />
        </aside>
    );
}