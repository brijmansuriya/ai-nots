import AdminLayoutTemplate from '@/layouts/app/admin-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AdminLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        {children}
    </AdminLayoutTemplate>
);
