import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { AdminDataTable } from '@/components/admin-data-table';
import { columns } from "@/pages/admin/platforms/columns";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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


export default function PlatformsIndex() {

    const { platforms } = usePage().props as any

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Platforms" />
            <div className="flex items-center justify-between mb-4 px-4 pt-4">
                <h1 className="text-2xl font-bold">Platforms</h1>
                <Button
                    onClick={() => router.visit(route('admin.platforms.create'))}
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Platform</span>
                </Button>
            </div>
            <AdminDataTable
                columns={columns}
                data={platforms}
                filterColumn="name"
                filterPlaceholder="Filter platforms..."
                onPageChange={(url) => url && router.visit(url)}
            />
        </AdminLayout>
    );
}

