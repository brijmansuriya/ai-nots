import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
// import AppLayout from '@/layouts/app-layout';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { AdminDataTable } from '@/components/admin-data-table';
import { columns } from "@/pages/admin/categories/columns";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Categories',
        href: '/admin/categories',
    },
];


export default function Dashboard() {

    const { categories } = usePage().props as any

    // const handlePagination = (url: string) => {
    //     router.visit(url)
    // }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <div className="flex items-center justify-between mb-4 px-4 pt-4">
                <h1 className="text-2xl font-bold">Categories</h1>
                <Button
                    onClick={() => router.visit(route('admin.categories.create'))}
                >
                    <Plus className="w-4 h-4" /> {/* Plus icon */}
                    <span>Create Category</span>
                </Button>
            </div>
            <AdminDataTable
                columns={columns}
                data={categories}
                filterColumn="name"
                filterPlaceholder="Filter categories..."
                onPageChange={(url) => url && router.visit(url)}
            />
        </AdminLayout>
    );
}
