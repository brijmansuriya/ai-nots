import React from 'react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';

interface VersionHistoryProps {
    promptId: number;
}

export function VersionHistory({ promptId }: VersionHistoryProps) {
    return (
        <Link href={route('prompt.versions', promptId)} className="inline-block">
            <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 h-9 px-4 text-sm font-medium border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            >
                <History className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Versions</span>
            </Button>
        </Link>
    );
}
