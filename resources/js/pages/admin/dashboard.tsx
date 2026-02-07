import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FileText, Tag, FolderTree, Monitor, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

interface DashboardProps {
    statistics: {
        total_templates: number;
        active_templates: number;
        pending_templates: number;
        rejected_templates: number;
        total_tags: number;
        total_categories: number;
        total_platforms: number;
    };
    recent_templates: Array<{
        id: number;
        title: string;
        status: string;
        created_at: string;
    }>;
}

export default function Dashboard() {
    const { statistics, recent_templates } = usePage<DashboardProps>().props;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case '1':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-800 dark:text-green-300">
                        <CheckCircle className="h-3 w-3" />
                        Active
                    </span>
                );
            case '0':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-300">
                        <Clock className="h-3 w-3" />
                        Pending
                    </span>
                );
            case '2':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-1 text-xs font-medium text-red-800 dark:text-red-300">
                        <XCircle className="h-3 w-3" />
                        Rejected
                    </span>
                );
            default:
                return null;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Overview of your AI Notes admin panel
                        </p>
                    </div>
                    <Button onClick={() => router.visit(route('admin.prompts.create'))}>
                        <FileText className="mr-2 h-4 w-4" />
                        Create Template
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Templates */}
                    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Templates</p>
                                <p className="mt-2 text-3xl font-bold text-foreground">{statistics.total_templates}</p>
                            </div>
                            <div className="rounded-full bg-primary/10 p-3">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <div className="mt-4 flex gap-4 text-xs">
                            <div>
                                <span className="text-muted-foreground">Active:</span>
                                <span className="ml-1 font-medium text-foreground">{statistics.active_templates}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Pending:</span>
                                <span className="ml-1 font-medium text-foreground">{statistics.pending_templates}</span>
                            </div>
                        </div>
                    </div>

                    {/* Total Tags */}
                    <Link
                        href={route('admin.tags.index')}
                        className="rounded-lg border border-border bg-card p-6 shadow-sm transition-colors hover:bg-accent"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tags</p>
                                <p className="mt-2 text-3xl font-bold text-foreground">{statistics.total_tags}</p>
                            </div>
                            <div className="rounded-full bg-blue-500/10 p-3">
                                <Tag className="h-6 w-6 text-blue-500" />
                            </div>
                        </div>
                    </Link>

                    {/* Total Categories */}
                    <Link
                        href={route('admin.categories.index')}
                        className="rounded-lg border border-border bg-card p-6 shadow-sm transition-colors hover:bg-accent"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                                <p className="mt-2 text-3xl font-bold text-foreground">{statistics.total_categories}</p>
                            </div>
                            <div className="rounded-full bg-purple-500/10 p-3">
                                <FolderTree className="h-6 w-6 text-purple-500" />
                            </div>
                        </div>
                    </Link>

                    {/* Total Platforms */}
                    <Link
                        href={route('admin.platforms.index')}
                        className="rounded-lg border border-border bg-card p-6 shadow-sm transition-colors hover:bg-accent"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Platforms</p>
                                <p className="mt-2 text-3xl font-bold text-foreground">{statistics.total_platforms}</p>
                            </div>
                            <div className="rounded-full bg-orange-500/10 p-3">
                                <Monitor className="h-6 w-6 text-orange-500" />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Recent Templates */}
                <div className="rounded-lg border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b border-border p-6">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Recent Templates</h2>
                            <p className="mt-1 text-sm text-muted-foreground">Latest templates created</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.visit(route('admin.prompts.index'))}
                        >
                            View All
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                    <div className="divide-y divide-border">
                        {recent_templates && recent_templates.length > 0 ? (
                            recent_templates.map((template) => (
                                <Link
                                    key={template.id}
                                    href={route('admin.prompts.show', template.id)}
                                    className="flex items-center justify-between p-6 transition-colors hover:bg-accent"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-medium text-foreground">{template.title}</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Created {formatDate(template.created_at)}
                                        </p>
                                    </div>
                                    <div className="ml-4">{getStatusBadge(template.status)}</div>
                                </Link>
                            ))
                        ) : (
                            <div className="p-6 text-center text-sm text-muted-foreground">
                                No templates found. Create your first template to get started.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
