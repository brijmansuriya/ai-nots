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
        <Link href={route('prompt.versions', promptId)}>
            <Button variant="ghost" size="sm" className="gap-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                <History className="w-4 h-4" />
                <span>Versions</span>
            </Button>
        </Link>
    );
}
