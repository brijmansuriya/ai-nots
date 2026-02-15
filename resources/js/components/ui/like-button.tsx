import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { route } from 'ziggy-js';

interface LikeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    promptId: number;
    isLiked?: boolean;
    likesCount?: number;
    onToggle?: (liked: boolean, newCount: number) => void;
    size?: 'sm' | 'md';
    variant?: 'primary' | 'ghost';
}

export function LikeButton({
    promptId,
    isLiked: initialIsLiked = false,
    likesCount: initialLikesCount = 0,
    onToggle,
    size = 'md',
    variant = 'ghost',
    className,
    ...props
}: LikeButtonProps) {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        setIsLoading(true);

        try {
            const endpoint = isLiked
                ? route('prompt.unlike', promptId)
                : route('prompt.like', promptId);

            const method = isLiked ? 'delete' : 'post';

            const response = await axios[method](endpoint);

            const newLiked = response.data.liked ?? !isLiked;
            const newCount = response.data.likes_count ?? likesCount;

            setIsLiked(newLiked);
            setLikesCount(newCount);
            onToggle?.(newLiked, newCount);
        } catch (error: any) {
            if (error.response?.status === 401) {
                // User not authenticated - could redirect to login
                console.log('Please log in to like prompts');
            } else {
                console.error('Failed to toggle like:', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const baseClasses =
        'inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg font-medium text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white focus-visible:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed min-w-0';

    const sizeClasses = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2.5';

    const variantClasses =
        variant === 'ghost'
            ? isLiked
                ? 'bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900'
                : 'bg-transparent border border-border text-foreground hover:bg-accent hover:text-accent-foreground'
            : isLiked
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 dark:border dark:border-zinc-700';

    return (
        <button
            type="button"
            {...props}
            onClick={handleToggle}
            disabled={isLoading}
            className={cn(baseClasses, sizeClasses, variantClasses, className)}
        >
            <Heart className={cn('w-4 h-4 flex-shrink-0', isLiked && 'fill-current')} />
            <span className="whitespace-nowrap hidden sm:inline">{isLiked ? 'Liked' : 'Like'}</span>
            {likesCount > 0 && <span className="text-xs whitespace-nowrap ml-0.5">({likesCount})</span>}
        </button>
    );
}

