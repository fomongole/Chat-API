import { create } from 'zustand';

interface ConfigState {
    primaryColor: string;
    setPrimaryColor: (color: string) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
    primaryColor: '#2563eb', // Default Blue
    setPrimaryColor: (color) => {
        // Update the CSS variable on the document root
        document.documentElement.style.setProperty('--primary-color', color);
        set({ primaryColor: color });
    },
}));