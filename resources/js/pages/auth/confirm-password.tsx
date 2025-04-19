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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ai-cyan/20 via-black to-ai-coral/20 px-4 py-12">
      <Head title="Confirm password" />

      <div className="w-full max-w-md bg-black/20 backdrop-blur-lg rounded-3xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-ai-cyan to-ai-coral text-transparent bg-clip-text">
            Confirm your password
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            This is a secure area of the application. Please confirm your password before continuing.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              autoFocus
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              disabled={processing}
            />
            <InputError message={errors.password} />
          </div>

          <Button className="w-full" disabled={processing}>
            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
            Confirm password
          </Button>
        </form>
      </div>
    </div>
  );
}
