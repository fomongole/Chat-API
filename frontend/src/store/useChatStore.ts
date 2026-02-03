import { create } from 'zustand';

interface ChatUser {
    id: string;
    username: string;
}

interface ChatState {
    activeUser: ChatUser | null;
    setActiveUser: (user: ChatUser) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    activeUser: null,
    setActiveUser: (user) => set({ activeUser: user }),
}));