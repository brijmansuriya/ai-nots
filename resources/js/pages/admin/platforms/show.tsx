import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ShowPlatformProps {
    platform: {
        id: number;
        name: string;
        status: string;
        created_at: string;
        updated_at: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Platforms',
        href: '/admin/platforms',
    },
];

export default function ShowPlatform({ platform }: ShowPlatformProps) {
    const statusColors: Record<string, string> = {
        active: "bg-green-100 text-green-800",
        pending: "bg-yellow-100 text-yellow-800",
        deactive: "bg-red-100 text-red-800",
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Platform: ${platform.name}`} />
            <div className="flex items-center justify-between mb-4 px-4 pt-4">
                <h1 className="text-2xl font-bold">Platform Details</h1>
                <Button
                    variant="outline"
                    onClick={() => router.visit(route('admin.platforms.index'))}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Platforms
                </Button>
            </div>

            <div className="px-4 py-4 space-y-4">
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-500">ID</label>
                        <p className="mt-1 text-lg">{platform.id}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="mt-1 text-lg">{platform.name}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <p className="mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[platform.status] || "bg-gray-100 text-gray-800"}`}>
                                {platform.status}
                            </span>
                        </p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">Created At</label>
                        <p className="mt-1 text-lg">
                            {new Date(platform.created_at).toLocaleString()}
                        </p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">Updated At</label>
                        <p className="mt-1 text-lg">
                            {new Date(platform.updated_at).toLocaleString()}
                        </p>
                    </div>

                    <div className="pt-4 flex gap-2">
                        <Button
                            onClick={() => router.visit(route('admin.platforms.edit', platform.id))}
                        >
                            Edit Platform
                        </Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

