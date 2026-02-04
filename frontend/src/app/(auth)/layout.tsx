import React from 'react';
import { AuthBranding } from '@/components/auth/AuthBranding';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            {/* Left Side: Form */}
            <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 xl:px-24">
                {children}
            </div>

            {/* Right Side: Branding */}
            <AuthBranding />
        </div>
    );
}