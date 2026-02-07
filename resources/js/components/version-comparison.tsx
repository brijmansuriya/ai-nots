import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { route } from 'ziggy-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GitCompare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Version {
    id: number;
    version_number: number | string;
    title: string;
    prompt: string;
    description: string | null;
    created_at: string;
    formatted_date?: string;
}

interface VersionComparisonProps {
    promptId: number;
    version1Id: number;
    version2Id?: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function VersionComparison({ promptId, version1Id, version2Id, open, onOpenChange }: VersionComparisonProps) {
    const [version1, setVersion1] = useState<Version | null>(null);
    const [version2, setVersion2] = useState<Version | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && version1Id) {
            fetchComparison();
        }
    }, [open, promptId, version1Id, version2Id]);

    const fetchComparison = async () => {
        setLoading(true);
        try {
            const params: any = { version2: version2Id || null };
            const url = route('prompt.versions.compare', [promptId, version1Id]);
            
            const response = await axios.get(url, { params });
            setVersion1(response.data.version1);
            setVersion2(response.data.version2);
        } catch (error) {
            console.error('Failed to fetch comparison:', error);
        } finally {
            setLoading(false);
        }
    };

    const highlightDiff = (text1: string, text2: string): { old: string; new: string } => {
        // Simple diff highlighting - in production, use a proper diff library
        if (text1 === text2) {
            return { old: text1, new: text2 };
        }

        const lines1 = text1.split('\n');
        const lines2 = text2.split('\n');
        const maxLines = Math.max(lines1.length, lines2.length);

        const oldParts: string[] = [];
        const newParts: string[] = [];

        for (let i = 0; i < maxLines; i++) {
            const line1 = lines1[i] || '';
            const line2 = lines2[i] || '';

            if (line1 !== line2) {
                const escaped1 = line1.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const escaped2 = line2.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                oldParts.push(`<span class="bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-200 px-1.5 py-0.5 rounded">${escaped1 || '(deleted)'}</span>`);
                newParts.push(`<span class="bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-200 px-1.5 py-0.5 rounded">${escaped2 || '(added)'}</span>`);
            } else {
                oldParts.push(line1.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
                newParts.push(line2.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
            }
        }

        return {
            old: oldParts.join('\n'),
            new: newParts.join('\n'),
        };
    };

    if (!version1 || !version2) {
        return null;
    }

    const titleDiff = highlightDiff(version1.title, version2.title);
    const promptDiff = highlightDiff(version1.prompt, version2.prompt);
    const description1 = version1.description || '';
    const description2 = version2.description || '';
    const descriptionDiff = highlightDiff(description1, description2);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] lg:max-w-6xl max-h-[95vh] w-full p-0 gap-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                        <GitCompare className="w-5 h-5 text-gray-900 dark:text-white" />
                        <span className="text-gray-900 dark:text-white">Compare Versions</span>
                    </DialogTitle>
                </DialogHeader>
                
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-0 max-h-[calc(95vh-180px)] overflow-hidden">
                        {/* Version 1 */}
                        <div className="border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 p-4 lg:p-6 overflow-y-auto">
                            <div className="sticky top-0 bg-white dark:bg-gray-900 pb-3 mb-4 z-10">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900 dark:text-white text-base">
                                        Version {version1.version_number}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {version1.formatted_date || new Date(version1.created_at).toLocaleString()}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">Title</p>
                                    <div 
                                        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100"
                                        dangerouslySetInnerHTML={{ __html: titleDiff.old }}
                                    />
                                </div>

                                {(version1.description || version2.description) && (
                                    <div>
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">Description</p>
                                        <div 
                                            className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100"
                                            dangerouslySetInnerHTML={{ __html: descriptionDiff.old }}
                                        />
                                    </div>
                                )}

                                <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">Prompt</p>
                                    <div 
                                        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 whitespace-pre-wrap text-sm font-mono text-gray-900 dark:text-gray-100"
                                        dangerouslySetInnerHTML={{ __html: promptDiff.old }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Version 2 */}
                        <div className="p-4 lg:p-6 overflow-y-auto">
                            <div className="sticky top-0 bg-white dark:bg-gray-900 pb-3 mb-4 z-10">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900 dark:text-white text-base">
                                        {version2.version_number === 'current' ? 'Current Version' : `Version ${version2.version_number}`}
                                    </span>
                                    {version2.version_number === 'current' && (
                                        <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-800 dark:text-blue-200 font-medium">
                                            Latest
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {version2.formatted_date || new Date(version2.created_at).toLocaleString()}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">Title</p>
                                    <div 
                                        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100"
                                        dangerouslySetInnerHTML={{ __html: titleDiff.new }}
                                    />
                                </div>

                                {(version1.description || version2.description) && (
                                    <div>
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">Description</p>
                                        <div 
                                            className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100"
                                            dangerouslySetInnerHTML={{ __html: descriptionDiff.new }}
                                        />
                                    </div>
                                )}

                                <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">Prompt</p>
                                    <div 
                                        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 whitespace-pre-wrap text-sm font-mono text-gray-900 dark:text-gray-100"
                                        dangerouslySetInnerHTML={{ __html: promptDiff.new }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-0 pt-4 px-6 pb-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 px-2.5 py-1.5 rounded-md font-medium">
                            <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400"></span>
                            Removed
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 px-2.5 py-1.5 rounded-md font-medium">
                            <span className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"></span>
                            Added
                        </span>
                    </div>
                    <Button 
                        onClick={() => onOpenChange(false)} 
                        variant="outline"
                        className="w-full sm:w-auto"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
