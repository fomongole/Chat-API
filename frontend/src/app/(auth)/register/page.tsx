'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { registerSchema, type RegisterValues } from '@/validators/auth.validator';
import {toast} from "sonner";

export default function RegisterPage() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            username: '',
            password: '',
        }
    });

    const onSubmit = async (data: RegisterValues) => {
        try {
            const payload = {
                ...data,
                username: data.username === '' ? undefined : data.username,
            };

            await api.post('/auth/register', payload);
            toast.success('Account created! Please login.');
            router.push('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="mx-auto w-full max-w-sm space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Enter your details below to set up your chat profile
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email Field */}
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

                {/* Username Field */}
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                        Username <span className="text-xs text-zinc-400 font-normal">(Optional)</span>
                    </label>
                    <Input
                        {...register('username')}
                        type="text"
                        placeholder="johndoe"
                    />
                    {errors.username && (
                        <p className="text-xs font-medium text-red-500">{errors.username.message}</p>
                    )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Password</label>
                    <Input
                        {...register('password')}
                        type="password"
                        autoComplete="new-password"
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
                    {isSubmitting ? 'Creating account...' : 'Sign Up'}
                </Button>
            </form>

            <div className="text-center text-sm text-zinc-500">
                Already have an account?{' '}
                <Link
                    href="/login"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                >
                    Login
                </Link>
            </div>
        </div>
    );
}