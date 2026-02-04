'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocket } from '@/hooks/useSocket';
import { useChatList } from '@/hooks/chat/useChatList';
import { User } from '@/types';

// Components
import ChatSidebar from '@/components/chat/ChatSidebar';
import EditProfileModal from '@/components/EditProfileModal';
import LogoutModal from '@/components/LogoutModal';
import UserProfileModal from '@/components/UserProfileModal';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    const { users } = useChatList();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [viewingUser, setViewingUser] = useState<User | null>(null);

    const { logout } = useAuthStore();
    const router = useRouter();
    const socket = useSocket();

    const handleLogout = () => {
        logout();
        if (socket) socket.disconnect();
        router.replace('/login');
    };

    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-950">
            <ChatSidebar
                users={users}
                onProfileClick={() => setIsProfileOpen(true)}
                onLogoutClick={() => setIsLogoutOpen(true)}
                onViewUser={(user) => setViewingUser(user)}
            />

            <main className="flex-1 flex flex-col relative">{children}</main>

            <EditProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
            <UserProfileModal isOpen={!!viewingUser} user={viewingUser} onClose={() => setViewingUser(null)} />
            <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} onConfirm={handleLogout} />
        </div>
    );
}