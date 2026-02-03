'use client';

import { useEffect } from 'react';
import { useConfigStore } from '@/store/useConfigStore';

export function ThemeInitializer() {
    const primaryColor = useConfigStore((state) => state.primaryColor);

    useEffect(() => {
        document.documentElement.style.setProperty('--primary-color', primaryColor);
    }, [primaryColor]);

    return null;
}