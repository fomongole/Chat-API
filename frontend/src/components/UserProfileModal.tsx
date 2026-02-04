'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { formatLastSeen } from '@/lib/formatTime';

interface User {
    id: string;
    username: string;
    image?: string;
    about?: string;
    isOnline: boolean;
    lastSeen?: string;
    isPrivate?: boolean;
}

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export default function UserProfileModal({ isOpen, onClose, user }: UserProfileModalProps) {
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl w-full max-w-sm shadow-xl border border-zinc-200 dark:border-zinc-800 relative animate-in fade-in zoom-in duration-200">

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                <div className="flex flex-col items-center text-center">
                    {/* Large Avatar */}
                    <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-zinc-100 dark:border-zinc-800 bg-zinc-200 mb-4 relative">
                        {user.image ? (
                            <img src={user.image} alt={user.username} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800">
                                {user.username[0].toUpperCase()}
                            </div>
                        )}
                        {/* Status Indicator */}
                        {user.isOnline && (
                            <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white dark:border-zinc-900 rounded-full"></span>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{user.username}</h2>

                    {/* Status Text */}
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-6">
                        {user.isOnline ? (
                            <span className="text-green-500">Active Now</span>
                        ) : (
                            formatLastSeen(user.lastSeen)
                        )}
                    </p>

                    {/* About Section - Respect Privacy */}
                    <div className="w-full bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl text-left">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">About</h3>
                        {user.isPrivate ? (
                            <div className="flex items-center gap-2 text-zinc-500 italic">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                <span>This profile is private</span>
                            </div>
                        ) : (
                            <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                                {user.about || "No bio available."}
                            </p>
                        )}
                    </div>

                    <div className="w-full mt-6">
                        <Button onClick={onClose} className="w-full py-6 rounded-xl">
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}