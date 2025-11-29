import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Tag {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    status?: string;
    created_at: string;
    updated_at?: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Platform {
    id: number;
    name: string;
    selected?: boolean;
    [key: string]: unknown;
}

export interface PromptVariable {
    id: number;
    name: string;
    [key: string]: unknown;
}

export interface Category {
    id: string | number;
    name: string;
    [key: string]: unknown;
}

export interface Tags {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    status: string;
    created_by_id: number;
    created_by_type: string;
    created_at: string;
    updated_at: string;
    pivot: {
        prompt_id: number;
        tag_id: number;
        created_at: string;
        updated_at: string;
    };
}

export interface Prompt {
    id: number;
    title: string;
    prompt: string;
    description?: string | null;
    promptable_id: number;
    promptable_type: 'admin' | 'user' | 'guest';
    is_public: 0 | 1 | 2;
    status: 0 | 1 | 2;
    category_id: number;
    dynamic_variables: Record<string, any>;
    tags: Tags[];
    platforms?: Platform[];
    variables?: PromptVariable[];
    image_url?: string | null;
}

export interface EditPromptProps {
    editing?: boolean;
    prompt?: {
        id: number;
        title: string;
        prompt: string;
        description: string | null;
        category_id: string | number | null;
        tags: { id: number; name: string }[];
        platforms: { id: number; name: string }[];
        variables?: PromptVariable[];
    };
}