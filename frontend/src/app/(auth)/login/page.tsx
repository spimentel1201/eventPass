'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { loginSchema, type LoginFormData } from '@/schemas/authSchema';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading, error } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: LoginFormData) => {
        login(data);
    };

    return (
        <>
            <h2 className="card-title text-2xl justify-center mb-6">
                Iniciar Sesión
            </h2>

            {error && (
                <div className="alert alert-error mb-4">
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Email</span>
                    </label>
                    <label className="input input-bordered flex items-center gap-2">
                        <Mail className="w-4 h-4 opacity-70" />
                        <input
                            type="email"
                            placeholder="tu@email.com"
                            className="grow"
                            {...register('email')}
                        />
                    </label>
                    {errors.email && (
                        <label className="label">
                            <span className="label-text-alt text-error">{errors.email.message}</span>
                        </label>
                    )}
                </div>

                {/* Password */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Contraseña</span>
                    </label>
                    <label className="input input-bordered flex items-center gap-2">
                        <Lock className="w-4 h-4 opacity-70" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="grow"
                            {...register('password')}
                        />
                        <button
                            type="button"
                            className="btn btn-ghost btn-xs btn-circle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </label>
                    {errors.password && (
                        <label className="label">
                            <span className="label-text-alt text-error">{errors.password.message}</span>
                        </label>
                    )}
                </div>

                {/* Forgot password */}
                <div className="text-right">
                    <Link href="/forgot-password" className="link link-primary text-sm">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Ingresando...
                        </>
                    ) : (
                        'Ingresar'
                    )}
                </button>
            </form>

            {/* Register link */}
            <div className="divider">O</div>

            <p className="text-center text-base-content/70">
                ¿No tienes cuenta?{' '}
                <Link href="/register" className="link link-primary font-semibold">
                    Regístrate
                </Link>
            </p>
        </>
    );
}
