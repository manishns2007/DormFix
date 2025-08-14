import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">DormFix</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to access the maintenance dashboard
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
