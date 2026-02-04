import React from 'react';
import { User } from '@/types';

interface SidebarFooterProps {
    currentUser: User | null;
    onProfileClick: () => void;
    onLogoutClick: () => void;
}

export function SidebarFooter({ currentUser, onProfileClick, onLogoutClick }: SidebarFooterProps) {
    return (
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-3 cursor-pointer group" onClick={onProfileClick}>
                    <div className="h-8 w-8 rounded-full bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center overflow-hidden border border-transparent group-hover:border-primary">
                        {currentUser?.image ? (
                            <img src={currentUser.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-xs font-bold">{currentUser?.username?.[0]?.toUpperCase()}</span>
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                            {currentUser?.username}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-medium uppercase truncate">
                            {currentUser?.isPrivate ? "🔒 Private" : (currentUser?.about || "Edit Profile")}
                        </p>
                    </div>
                </div>
                <button onClick={onLogoutClick} className="p-2 rounded-lg text-zinc-400 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                </button>
            </div>
        </div>
    );
}