import React from 'react';
import { User } from '@/types';
import { formatLastSeen } from '@/lib/formatTime';

interface ChatHeaderProps {
    user: User;
}

export function ChatHeader({ user }: ChatHeaderProps) {
    return (
        <header className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-primary flex items-center justify-center text-white font-bold">
                    {user.image ? (
                        <img src={user.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <span>{user.username[0].toUpperCase()}</span>
                    )}
                </div>
                <div>
                    <h3 className="font-bold leading-none">{user.username}</h3>
                    {user.isPrivate ? (
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider italic">Profile Private</span>
                    ) : (
                        user.isOnline ? (
                            <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Active Now</span>
                        ) : (
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                {formatLastSeen(user.lastSeen)}
                            </span>
                        )
                    )}
                </div>
            </div>
        </header>
    );
}