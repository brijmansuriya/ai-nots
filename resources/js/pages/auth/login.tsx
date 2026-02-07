import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { FcGoogle } from 'react-icons/fc'; // Import Google icon

import InputError from '@/components/input-error';
import { PasswordInput } from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};

interface LoginProps {
  status?: string;
  canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
  const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
    email: '',
    password: '',
    remember: false,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('login'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black p-4 transition-colors">
      <Head title="Log in" />

      <div className="w-full max-w-md bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-xl p-8 space-y-6 transition-colors">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-300 bg-clip-text text-transparent">
            Log in to your account
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Enter your email and password below
          </p>
        </div>

        {status && (
          <div className="text-center text-sm font-medium text-green-500">
            {status}
          </div>
        )}

        <form className="space-y-5" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email address</Label>
            <Input
              id="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              placeholder="email@example.com"
              className="border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-gray-900 dark:focus:ring-white"
            />
            <InputError message={errors.email} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
              {canResetPassword && (
                <TextLink href={route('password.request')} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Forgot password?
                </TextLink>
              )}
            </div>
            <PasswordInput
              id="password"
              required
              autoComplete="current-password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              placeholder="••••••••"
              className="border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-gray-900 dark:focus:ring-white"
            />
            <InputError message={errors.password} />
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="remember"
              name="remember"
              checked={data.remember}
              onClick={() => setData('remember', !data.remember)}
              className="border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-white"
            />
            <Label htmlFor="remember" className="text-gray-700 dark:text-gray-300">Remember me</Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 text-white dark:text-gray-900 hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-gray-300"
            disabled={processing}
          >
            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
            Log in
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Or log in with:
        </div>

        <Button
          type="button"
          className="w-full flex items-center justify-center bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-700"
          onClick={() => window.location.href = route('auth.google.redirect')}
        >
          <FcGoogle className="mr-2 h-5 w-5" /> Log in with Google
        </Button>

        <div className="text-gray-600 dark:text-gray-400 text-center text-sm">
          Don't have an account?{' '}
          <TextLink href={route('register')} className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300">
            Sign up
          </TextLink>
        </div>
      </div>
    </div>
  );
}
