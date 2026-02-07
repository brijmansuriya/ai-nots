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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black p-4 transition-colors">
      <Head title="Email verification" />

      <div className="w-full max-w-md bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-xl p-8 space-y-6 transition-colors text-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-300 bg-clip-text text-transparent">
            Verify email
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Please verify your email address by clicking the link we just emailed to you.
          </p>
        </div>

        {status === 'verification-link-sent' && (
          <div className="text-center text-sm font-medium text-green-500">
            A new verification link has been sent to the email address you provided during registration.
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <Button
            type="submit"
            disabled={processing}
            className="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-700"
          >
            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
            Resend verification email
          </Button>

          <TextLink
            href={route('logout')}
            method="post"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white block"
          >
            Log out
          </TextLink>
        </form>
      </div>
    </div>
  );
}
