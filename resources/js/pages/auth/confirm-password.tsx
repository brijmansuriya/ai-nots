import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ConfirmPassword() {
  const { data, setData, post, processing, errors, reset } = useForm<Required<{ password: string }>>({
    password: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('password.confirm'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black p-4 transition-colors">
      <Head title="Confirm password" />

      <div className="w-full max-w-md bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-xl p-8 space-y-6 transition-colors">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-300 bg-clip-text text-transparent">
            Confirm your password
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            This is a secure area of the application. Please confirm your password before continuing.
          </p>
        </div>

        <form className="space-y-5" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              placeholder="••••••••"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              disabled={processing}
              className="border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-gray-900 dark:focus:ring-white"
            />
            <InputError message={errors.password} />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 text-white dark:text-gray-900 hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-gray-300"
            disabled={processing}
          >
            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
            Confirm password
          </Button>
        </form>
      </div>
    </div>
  );
}
