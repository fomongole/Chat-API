import { create } from 'zustand';
import { User } from '@/types';

interface ChatState {
    activeUser: User | null;
    setActiveUser: (user: User) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    activeUser: null,
    setActiveUser: (user) => set({ activeUser: user }),
}));