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
        slug: string;
        description: string;
        provider_type: string;
        api_base_url: string;
        is_active: boolean;
        max_prompt_length: number;
        max_output_tokens: number;
        supports_system_prompt: boolean;
        supports_temperature: boolean;
        supports_top_p: boolean;
        supports_streaming: boolean;
        supports_frequency_penalty: boolean;
        supports_presence_penalty: boolean;
        variable_pattern: string;
        default_temperature: number;
        default_max_tokens: number;
        status: string;
        models?: Array<{
            id: number;
            model_name: string;
            max_input_tokens: number;
            max_output_tokens: number;
            cost_per_1k_input: string;
            cost_per_1k_output: string;
            is_default: boolean;
            is_active: boolean;
        }>;
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
    {
        title: 'Edit',
        href: '#',
    },
];

export default function EditPlatform({ platform }: EditPlatformProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: platform.name || '',
        slug: platform.slug || '',
        description: platform.description || '',
        provider_type: platform.provider_type || 'openai',
        api_base_url: platform.api_base_url || '',
        is_active: !!platform.is_active,
        max_prompt_length: platform.max_prompt_length || 8000,
        max_output_tokens: platform.max_output_tokens || 4000,
        supports_system_prompt: !!platform.supports_system_prompt,
        supports_temperature: !!platform.supports_temperature,
        supports_top_p: !!platform.supports_top_p,
        supports_streaming: !!platform.supports_streaming,
        supports_frequency_penalty: !!platform.supports_frequency_penalty,
        supports_presence_penalty: !!platform.supports_presence_penalty,
        variable_pattern: platform.variable_pattern || '/\\[(.*?)\\]/',
        default_temperature: platform.default_temperature || 1.0,
        default_max_tokens: platform.default_max_tokens || 1000,
        status: platform.status || '1',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/platforms/${platform.id}`);
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${platform.name}`} />
            <div className="flex items-center justify-between mb-4 px-4 pt-4">
                <h1 className="text-lg font-semibold text-foreground">Edit Platform: {platform.name}</h1>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 px-4 pb-8">
                {/* Platform Form */}
                <div className="xl:col-span-2">
                    <form onSubmit={submit} className="bg-card border rounded-lg p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h2 className="text-md font-medium border-b pb-2">Basic Information</h2>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">Platform Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                    />
                                    <InputError message={errors.slug} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="provider_type">Provider Type</Label>
                                    <select
                                        id="provider_type"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={data.provider_type}
                                        onChange={(e) => setData('provider_type', e.target.value)}
                                    >
                                        <option value="openai">OpenAI</option>
                                        <option value="anthropic">Anthropic</option>
                                        <option value="google">Google</option>
                                    </select>
                                    <InputError message={errors.provider_type} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="api_base_url">API Base URL</Label>
                                    <Input
                                        id="api_base_url"
                                        value={data.api_base_url}
                                        onChange={(e) => setData('api_base_url', e.target.value)}
                                    />
                                    <InputError message={errors.api_base_url} />
                                </div>
                            </div>

                            {/* AI Configuration */}
                            <div className="space-y-4">
                                <h2 className="text-md font-medium border-b pb-2">Default AI Config</h2>

                                <div className="grid gap-2">
                                    <Label htmlFor="variable_pattern">Variable Pattern (Regex)</Label>
                                    <Input
                                        id="variable_pattern"
                                        value={data.variable_pattern}
                                        onChange={(e) => setData('variable_pattern', e.target.value)}
                                    />
                                    <InputError message={errors.variable_pattern} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="default_temperature">Default Temp</Label>
                                        <Input
                                            id="default_temperature"
                                            type="number"
                                            step="0.1"
                                            value={data.default_temperature}
                                            onChange={(e) => setData('default_temperature', parseFloat(e.target.value))}
                                        />
                                        <InputError message={errors.default_temperature} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="default_max_tokens">Default Max Tokens</Label>
                                        <Input
                                            id="default_max_tokens"
                                            type="number"
                                            value={data.default_max_tokens}
                                            onChange={(e) => setData('default_max_tokens', parseInt(e.target.value))}
                                        />
                                        <InputError message={errors.default_max_tokens} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="max_prompt_length">Max Prompt Length</Label>
                                        <Input
                                            id="max_prompt_length"
                                            type="number"
                                            value={data.max_prompt_length}
                                            onChange={(e) => setData('max_prompt_length', parseInt(e.target.value))}
                                        />
                                        <InputError message={errors.max_prompt_length} />
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
                            </div>
                        </div>

                        {/* Feature Flags */}
                        <div className="space-y-4">
                            <h2 className="text-md font-medium border-b pb-2">Feature Flags</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { id: 'supports_system_prompt', label: 'System Prompt' },
                                    { id: 'supports_temperature', label: 'Temperature' },
                                    { id: 'supports_top_p', label: 'Top P' },
                                    { id: 'supports_streaming', label: 'Streaming' },
                                    { id: 'supports_frequency_penalty', label: 'Freq Penalty' },
                                    { id: 'supports_presence_penalty', label: 'Pres Penalty' },
                                    { id: 'is_active', label: 'Enable Platform' },
                                ].map((flag) => (
                                    <div key={flag.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={flag.id}
                                            checked={data[flag.id as keyof typeof data] as boolean}
                                            onChange={(e) => setData(flag.id as any, e.target.checked)}
                                            className="rounded border-gray-300 text-foreground focus:ring-foreground"
                                        />
                                        <Label htmlFor={flag.id} className="cursor-pointer text-sm">{flag.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            <InputError message={errors.description} />
                        </div>

                        {/* Status */}
                        <div className="grid gap-2">
                            <Label>Overall Status</Label>
                            <div className="flex items-center space-x-4">
                                {[
                                    { value: '1', label: 'Active' },
                                    { value: '0', label: 'Pending' },
                                    { value: '2', label: 'Inactive' },
                                ].map((s) => (
                                    <label key={s.value} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            value={s.value}
                                            checked={data.status === s.value}
                                            onChange={() => setData('status', s.value)}
                                            className="form-radio text-foreground"
                                        />
                                        <span className="text-sm">{s.label}</span>
                                    </label>
                                ))}
                            </div>
                            <InputError message={errors.status} />
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                            <Button type="submit" disabled={processing}>Update Platform</Button>
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
                </div>

                {/* Models Section */}
                <div className="space-y-6">
                    <div className="bg-card border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-md font-medium">Platform Models</h2>
                            <Button size="sm" onClick={() => router.visit(`/admin/platforms/${platform.id}/models/create`)}>
                                Add Model
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {platform.models && platform.models.length > 0 ? (
                                platform.models.map((model) => (
                                    <div key={model.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">{model.model_name}</span>
                                                {model.is_default && (
                                                    <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Default</span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                In: ${model.cost_per_1k_input} | Out: ${model.cost_per_1k_output}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.visit(`/admin/platforms/${platform.id}/models/${model.id}/edit`)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-md">
                                    No models added yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

