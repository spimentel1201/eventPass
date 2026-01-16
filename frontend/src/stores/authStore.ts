import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;

    // Actions
    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            setAuth: (user, accessToken, refreshToken) => {
                // Store tokens in localStorage for API interceptor
                if (typeof window !== 'undefined') {
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);
                }
                set({ user, accessToken, refreshToken, isAuthenticated: true });
            },

            logout: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
                set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
            },

            updateUser: (userData) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null,
                })),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
