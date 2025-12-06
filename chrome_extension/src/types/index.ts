export interface Tag {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
}

export interface Folder {
    id: number;
    name: string;
    color?: string | null;
    emoji?: string | null;
}

export interface Prompt {
    id: number;
    title: string;
    prompt: string;
    description?: string | null;
    folder_id?: number | null;
    folder?: Folder | null;
    tags?: Tag[];
    is_saved?: boolean;
    is_liked?: boolean;
    save_count?: number;
    copy_count?: number;
    likes_count?: number;
    views_count?: number;
    created_at?: string;
    updated_at?: string;
}

