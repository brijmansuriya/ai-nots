import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Platforms',
        href: '/admin/platforms',
    },
    {
        title: 'Create',
        href: '/admin/platforms/create',
    },
];

export default function CreatePlatform() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        status: 'active',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/platforms');
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Platform" />
            <div className="flex items-center justify-between mb-4 px-4 pt-4">
                <h1 className="text-lg font-semibold text-foreground">Create New Platform</h1>
            </div>

            <form onSubmit={submit} className="px-4 py-4 space-y-4">
                {/* Platform Name */}
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
                                value="active"
                                checked={data.status === 'active'}
                                onChange={() => setData('status', 'active')}
                                disabled={processing}
                                className="form-radio text-foreground"
                            />
                            <span className="text-foreground">Active</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="status"
                                value="pending"
                                checked={data.status === 'pending'}
                                onChange={() => setData('status', 'pending')}
                                disabled={processing}
                                className="form-radio text-foreground"
                            />
                            <span className="text-foreground">Pending</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="status"
                                value="deactive"
                                checked={data.status === 'deactive'}
                                onChange={() => setData('status', 'deactive')}
                                disabled={processing}
                                className="form-radio text-foreground"
                            />
                            <span className="text-foreground">Inactive</span>
                        </label>
                    </div>
                    <InputError message={errors.status} className="mt-2" />
                </div>

                {/* Submit Button */}
                <div className="flex gap-2">
                    <Button type="submit" disabled={processing}>Create Platform</Button>
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

