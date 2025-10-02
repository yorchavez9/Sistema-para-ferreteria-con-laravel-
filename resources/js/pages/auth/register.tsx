import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, User, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface RegisterProps {
    isFirstUser?: boolean;
}

export default function Register({ isFirstUser = false }: RegisterProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    return (
        <AuthLayout
            title={isFirstUser ? "Configuración Inicial" : "Crear Cuenta"}
            description={
                isFirstUser
                    ? "Crea el primer usuario administrador del sistema"
                    : "Ingresa tus datos para crear una nueva cuenta"
            }
        >
            <Head title={isFirstUser ? "Configuración Inicial" : "Registrarse"} />

            {isFirstUser && (
                <div className="mb-6 flex items-start gap-3 rounded-lg bg-blue-50 border border-blue-200 p-4 dark:bg-blue-900/20 dark:border-blue-800">
                    <div className="flex-shrink-0 mt-0.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                            <AlertCircle className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-blue-900 dark:text-blue-100">Bienvenido al sistema</p>
                        <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                            No hay usuarios registrados. Crea el primer usuario administrador
                            para comenzar a usar el sistema.
                        </p>
                    </div>
                </div>
            )}

            <Form
                {...RegisteredUserController.store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nombre Completo
                                </Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="Ej: Juan Pérez"
                                        className="h-11 pl-10 pr-4 text-sm"
                                    />
                                </div>
                                <InputError message={errors.name} />
                            </div>

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
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="correo@ejemplo.com"
                                        className="h-11 pl-10 pr-4 text-sm"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Contraseña
                                </Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Mínimo 8 caracteres"
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

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Confirmar Contraseña
                                </Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        id="password_confirmation"
                                        type={showPasswordConfirmation ? "text" : "password"}
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Repite tu contraseña"
                                        className="h-11 pl-10 pr-11 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        tabIndex={-1}
                                    >
                                        {showPasswordConfirmation ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password_confirmation} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Button
                                type="submit"
                                className="w-full h-11 text-sm font-medium"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                        <span>Creando cuenta...</span>
                                    </div>
                                ) : (
                                    <span>{isFirstUser ? "Crear Usuario Administrador" : "Crear Cuenta"}</span>
                                )}
                            </Button>

                            {!isFirstUser && (
                                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                                    ¿Ya tienes una cuenta?{' '}
                                    <TextLink
                                        href={login()}
                                        tabIndex={6}
                                        className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                    >
                                        Inicia sesión
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
