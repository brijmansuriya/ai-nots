import React, { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { route } from 'ziggy-js';

interface SaveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    promptId: number;
    isSaved?: boolean;
    saveCount?: number;
    onToggle?: (saved: boolean, newCount: number) => void;
    size?: 'sm' | 'md';
    variant?: 'primary' | 'ghost';
}

export function SaveButton({
    promptId,
    isSaved: initialIsSaved = false,
    saveCount: initialSaveCount = 0,
    onToggle,
    size = 'md',
    variant = 'ghost',
    className,
    ...props
}: SaveButtonProps) {
    const [isSaved, setIsSaved] = useState(initialIsSaved);
    const [saveCount, setSaveCount] = useState(initialSaveCount);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        setIsLoading(true);

        try {
            const endpoint = isSaved
                ? route('prompt.unsave', promptId)
                : route('prompt.save', promptId);

            const method = isSaved ? 'delete' : 'post';

            const response = await axios[method](endpoint);

            const newSaved = response.data.saved ?? !isSaved;
            const newCount = response.data.save_count ?? saveCount;

            setIsSaved(newSaved);
            setSaveCount(newCount);
            onToggle?.(newSaved, newCount);
        } catch (error: any) {
            if (error.response?.status === 401) {
                // User not authenticated - could redirect to login
                console.log('Please log in to save prompts');
            } else {
                console.error('Failed to toggle save:', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const baseClasses =
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white focus-visible:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed';

    const sizeClasses = size === 'sm' ? 'px-3.5 py-2' : 'px-4 py-2.5';

    const variantClasses =
        variant === 'ghost'
            ? isSaved
                ? 'bg-blue-50 dark:bg-blue-950 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900'
                : 'bg-transparent border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            : isSaved
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                : 'bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-200 text-white dark:text-gray-900 hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-gray-300 shadow-lg hover:shadow-xl';

    return (
        <button
            type="button"
            {...props}
            onClick={handleToggle}
            disabled={isLoading}
            className={cn(baseClasses, sizeClasses, variantClasses, className)}
        >
            {isSaved ? (
                <>
                    <BookmarkCheck className="w-4 h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">Saved</span>
                    {saveCount > 0 && <span className="text-xs whitespace-nowrap ml-0.5">({saveCount})</span>}
                </>
            ) : (
                <>
                    <Bookmark className="w-4 h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">Save</span>
                    {saveCount > 0 && <span className="text-xs whitespace-nowrap ml-0.5">({saveCount})</span>}
                </>
            )}
        </button>
    );
}

