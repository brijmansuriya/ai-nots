import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { AdminDataTable } from '@/components/admin-data-table';
import { columns } from "@/pages/admin/prompts/columns";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Templates',
        href: '/admin/prompts',
    },
];


export default function PromptsIndex() {

    const { prompts } = usePage().props as any

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Templates" />
            <div className="flex items-center justify-between mb-4 px-4 pt-4">
                <h1 className="text-2xl font-bold">Templates</h1>
                <Button
                    onClick={() => router.visit(route('admin.prompts.create'))}
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Template</span>
                </Button>
            </div>
            <AdminDataTable
                columns={columns}
                data={prompts}
                filterColumn="title"
                filterPlaceholder="Filter templates..."
                onPageChange={(url: string | null) => url && router.visit(url)}
            />
        </AdminLayout>
    );
}

