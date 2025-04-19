import { Head, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
//WebLayout
import WebLayout from '@/layouts/web-layout';
import Header from '@/components/header';

export default function UserProfile({ auth }: any) {
    const { data, setData, patch, processing, errors } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        bio: auth.user.bio || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <WebLayout title="User Profile" >
            {/* Heading */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 px-8 mt-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wide bg-gradient-to-r from-ai-cyan to-ai-coral text-transparent bg-clip-text">
                    User Profile
                </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Avatar Section */}
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-md shadow-md p-6 flex flex-col items-center text-center">
                    <div className="absolute inset-0">
                        <PlaceholderPattern className="size-full stroke-white/10 dark:stroke-neutral-100/10" />
                    </div>
                    <div className="relative z-10">
                        <img
                            src={`https://ui-avatars.com/api/?name=${auth.user.name}&background=40c0df&color=ffffff&size=128&rounded=true`}
                            alt="Avatar"
                            className="mx-auto mb-4 h-24 w-24 rounded-full border-2 border-white/10 object-cover shadow"
                        />
                        <h2 className="text-xl font-semibold text-white">{auth.user.name}</h2>
                        <p className="text-muted-foreground text-sm">{auth.user.email}</p>
                    </div>
                </div>

                {/* Profile Form */}
                <form
                    onSubmit={submit}
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-md shadow-md p-6 md:col-span-2 z-10"
                >
                    <div className="absolute inset-0">
                        <PlaceholderPattern className="size-full stroke-white/10 dark:stroke-neutral-100/10" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                      
                        <Button type="submit" disabled={processing} className="w-full">
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </WebLayout>

    );
}
