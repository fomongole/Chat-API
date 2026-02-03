'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginSchema, type LoginValues } from '@/validators/auth.validator';
import { useAuthStore } from '@/store/useAuthStore';
import {toast} from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    });

    const onSubmit = async (data: LoginValues) => {
        const loginPromise = api.post('/auth/login', data);

        toast.promise(loginPromise, {
            loading: 'Authenticating...',
            success: (response) => {
                const { user, token } = response.data;
                setAuth(user, token);
                router.push('/chat');
                return `Welcome back, ${user.username}!`;
            },
            error: (err) => err.response?.data?.message || 'Invalid email or password'
        });
    };

    return (
        <div className="mx-auto w-full max-w-sm space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Enter your credentials to access your conversations
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Email</label>
                    <Input
                        {...register('email')}
                        type="email"
                        autoComplete="email"
                        className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                        placeholder="name@example.com"
                    />
                    {errors.email && (
                        <p className="text-xs font-medium text-red-500">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium leading-none">Password</label>
                    </div>
                    <Input
                        {...register('password')}
                        type="password"
                        autoComplete="current-password"
                        className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                        placeholder="••••••••"
                    />
                    {errors.password && (
                        <p className="text-xs font-medium text-red-500">{errors.password.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Signing in...' : 'Login'}
                </Button>
            </form>

            <div className="text-center text-sm text-zinc-500">
                Don&#39;t have an account?{' '}
                <Link
                    href="/register"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                >
                    Sign up
                </Link>
            </div>
        </div>
    );
}