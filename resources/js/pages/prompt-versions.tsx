import React, { useState, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';
import axios from 'axios';
import { route } from 'ziggy-js';
import WebLayout from '@/layouts/web-layout';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { History, RotateCcw, Eye, Trash2, GitCompare, ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VersionComparison } from '@/components/version-comparison';

interface Version {
    id: number;
    version_number: number;
    title: string;
    prompt: string;
    description: string | null;
    change_summary: string | null;
    created_by: string | null;
    created_at: string;
    formatted_date: string;
    relative_time: string;
}

interface PromptVersionsProps {
    prompt: {
        id: number;
        title: string;
    };
    versions: Version[];
    currentPrompt?: {
        title: string;
        prompt: string;
        description: string | null;
    };
}

export default function PromptVersions({ prompt, versions: initialVersions, currentPrompt }: PromptVersionsProps) {
    const [versions, setVersions] = useState<Version[]>(initialVersions || []);
    const [loading, setLoading] = useState(false);
    const [restoring, setRestoring] = useState<number | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [versionToDelete, setVersionToDelete] = useState<Version | null>(null);
    const [viewVersion, setViewVersion] = useState<Version | null>(null);
    const [viewOpen, setViewOpen] = useState(false);
    const [compareOpen, setCompareOpen] = useState(false);
    const [compareVersionId, setCompareVersionId] = useState<number | null>(null);

    const fetchVersions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('prompt.versions.api', prompt.id));
            setVersions(response.data.versions || []);
        } catch (error) {
            console.error('Failed to fetch versions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (versionId: number, versionNumber: number) => {
        if (!confirm(`Are you sure you want to restore version ${versionNumber}? This will create a new version with the current state.`)) {
            return;
        }

        setRestoring(versionId);
        try {
            await axios.post(route('prompt.versions.restore', [prompt.id, versionId]));
            await fetchVersions();
            // Redirect back to edit page
            router.visit(route('prompt.edit', prompt.id));
        } catch (error) {
            console.error('Failed to restore version:', error);
            alert('Failed to restore version. Please try again.');
        } finally {
            setRestoring(null);
        }
    };

    const handleDelete = async () => {
        if (!versionToDelete) return;

        setDeleting(versionToDelete.id);
        try {
            await axios.delete(route('prompt.versions.delete', [prompt.id, versionToDelete.id]));
            await fetchVersions();
            setDeleteConfirmOpen(false);
            setVersionToDelete(null);
        } catch (error) {
            console.error('Failed to delete version:', error);
            alert('Failed to delete version. Please try again.');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <>
            <WebLayout title="Version History">
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black transition-colors">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                        {/* Header */}
                        <div className="mb-8">
                            <Link
                                href={route('prompt.edit', prompt.id)}
                                className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Back to Edit</span>
                            </Link>
                            <div className="flex items-center gap-3 mb-2">
                                <History className="w-6 h-6 text-gray-900 dark:text-white" />
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                                    Version History
                                </h1>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                View, restore, or delete previous versions of <span className="font-semibold">"{prompt.title}"</span>
                            </p>
                        </div>

                        {/* Current Version Card */}
                        {currentPrompt && (
                            <div className="mb-6 p-4 rounded-lg border-2 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/20">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-blue-700 dark:text-blue-300">Current Version</span>
                                            <span className="text-xs px-2 py-0.5 bg-blue-200 dark:bg-blue-900 rounded-full text-blue-800 dark:text-blue-200">
                                                Latest
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Your current prompt content</p>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-2">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Title</p>
                                        <p className="text-sm font-medium">{currentPrompt.title}</p>
                                    </div>
                                    {currentPrompt.description && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</p>
                                            <p className="text-sm whitespace-pre-wrap">{currentPrompt.description}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Prompt</p>
                                        <div className="p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                                            <p className="text-sm whitespace-pre-wrap font-mono">{currentPrompt.prompt}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Versions List */}
                        <div className="space-y-3 sm:space-y-4">
                            {loading && versions.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                                </div>
                            ) : versions.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No version history yet.</p>
                                    <p className="text-sm mt-2">Versions will appear here after you edit your prompt.</p>
                                </div>
                            ) : (
                                versions.map((version, index) => (
                                    <div
                                        key={version.id}
                                        className={cn(
                                            "rounded-lg border transition-all duration-200",
                                            "border-gray-200 dark:border-gray-700",
                                            "bg-white dark:bg-gray-900",
                                            "hover:border-gray-300 dark:hover:border-gray-600",
                                            "hover:shadow-sm dark:hover:shadow-gray-800/50"
                                        )}
                                    >
                                        {/* Version Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                                                    <span className="font-semibold text-base text-gray-900 dark:text-white">
                                                        Version {version.version_number}
                                                    </span>
                                                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                        {version.relative_time}
                                                    </span>
                                                    {index === versions.length - 1 && (
                                                        <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                                                            Oldest
                                                        </span>
                                                    )}
                                                </div>
                                                {version.change_summary && (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                                                        {version.change_summary}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                    {version.formatted_date}
                                                    {version.created_by && ` • by ${version.created_by}`}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setViewVersion(version);
                                                        setViewOpen(true);
                                                    }}
                                                    className="h-8 sm:h-9 px-2 sm:px-3 gap-1.5 text-xs sm:text-sm"
                                                    title="View"
                                                >
                                                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    <span className="hidden xs:inline">View</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setCompareVersionId(version.id);
                                                        setCompareOpen(true);
                                                    }}
                                                    className="h-8 sm:h-9 px-2 sm:px-3 gap-1.5 text-xs sm:text-sm"
                                                    title="Compare"
                                                >
                                                    <GitCompare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    <span className="hidden sm:inline">Compare</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRestore(version.id, version.version_number)}
                                                    disabled={restoring === version.id}
                                                    className="h-8 sm:h-9 px-2 sm:px-3 gap-1.5 text-xs sm:text-sm border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                                                    title="Restore"
                                                >
                                                    {restoring === version.id ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 border-b-2 border-blue-600 dark:border-blue-400"></div>
                                                            <span>Restoring...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                            <span className="font-medium">Restore</span>
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setVersionToDelete(version);
                                                        setDeleteConfirmOpen(true);
                                                    }}
                                                    disabled={deleting === version.id}
                                                    className="h-8 sm:h-9 w-8 sm:w-9 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50"
                                                    title="Delete"
                                                >
                                                    {deleting === version.id ? (
                                                        <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-red-600 dark:border-red-400"></div>
                                                    ) : (
                                                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        {/* Version Content */}
                                        <div className="p-4 sm:p-6 pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                                            <div>
                                                <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">Title</p>
                                                <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{version.title}</p>
                                            </div>
                                            {version.description && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">Description</p>
                                                    <p className="text-sm sm:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300">{version.description}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">Prompt</p>
                                                <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                    <p className="text-sm sm:text-base whitespace-pre-wrap font-mono text-gray-900 dark:text-gray-100 break-words">{version.prompt}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </WebLayout>

            {/* View Version Dialog */}
            <div className={cn(
                "fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4",
                viewOpen ? "block" : "hidden"
            )}>
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={() => setViewOpen(false)} />
                <div className="relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Version {viewVersion?.version_number}</h2>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {viewVersion?.formatted_date} • {viewVersion?.relative_time}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewOpen(false)}
                            className="h-9 w-9 p-0 ml-4 flex-shrink-0"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    {viewVersion && (
                        <div className="space-y-4 p-4 sm:p-6 overflow-y-auto flex-1">
                            <div>
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">Title</p>
                                <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{viewVersion.title}</p>
                            </div>
                            {viewVersion.description && (
                                <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">Description</p>
                                    <p className="text-sm sm:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300">{viewVersion.description}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">Prompt</p>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-sm sm:text-base whitespace-pre-wrap font-mono text-gray-900 dark:text-gray-100">{viewVersion.prompt}</p>
                                </div>
                            </div>
                            {viewVersion.change_summary && (
                                <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">Changes</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">{viewVersion.change_summary}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Version {versionToDelete?.version_number}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete version {versionToDelete?.version_number}. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={!!deleting}
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Version Comparison Dialog */}
            {compareVersionId && (
                <VersionComparison
                    promptId={prompt.id}
                    version1Id={compareVersionId}
                    version2Id={null}
                    open={compareOpen}
                    onOpenChange={(open) => {
                        setCompareOpen(open);
                        if (!open) {
                            setCompareVersionId(null);
                        }
                    }}
                />
            )}
        </>
    );
}

