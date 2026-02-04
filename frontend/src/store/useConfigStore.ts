import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConfigState {
    primaryColor: string;
    setPrimaryColor: (color: string) => void;
}

export const useConfigStore = create<ConfigState>()(
    persist(
        (set) => ({
            primaryColor: '#2563eb', // Default Blue
            setPrimaryColor: (color) => {
                // Update the CSS variable on the document root
                document.documentElement.style.setProperty('--primary-color', color);
                set({ primaryColor: color });
            },
        }),
        {
            name: 'config-storage', // Save to local storage
            onRehydrateStorage: () => (state) => {
                // When the store loads from storage, apply the color immediately
                if (state) {
                    document.documentElement.style.setProperty('--primary-color', state.primaryColor);
                }
            },
        }
    )
);