import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPassword({ status }: { status?: string }) {
  const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
    email: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('password.email'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ai-cyan/20 via-black to-ai-coral/20 px-4 py-12">
      <Head title="Forgot password" />

      <div className="w-full max-w-md bg-black/20 backdrop-blur-lg rounded-3xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-ai-cyan to-ai-coral text-transparent bg-clip-text">
            Forgot password
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your email to receive a password reset link
          </p>
        </div>

        {status && (
          <div className="text-green-600 text-sm font-medium text-center bg-green-600/10 px-3 py-2 rounded-xl">
            {status}
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="email@example.com"
              autoComplete="off"
              autoFocus
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              disabled={processing}
            />
            <InputError message={errors.email} />
          </div>

          <Button className="w-full" disabled={processing}>
            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
            Email password reset link
          </Button>
        </form>

        <div className="text-muted-foreground text-center text-sm">
          Or, return to <TextLink href={route('login')}>log in</TextLink>
        </div>
      </div>
    </div>
  );
}
