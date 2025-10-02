import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister?: boolean;
}

export default function Login({ status, canResetPassword, canRegister = false }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <AuthLayout
            title="Iniciar Sesión"
            description="Ingresa tus credenciales para acceder al sistema"
        >
            <Head title="Iniciar Sesión" />

            {status && (
                <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-3 text-center text-sm text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                    {status}
                </div>
            )}

            <Form
                {...AuthenticatedSessionController.store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Correo Electrónico
                                </Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="correo@ejemplo.com"
                                        className="h-11 pl-10 pr-4 text-sm"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Contraseña
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                            tabIndex={5}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="h-11 pl-10 pr-11 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                                >
                                    Recordarme
                                </Label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Button
                                type="submit"
                                className="w-full h-11 text-sm font-medium"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                        <span>Iniciando sesión...</span>
                                    </div>
                                ) : (
                                    <span>Iniciar Sesión</span>
                                )}
                            </Button>

                            {canRegister && (
                                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                                    ¿No tienes una cuenta?{' '}
                                    <TextLink
                                        href={register()}
                                        tabIndex={6}
                                        className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                    >
                                        Regístrate aquí
                                    </TextLink>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
