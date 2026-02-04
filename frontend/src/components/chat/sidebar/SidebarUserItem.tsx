import React from 'react';
import { toast } from "sonner";
import { User } from '@/types';
import { formatLastSeen } from '@/lib/formatTime';
import { formatMessageTime } from '@/lib/dateUtils';

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
            <div className="relative group/avatar shrink-0" onClick={handleAvatarClick}>
                {user.image ? (
                    <img
                        src={user.image}
                        alt={user.username}
                        className="h-12 w-12 rounded-full object-cover border-2 border-zinc-100 bg-zinc-200"
                    />
                ) : (
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${
                        isActive ? "border-white/20 bg-white/10" : "border-primary/10 bg-primary/5 text-primary"
                    }`}>
                        {user.username[0].toUpperCase()}
                    </div>
                )}

                {/* Status Dot */}
                {user.isOnline && !user.isPrivate && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                )}
            </div>

            <div className="text-left overflow-hidden flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                    <p className="text-sm font-semibold truncate pr-2">{user.username}</p>

                    {/* Timestamp of last message */}
                    {user.lastActivity && (
                        <span className={`text-[10px] shrink-0 ${isActive ? "text-white/70" : "text-zinc-400"}`}>
                            {formatMessageTime(new Date(user.lastActivity).toISOString())}
                        </span>
                    )}
                </div>

                <div className="flex justify-between items-center">
                    {/* Status / Last Message Area */}
                    <div className={`text-xs truncate pr-2 flex-1 ${isActive ? "text-white/80" : "text-zinc-500"}`}>
                        {user.isTyping ? (
                            <span className={`font-bold animate-pulse ${
                                isActive ? "text-white" : "text-primary"
                            }`}>
                                Typing...
                            </span>
                        ) : (
                            // Last Message Preview
                            user.lastMessage ? (
                                <span className="truncate block">
                                    {user.lastMessage}
                                </span>
                            ) : (
                                // Fallback to Status
                                <span className="italic opacity-80">
                                    {user.isPrivate
                                        ? "Profile Private"
                                        : (user.isOnline ? "Online" : formatLastSeen(user.lastSeen))
                                    }
                                </span>
                            )
                        )}
                    </div>

                    {/* Unread Badge (Pill Shape Fix) */}
                    {!user.isTyping && (user.unreadCount || 0) > 0 && (
                        <span className={`
                            text-[10px] font-bold h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full shrink-0
                            ${isActive
                            ? "bg-white text-primary"
                            : "bg-red-500 text-white shadow-sm shadow-red-500/30"
                        }
                        `}>
                            {user.unreadCount! > 99 ? '99+' : user.unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}