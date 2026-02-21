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
        slug: '',
        description: '',
        provider_type: 'openai',
        api_base_url: '',
        is_active: true,
        max_prompt_length: 8000,
        max_output_tokens: 4000,
        supports_system_prompt: true,
        supports_temperature: true,
        supports_top_p: true,
        supports_streaming: true,
        supports_frequency_penalty: true,
        supports_presence_penalty: true,
        variable_pattern: '/\\[(.*?)\\]/',
        default_temperature: 1.0,
        default_max_tokens: 1000,
        status: '1',
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

            <form onSubmit={submit} className="px-4 py-4 space-y-6 max-w-4xl">
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
                                placeholder="e.g. ChatGPT, Claude"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                placeholder="e.g. chatgpt, claude"
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
                                placeholder="https://api.openai.com/v1"
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
                                placeholder="/\[(.*?)\]/"
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
                                <Label htmlFor={flag.id} className="cursor-pointer">{flag.label}</Label>
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
                        placeholder="Platform description..."
                    />
                    <InputError message={errors.description} />
                </div>

                {/* Status (Legacy Support) */}
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
                                <span>{s.label}</span>
                            </label>
                        ))}
                    </div>
                    <InputError message={errors.status} />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-2 pt-4">
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

