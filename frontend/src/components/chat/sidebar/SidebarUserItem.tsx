import React from 'react';
import { toast } from "sonner";
import { User } from '@/types';
import { formatLastSeen } from '@/lib/formatTime';

interface SidebarUserItemProps {
    user: User;
    isActive: boolean;
    onClick: () => void;
    onViewProfile: (user: User) => void;
}

export function SidebarUserItem({ user, isActive, onClick, onViewProfile }: SidebarUserItemProps) {

    const handleAvatarClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (user.isPrivate) {
            toast.error("Privacy Restricted", {
                description: `${user.username} has set their profile to private.`,
                duration: 3000,
            });
            return;
        }
        onViewProfile(user);
    };

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            }`}
        >
            <div className="relative group/avatar" onClick={handleAvatarClick}>
                {user.image ? (
                    <img
                        src={user.image}
                        alt={user.username}
                        className="h-10 w-10 rounded-full object-cover border-2 border-zinc-100 bg-zinc-200"
                    />
                ) : (
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold border-2 ${
                        isActive ? "border-white/20 bg-white/10" : "border-primary/10 bg-primary/5 text-primary"
                    }`}>
                        {user.username[0].toUpperCase()}
                    </div>
                )}

                {/* Status Dot */}
                {user.isOnline && !user.isPrivate && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                )}
            </div>

            <div className="text-left overflow-hidden flex-1">
                <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold truncate">{user.username}</p>

                    {/* Typing Indicator Logic */}
                    {user.isTyping ? (
                        <span className="flex h-2 w-2 relative">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                isActive ? "bg-white" : "bg-primary"
                            }`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${
                                isActive ? "bg-white" : "bg-primary"
                            }`}></span>
                        </span>
                    ) : (
                        // NEW: Unread Badge (Only show if NOT typing)
                        (user.unreadCount || 0) > 0 && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                                isActive
                                    ? "bg-white text-primary"
                                    : "bg-red-500 text-white"
                            }`}>
                                {user.unreadCount}
                            </span>
                        )
                    )}
                </div>

                {/* Status Text Area */}
                <p className={`text-xs truncate ${isActive ? "text-white/70" : "text-zinc-500"}`}>
                    {user.isPrivate ? (
                        "Profile Private"
                    ) : user.isTyping ? (
                        <span className={`font-bold animate-pulse ${
                            isActive ? "text-white" : "text-primary"
                        }`}>
                            Typing...
                        </span>
                    ) : user.isOnline ? (
                        "Online"
                    ) : (
                        formatLastSeen(user.lastSeen)
                    )}
                </p>
            </div>
        </button>
    );
}