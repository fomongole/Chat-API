import React from 'react';

interface AuthHeaderProps {
    title: string;
    subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
    return (
        <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
                {subtitle}
            </p>
        </div>
    );
}