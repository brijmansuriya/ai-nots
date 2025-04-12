import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { useForm } from '@inertiajs/react';
import { Textarea } from "@/components/ui/textarea"


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Tags',
        href: '/admin/tags',
    },
];

export default function CreateTag() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        status: 'active',  // Assuming `status` is an integer (active = 1, inactive = 0)
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/tags');
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Tag" />
            <div className="flex items-center justify-between mb-4 px-4 pt-4">
                <h1 className="text-lg font-semibold">Create New Tag</h1>
            </div>

            <form onSubmit={submit} className="px-4 py-4 space-y-4">
                {/* Tag Name */}
                <div className="grid gap-2">
                    <Label htmlFor="name">Tag Name</Label>
                    <Input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => {
                            setData('name', e.target.value);
                            setData('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'));
                        }}
                        disabled={processing}
                        placeholder="Enter tag name"
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                {/* Slug */}
                <div className="grid gap-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                        id="slug"
                        type="text"
                        value={data.slug}
                        onChange={(e) => setData('slug', e.target.value)}
                        disabled={processing}
                        placeholder="Enter slug (e.g. example-tag)"
                    />
                    <InputError message={errors.slug} className="mt-2" />
                </div>

                {/* Description */}
                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                   

                    <Textarea placeholder="Type your message here." 
                        id="description"
                        
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        disabled={processing}
                    />
                    <InputError message={errors.description} className="mt-2 text-red-600" />
                </div>

                {/* Status */}
                <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="status"
                                value="active"
                                checked={data.status === 'active'}
                                onChange={() => setData('status', 'active')}
                                disabled={processing}
                                className="form-radio"
                            />
                            <span>Active</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="status"
                                value="deactive"
                                checked={data.status == 'deactive'}
                                onChange={() => setData('status', 'deactive')}
                                disabled={processing}
                                className="form-radio"
                            />
                            <span>Inactive</span>
                        </label>
                    </div>
                    <InputError message={errors.status} className="mt-2" />
                </div>

                {/* Submit Button */}
                <Button type="submit" disabled={processing}>Create Tag</Button>
            </form>
        </AdminLayout>
    );
}
