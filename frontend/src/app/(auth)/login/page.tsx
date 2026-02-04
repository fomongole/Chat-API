'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useLoginForm } from '@/hooks/auth/useLoginForm';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthField } from '@/components/auth/AuthField';

export default function LoginPage() {
    const { register, handleSubmit, errors, isSubmitting } = useLoginForm();

    return (
        <div className="mx-auto w-full max-w-sm space-y-6">
            <AuthHeader
                title="Welcome back"
                subtitle="Enter your credentials to access your conversations"
            />

            <form onSubmit={handleSubmit} className="space-y-4">
                <AuthField
                    label="Email"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    registration={register('email')}
                    error={errors.email}
                />

                <AuthField
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    registration={register('password')}
                    error={errors.password}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing in...' : 'Login'}
                </Button>
            </form>

            <div className="text-center text-sm text-zinc-500">
                Don&#39;t have an account?{' '}
                <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
                    Sign up
                </Link>
            </div>
        </div>
    );
}