import React, { useState } from 'react';
import { User } from '@/types';
import { useChatStore } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api'; // Import your API helper

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

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await api.get(`/users/search?q=${query}`);
            setSearchResults(response.data.data.users);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearching(false);
        }
    };

    // Decide which list to show
    const displayUsers = searchQuery ? searchResults : users;

    return (
        <aside className="w-80 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/10 h-full">
            <SidebarHeader onSearch={handleSearch} />

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 mb-2">
                    {searchQuery ? "Search Results" : "Direct Messages"}
                </p>

                {displayUsers.length === 0 && (
                    <div className="text-center text-zinc-400 text-sm py-8">
                        {isSearching ? "Searching..." : "No users found"}
                    </div>
                )}

                {displayUsers.map((user) => (
                    <SidebarUserItem
                        key={user.id}
                        user={user}
                        isActive={selectedUser?.id === user.id}
                        onClick={() => {
                            setActiveUser(user);
                            // Optional: Clear search on select if you want
                            // setSearchQuery(''); 
                        }}
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