import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';

export default function VerifyEmail({ status }: { status?: string }) {
  const { post, processing } = useForm({});

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('verification.send'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ai-cyan/20 via-black to-ai-coral/20 px-4 py-12">
      <Head title="Email verification" />

      <div className="w-full max-w-md bg-black/20 backdrop-blur-lg rounded-3xl shadow-xl p-8 space-y-6 text-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-ai-cyan to-ai-coral text-transparent bg-clip-text">
            Verify email
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Please verify your email address by clicking the link we just emailed to you.
          </p>
        </div>

        {status === 'verification-link-sent' && (
          <div className="text-sm font-medium text-green-600">
            A new verification link has been sent to the email address you provided during registration.
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <Button disabled={processing} variant="secondary" className="w-full">
            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
            Resend verification email
          </Button>

          <TextLink
            href={route('logout')}
            method="post"
            className="text-sm text-muted-foreground hover:underline block"
          >
            Log out
          </TextLink>
        </form>
      </div>
    </div>
  );
}
