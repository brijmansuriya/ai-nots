import React from 'react';
import { Bookmark, Copy, Heart, Eye, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsDisplayProps {
    saveCount?: number;
    copyCount?: number;
    likesCount?: number;
    viewsCount?: number;
    popularityScore?: number;
    className?: string;
    showLabels?: boolean;
    size?: 'sm' | 'md';
}

/**
 * Format a number with K, M suffixes
 */
function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

export function MetricsDisplay({
    saveCount = 0,
    copyCount = 0,
    likesCount = 0,
    viewsCount = 0,
    popularityScore = 0,
    className,
    showLabels = true,
    size = 'md',
}: MetricsDisplayProps) {
    const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

    // Ensure popularityScore is a number
    const popularityScoreNum = typeof popularityScore === 'number'
        ? popularityScore
        : parseFloat(String(popularityScore || 0)) || 0;

    const metrics = [
        {
            icon: Bookmark,
            label: 'Saves',
            value: saveCount,
            formatted: formatNumber(saveCount),
        },
        {
            icon: Copy,
            label: 'Copies',
            value: copyCount,
            formatted: formatNumber(copyCount),
        },
        {
            icon: Heart,
            label: 'Likes',
            value: likesCount,
            formatted: formatNumber(likesCount),
        },
        {
            icon: Eye,
            label: 'Views',
            value: viewsCount,
            formatted: formatNumber(viewsCount),
        },
        {
            icon: TrendingUp,
            label: 'Popularity',
            value: popularityScoreNum,
            formatted: popularityScoreNum.toFixed(1),
        },
    ];

    return (
        <div className={cn('flex flex-wrap items-center justify-start gap-5', className)}>
            {metrics.map((metric, index) => (
                <div
                    key={index}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                >
                    <metric.icon className={cn(iconSize, 'text-gray-500 dark:text-gray-500 flex-shrink-0')} />
                    <span className={cn(textSize, 'font-medium whitespace-nowrap leading-tight')}>
                        {showLabels ? `${metric.label}: ` : ''}
                        {metric.formatted}
                    </span>
                </div>
            ))}
        </div>
    );
}

