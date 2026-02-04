'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);

    // This useEffect ensures the component is mounted on the client
    // to avoid hydration mismatch errors.
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system" // Change from 'light' to 'system'
            enableSystem={true}   // Change from false to true
            storageKey="chat-theme-v2"
            disableTransitionOnChange
        >
            {children}
        </NextThemesProvider>
    );
}