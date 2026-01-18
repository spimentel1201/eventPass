'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { registerSchema, type RegisterFormData } from '@/schemas/authSchema';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { registerUser, isLoading, error } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = (data: RegisterFormData) => {
        registerUser(data);
    };

    return (
        <>
            <h2 className="card-title text-2xl justify-center mb-6">
                Crear Cuenta
            </h2>

            {error && (
                <div className="alert alert-error mb-4">
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Nombre completo</span>
                    </label>
                    <label className="input input-bordered flex items-center gap-2">
                        <User className="w-4 h-4 opacity-70" />
                        <input
                            type="text"
                            placeholder="Juan Pérez"
                            className="grow"
                            {...register('fullName')}
                        />
                    </label>
                    {errors.fullName && (
                        <label className="label">
                            <span className="label-text-alt text-error">{errors.fullName.message}</span>
                        </label>
                    )}
                </div>

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

                {/* Confirm Password */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Confirmar contraseña</span>
                    </label>
                    <label className="input input-bordered flex items-center gap-2">
                        <Lock className="w-4 h-4 opacity-70" />
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="grow"
                            {...register('confirmPassword')}
                        />
                        <button
                            type="button"
                            className="btn btn-ghost btn-xs btn-circle"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </label>
                    {errors.confirmPassword && (
                        <label className="label">
                            <span className="label-text-alt text-error">{errors.confirmPassword.message}</span>
                        </label>
                    )}
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
                            Registrando...
                        </>
                    ) : (
                        'Crear cuenta'
                    )}
                </button>
            </form>

            {/* Login link */}
            <div className="divider">O</div>

            <p className="text-center text-base-content/70">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="link link-primary font-semibold">
                    Inicia sesión
                </Link>
            </p>
        </>
    );
}
