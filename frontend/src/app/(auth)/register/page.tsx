'use client';
import React from 'react';
import Link from 'next/link';
import { useRegisterForm } from '@/hooks/auth/useRegisterForm';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthField } from '@/components/auth/AuthField';

export default function RegisterPage() {
    const { register, handleSubmit, errors, isSubmitting } = useRegisterForm();

    return (
        <div className="mx-auto w-full max-w-sm space-y-6">
            <AuthHeader
                title="Create an account"
                subtitle="Enter your details below to set up your chat profile"
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
                    label="Username"
                    optionalLabel="(Optional)"
                    type="text"
                    placeholder="johndoe"
                    registration={register('username')}
                    error={errors.username}
                />

                <AuthField
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    registration={register('password')}
                    error={errors.password}
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                    {isSubmitting ? 'Creating account...' : 'Sign Up'}
                </button>
            </form>

            <div className="text-center text-sm text-zinc-500">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                    Login
                </Link>
            </div>
        </div>
    );
}