'use client';

import { LoginForm } from '@/components/login-form';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const { login, register, loading } = useAuth();

  const handleLogin = async ({ email, password }) => {
    await login(email, password);
  };

  const handleRegister = async (email, username, password) => {
    await register(email, username, password);
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm onLoginSubmit={handleLogin} onRegisterSubmit={handleRegister} loading={loading} />
      </div>
    </div>
  );
}
