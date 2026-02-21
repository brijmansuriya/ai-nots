import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { router } from '@inertiajs/react';

interface EditPlatformProps {
    platform: {
        id: number;
        name: string;
        status: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Platforms',
        href: '/admin/platforms',
    },
];

export default function EditPlatform({ platform }: EditPlatformProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: platform.name || '',
        status: platform.status || '1',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/platforms/${platform.id}`);
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Platform" />
            <div className="flex items-center justify-between mb-4 px-4 pt-4">
                <h1 className="text-lg font-semibold text-foreground">Edit Platform</h1>
            </div>

            <form onSubmit={submit} className="px-4 py-4 space-y-4">
                {/* Name */}
                <div className="grid gap-2">
                    <Label htmlFor="name" className="text-foreground">Platform Name</Label>
                    <Input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        disabled={processing}
                        placeholder="Enter platform name"
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                {/* Status */}
                <div className="grid gap-2">
                    <Label htmlFor="status" className="text-foreground">Status</Label>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="status"
                                value="1"
                                checked={data.status === '1'}
                                onChange={() => setData('status', '1')}
                                disabled={processing}
                                className="form-radio text-foreground"
                            />
                            <span className="text-foreground">Active</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="status"
                                value="0"
                                checked={data.status === '0'}
                                onChange={() => setData('status', '0')}
                                disabled={processing}
                                className="form-radio text-foreground"
                            />
                            <span className="text-foreground">Pending</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="status"
                                value="2"
                                checked={data.status === '2'}
                                onChange={() => setData('status', '2')}
                                disabled={processing}
                                className="form-radio text-foreground"
                            />
                            <span className="text-foreground">Inactive</span>
                        </label>
                    </div>
                    <InputError message={errors.status} className="mt-2" />
                </div>

                {/* Submit */}
                <div className="flex gap-2">
                    <Button type="submit" disabled={processing}>
                        Update Platform
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.visit('/admin/platforms')}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}

