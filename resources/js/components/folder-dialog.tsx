import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Folder } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Info, FolderTree as FolderTreeIcon } from 'lucide-react';

interface FolderDialogProps {
    folder: Folder | null;
    parentId: number | null;
    onClose: () => void;
    onSuccess: () => void;
}

const COLOR_OPTIONS = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Gray', value: '#6b7280' },
];

export default function FolderDialog({ folder, parentId, onClose, onSuccess }: FolderDialogProps) {
    const [name, setName] = useState(folder?.name || '');
    const [color, setColor] = useState(folder?.color || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (folder) {
            setName(folder.name);
            setColor(folder.color || null);
        }
    }, [folder]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data: any = {
                name,
                emoji: null, // Emoji removed - always set to null
                color,
            };

            if (!folder && parentId) {
                data.parent_id = parentId;
            }

            if (folder) {
                await axios.put(route('folders.update', { folder: folder.id }), data);
            } else {
                await axios.post(route('folders.store'), data);
            }

            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save folder');
            console.error('Failed to save folder:', err);
        } finally {
            setLoading(false);
        }
    };

    const isNestedFolder = parentId !== null;

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-xl font-bold">
                        {folder ? (
                            <>
                                <FolderTreeIcon className="w-5 h-5 text-gray-900 dark:text-white" />
                                Edit Folder
                            </>
                        ) : (
                            <>
                                <FolderTreeIcon className="w-5 h-5 text-gray-900 dark:text-white" />
                                {isNestedFolder ? 'Create Subfolder' : 'Create New Folder'}
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {folder
                            ? 'Update your folder name or color.'
                            : isNestedFolder
                                ? 'This folder will be created inside the selected folder.'
                                : 'Organize your prompts by creating folders. You can create nested folders later.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md">
                            {error}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="name" className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold mb-2">
                            Folder Name
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">(required)</span>
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={isNestedFolder ? "Subfolder name..." : "e.g., Work, Personal, Projects"}
                            required
                            autoFocus
                            className="mt-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                            Choose a descriptive name to easily identify this folder
                        </p>
                    </div>

                    <div>
                        <Label className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold mb-2">
                            Folder Color
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
                        </Label>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                            Add a color accent to your folder for quick visual identification
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                            <button
                                type="button"
                                onClick={() => setColor(null)}
                                className={cn(
                                    'p-3 rounded-md border-2 text-sm font-medium transition-all hover:scale-105',
                                    color === null
                                        ? 'border-gray-900 dark:border-white bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white ring-2 ring-gray-300 dark:ring-gray-600'
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900'
                                )}
                            >
                                None
                            </button>
                            {COLOR_OPTIONS.map((colorOption) => (
                                <button
                                    key={colorOption.value}
                                    type="button"
                                    onClick={() => setColor(colorOption.value)}
                                    className={cn(
                                        'p-3 rounded-md border-2 transition-all hover:scale-105',
                                        color === colorOption.value
                                            ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 ring-gray-300 dark:ring-gray-600 shadow-md'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    )}
                                    style={{ backgroundColor: colorOption.value }}
                                    title={colorOption.name}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onClose}
                            className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading || !name.trim()}
                            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin">⏳</span>
                                    Saving...
                                </span>
                            ) : folder ? 'Update Folder' : 'Create Folder'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

