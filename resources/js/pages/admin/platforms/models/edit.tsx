import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

interface EditModelProps {
    platform: {
        id: number;
        name: string;
    };
    model: {
        id: number;
        model_name: string;
        max_input_tokens: number;
        max_output_tokens: number;
        cost_per_1k_input: number;
        cost_per_1k_output: number;
        is_default: boolean;
        is_active: boolean;
    };
}

export default function EditModel({ platform, model }: EditModelProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Platforms', href: '/admin/platforms' },
        { title: platform.name, href: `/admin/platforms/${platform.id}/edit` },
        { title: 'Edit Model', href: '#' },
    ];

    const { data, setData, put, delete: destroy, processing, errors } = useForm({
        model_name: model.model_name || '',
        max_input_tokens: model.max_input_tokens || 128000,
        max_output_tokens: model.max_output_tokens || 4096,
        cost_per_1k_input: parseFloat(model.cost_per_1k_input as any) || 0,
        cost_per_1k_output: parseFloat(model.cost_per_1k_output as any) || 0,
        is_default: !!model.is_default,
        is_active: !!model.is_active,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/platforms/${platform.id}/models/${model.id}`);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this model?')) {
            destroy(`/admin/platforms/${platform.id}/models/${model.id}`);
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Model ${model.model_name}`} />
            <div className="flex items-center justify-between mb-4 px-4 pt-4">
                <h1 className="text-lg font-semibold text-foreground">Edit Model: {model.model_name}</h1>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={processing}>
                    Delete Model
                </Button>
            </div>

            <form onSubmit={submit} className="px-4 py-4 space-y-6 max-w-2xl bg-card border rounded-lg m-4">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="model_name">Model Name</Label>
                        <Input
                            id="model_name"
                            value={data.model_name}
                            onChange={(e) => setData('model_name', e.target.value)}
                        />
                        <InputError message={errors.model_name} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="max_input_tokens">Max Input Tokens</Label>
                            <Input
                                id="max_input_tokens"
                                type="number"
                                value={data.max_input_tokens}
                                onChange={(e) => setData('max_input_tokens', parseInt(e.target.value))}
                            />
                            <InputError message={errors.max_input_tokens} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="max_output_tokens">Max Output Tokens</Label>
                            <Input
                                id="max_output_tokens"
                                type="number"
                                value={data.max_output_tokens}
                                onChange={(e) => setData('max_output_tokens', parseInt(e.target.value))}
                            />
                            <InputError message={errors.max_output_tokens} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="cost_per_1k_input">Cost per 1k Input ($)</Label>
                            <Input
                                id="cost_per_1k_input"
                                type="number"
                                step="0.00001"
                                value={data.cost_per_1k_input}
                                onChange={(e) => setData('cost_per_1k_input', parseFloat(e.target.value))}
                            />
                            <InputError message={errors.cost_per_1k_input} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cost_per_1k_output">Cost per 1k Output ($)</Label>
                            <Input
                                id="cost_per_1k_output"
                                type="number"
                                step="0.00001"
                                value={data.cost_per_1k_output}
                                onChange={(e) => setData('cost_per_1k_output', parseFloat(e.target.value))}
                            />
                            <InputError message={errors.cost_per_1k_output} />
                        </div>
                    </div>

                    <div className="flex items-center space-x-6 pt-2">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="is_default"
                                checked={data.is_default}
                                onChange={(e) => setData('is_default', e.target.checked)}
                                className="rounded border-gray-300 text-foreground focus:ring-foreground"
                            />
                            <Label htmlFor="is_default" className="cursor-pointer">Default Model</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="rounded border-gray-300 text-foreground focus:ring-foreground"
                            />
                            <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                    <Button type="submit" disabled={processing}>Update Model</Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.visit(`/admin/platforms/${platform.id}/edit`)}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
