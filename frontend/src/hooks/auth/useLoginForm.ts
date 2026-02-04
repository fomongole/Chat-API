import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from "sonner";
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { loginSchema, type LoginValues } from '@/validators/auth.validator';

export const useLoginForm = () => {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const form = useForm<LoginValues>({
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
                const { token, data: { user } } = response.data;
                setAuth(user, token);
                router.push('/chat');
                return `Welcome back, ${user.username}!`;
            },
            error: (err) => err.response?.data?.message || 'Invalid email or password'
        });
    };

    return {
        register: form.register,
        handleSubmit: form.handleSubmit(onSubmit),
        errors: form.formState.errors,
        isSubmitting: form.formState.isSubmitting
    };
};