import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import {Toaster} from "sonner";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Enterprise Chat",
    description: "Secure, real-time communication platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        {/* Added bg-white to body to ensure it defaults to white */}
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50`}>
        <ThemeProvider>
            <ThemeInitializer />
            <AuthProvider>
                {children}
                {/* RichColors adds the green/red/blue styles to success/error/info */}
                <Toaster position="top-right" richColors closeButton />
            </AuthProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}