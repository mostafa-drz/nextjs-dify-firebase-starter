import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome</h1>
          <p className="text-slate-600 mt-2">
            Sign in to access your AI-powered applications
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}