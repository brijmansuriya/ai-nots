import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, LayoutGrid } from 'lucide-react';
import { FormEventHandler } from 'react';
import { FcGoogle } from 'react-icons/fc'; // Import Google icon

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('register'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black p-4 transition-colors">
      <Head title="Register" />

      <div className="w-full max-w-md bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-xl p-8 space-y-6 transition-colors">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-300 bg-clip-text text-transparent">
            Create an account
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Enter your details below to create your account
          </p>
        </div>

        <form className="space-y-5" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Name</Label>
            <Input
              id="name"
              type="text"
              required
              autoFocus
              autoComplete="name"
              placeholder="Full name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              disabled={processing}
              className="border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-gray-900 dark:focus:ring-white"
            />
            <InputError message={errors.name} className="mt-2" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email address</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="email@example.com"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              disabled={processing}
              className="border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-gray-900 dark:focus:ring-white"
            />
            <InputError message={errors.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              disabled={processing}
              className="border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-gray-900 dark:focus:ring-white"
            />
            <InputError message={errors.password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password_confirmation" className="text-gray-700 dark:text-gray-300">Confirm password</Label>
            <Input
              id="password_confirmation"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Confirm password"
              value={data.password_confirmation}
              onChange={(e) => setData('password_confirmation', e.target.value)}
              disabled={processing}
              className="border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-gray-900 dark:focus:ring-white"
            />
            <InputError message={errors.password_confirmation} />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 text-white dark:text-gray-900 hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-gray-300"
            disabled={processing}
          >
            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
            Create account
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Or sign up with:
        </div>

        <Button
          type="button"
          className="w-full flex items-center justify-center bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-700"
          onClick={() => window.location.href = route('auth.google.redirect')}
        >
          <FcGoogle className="mr-2 h-5 w-5" /> Sign up with Google
        </Button>

        <div className="text-gray-600 dark:text-gray-400 text-center text-sm">
          Already have an account?{' '}
          <TextLink href={route('login')} className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300">
            Log in
          </TextLink>
        </div>
      </div>
    </div>
  );
}
