'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { API_ROUTES } from '@/lib/constants';
import type { LoginFormData, RegisterFormData } from '@/schemas/authSchema';
import type { ApiResponse, AuthResponse, UserResponse } from '@/types';

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
}

export function useAuth() {
    const router = useRouter();
    const { setAuth, logout: storeLogout } = useAuthStore();
    const [error, setError] = useState<string | null>(null);

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: async (data: LoginRequest) => {
            const response = await api.post<ApiResponse<AuthResponse>>(
                API_ROUTES.LOGIN,
                data
            );
            return response.data;
        },
        onSuccess: async (response) => {
            const { accessToken, refreshToken } = response.data;

            // Fetch user info
            const userResponse = await api.get<ApiResponse<UserResponse>>(
                API_ROUTES.ME,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            const user = userResponse.data.data;

            setAuth(
                {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                },
                accessToken,
                refreshToken
            );

            setError(null);

            // Redirect based on role
            if (user.role === 'ADMIN') {
                router.push('/admin/dashboard');
            } else if (user.role === 'ORGANIZER') {
                router.push('/dashboard');
            } else {
                router.push('/events');
            }
        },
        onError: (err: Error & { response?: { data?: { message?: string } } }) => {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        },
    });

    // Register mutation
    const registerMutation = useMutation({
        mutationFn: async (data: RegisterRequest) => {
            const response = await api.post<ApiResponse<AuthResponse>>(
                API_ROUTES.REGISTER,
                data
            );
            return response.data;
        },
        onSuccess: async (response) => {
            const { accessToken, refreshToken } = response.data;

            // Fetch user info
            const userResponse = await api.get<ApiResponse<UserResponse>>(
                API_ROUTES.ME,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            const user = userResponse.data.data;

            setAuth(
                {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                },
                accessToken,
                refreshToken
            );

            setError(null);
            router.push('/events');
        },
        onError: (err: Error & { response?: { data?: { message?: string } } }) => {
            setError(err.response?.data?.message || 'Error al registrarse');
        },
    });

    const login = (data: LoginFormData) => {
        setError(null);
        loginMutation.mutate(data);
    };

    const registerUser = (data: RegisterFormData) => {
        setError(null);
        registerMutation.mutate({
            email: data.email,
            password: data.password,
            fullName: data.fullName,
        });
    };

    const logout = () => {
        storeLogout();
        router.push('/login');
    };

    return {
        login,
        registerUser,
        logout,
        isLoading: loginMutation.isPending || registerMutation.isPending,
        error,
    };
}
