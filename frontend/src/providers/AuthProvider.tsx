'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { token } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isHydrated, setIsHydrated] = useState(false);

    // Wait for Zustand to load from LocalStorage (Hydration)
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated) return;

        const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
        const isPublicPage = pathname === '/';

        if (!token && !isAuthPage && !isPublicPage) {
            router.replace('/login');
        }

        if (token && isAuthPage) {
            router.replace('/chat');
        }
    }, [token, isHydrated, pathname, router]);

    // Prevent flicker while checking auth
    if (!isHydrated) return null;

    return <>{children}</>;
}