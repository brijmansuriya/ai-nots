import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Templates',
        href: '/admin/prompts',
    },
    {
        title: 'View',
        href: '#',
    },
];

export default function ShowPrompt() {
    const { prompt } = usePage().props as any;

    const statusMap: Record<string, { label: string; className: string }> = {
        '0': { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
        '1': { label: 'Active', className: 'bg-green-100 text-green-800' },
        '2': { label: 'Rejected', className: 'bg-red-100 text-red-800' },
    };

    const statusInfo = statusMap[prompt.status] || { label: prompt.status, className: 'bg-gray-100 text-gray-800' };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Template: ${prompt.title}`} />
            <div className="flex items-center justify-between mb-4 px-4 pt-4">
                <h1 className="text-2xl font-bold">{prompt.title}</h1>
                <div className="flex gap-2">
                    <Button
                        onClick={() => router.visit(route('admin.prompts.edit', prompt.id))}
                        variant="outline"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                    <Button
                        onClick={() => {
                            if (confirm('Are you sure you want to delete this template?')) {
                                router.delete(route('admin.prompts.destroy', prompt.id));
                            }
                        }}
                        variant="destructive"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="px-4 py-4 space-y-6">
                {prompt.image_url && (
                    <div>
                        <img
                            src={prompt.image_url}
                            alt={prompt.title}
                            className="w-full h-64 object-cover rounded-lg border border-gray-300 dark:border-gray-700"
                        />
                    </div>
                )}

                <div>
                    <h2 className="text-lg font-semibold mb-2">Description</h2>
                    <p className="text-gray-700 dark:text-gray-300">
                        {prompt.description || 'No description provided.'}
                    </p>
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-2">Prompt</h2>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 p-4">
                        <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white font-mono">
                            {prompt.prompt}
                        </pre>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Category</h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            {prompt.category?.name || 'N/A'}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">Status</h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.className}`}>
                            {statusInfo.label}
                        </span>
                    </div>
                </div>

                {prompt.tags && prompt.tags.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Tags</h2>
                        <div className="flex flex-wrap gap-2">
                            {prompt.tags.map((tag: any) => (
                                <span
                                    key={tag.id}
                                    className="px-3 py-1 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm"
                                >
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {prompt.platforms && prompt.platforms.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Platforms</h2>
                        <div className="flex flex-wrap gap-2">
                            {prompt.platforms.map((platform: any) => (
                                <span
                                    key={platform.id}
                                    className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                >
                                    {platform.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {prompt.variables && prompt.variables.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Dynamic Variables</h2>
                        <div className="flex flex-wrap gap-2">
                            {prompt.variables.map((variable: any, index: number) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 text-sm font-mono"
                                >
                                    [{variable.name}]
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Created At</h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            {new Date(prompt.created_at).toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Updated At</h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            {new Date(prompt.updated_at).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}


