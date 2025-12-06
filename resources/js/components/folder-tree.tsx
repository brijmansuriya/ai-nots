import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { Folder, ChevronRight, ChevronDown, Plus, FolderOpen, Trash2, Edit2, Info, HelpCircle, MoreVertical, AlertCircle, FileText } from 'lucide-react';
import { Folder as FolderType } from '@/types';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import FolderDialog from './folder-dialog';

interface FolderTreeProps {
    selectedFolderId: number | 'all' | 'unfoldered' | null;
    onFolderSelect: (folderId: number | 'all' | 'unfoldered' | null) => void;
    onPromptMove?: (promptId: number, folderId: number | null) => void;
    onFoldersRefresh?: () => void;
}


function FolderTree({ selectedFolderId, onFolderSelect, onPromptMove, onFoldersRefresh }: FolderTreeProps) {
    const [folders, setFolders] = useState<FolderType[]>([]);
    const [loading, setLoading] = useState(true);

    // Load expanded folders from localStorage on mount
    const loadExpandedFolders = (): Set<number> => {
        try {
            const saved = localStorage.getItem('expandedFolders');
            if (saved) {
                const folderIds = JSON.parse(saved) as number[];
                return new Set(folderIds);
            }
        } catch (error) {
            console.error('Failed to load expanded folders from localStorage:', error);
        }
        return new Set();
    };

    const [expandedFolders, setExpandedFolders] = useState<Set<number>>(loadExpandedFolders);
    const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [parentFolderId, setParentFolderId] = useState<number | null>(null);
    const [showHelp, setShowHelp] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [folderToDelete, setFolderToDelete] = useState<number | null>(null);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [draggedOverFolderId, setDraggedOverFolderId] = useState<number | 'unfoldered' | null>(null);
    const [dragEnterCount, setDragEnterCount] = useState<Map<number | 'unfoldered', number>>(new Map());

    // Save expanded folders to localStorage whenever they change
    useEffect(() => {
        try {
            const folderIds = Array.from(expandedFolders);
            localStorage.setItem('expandedFolders', JSON.stringify(folderIds));
        } catch (error) {
            console.error('Failed to save expanded folders to localStorage:', error);
        }
    }, [expandedFolders]);

    useEffect(() => {
        fetchFolders();
    }, []);

    // Global drag end handler to clean up state
    useEffect(() => {
        const handleGlobalDragEnd = () => {
            // Small delay to allow drop handlers to complete
            setTimeout(() => {
                setDraggedOverFolderId(null);
                setDragEnterCount(new Map());
            }, 100);
        };

        document.addEventListener('dragend', handleGlobalDragEnd);
        return () => {
            document.removeEventListener('dragend', handleGlobalDragEnd);
        };
    }, []);

    const fetchFolders = async () => {
        try {
            setLoading(true);
            const response = await axios.get(route('folders.tree'));
            setFolders(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch folders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (folderId: number) => {
        // Close any open dropdown
        setOpenDropdownId(null);
        // Set the folder to delete and open dialog
        setFolderToDelete(folderId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!folderToDelete) return;

        const folderIdToDelete = folderToDelete;

        // Close dialog first
        setDeleteDialogOpen(false);

        try {
            await axios.delete(route('folders.destroy', { folder: folderIdToDelete }));
            fetchFolders();
            if (selectedFolderId === folderIdToDelete) {
                onFolderSelect('all');
            }
            // Reset state after successful deletion
            setFolderToDelete(null);
        } catch (error) {
            console.error('Failed to delete folder:', error);
            setErrorMessage('Failed to delete folder. Please try again.');
            setErrorDialogOpen(true);
            // Reset state even on error
            setFolderToDelete(null);
        }
    };

    const toggleExpanded = (folderId: number) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(folderId)) {
                newSet.delete(folderId);
            } else {
                newSet.add(folderId);
            }
            // Save to localStorage immediately
            try {
                const folderIds = Array.from(newSet);
                localStorage.setItem('expandedFolders', JSON.stringify(folderIds));
            } catch (error) {
                console.error('Failed to save expanded folders to localStorage:', error);
            }
            return newSet;
        });
    };

    const handleCreateFolder = (parentId: number | null = null) => {
        setParentFolderId(parentId);
        setEditingFolder(null);
        setShowCreateDialog(true);
    };

    const handleEditFolder = (folder: FolderType) => {
        setEditingFolder(folder);
        setParentFolderId(null);
        setShowCreateDialog(true);
    };

    const handleDialogClose = () => {
        setShowCreateDialog(false);
        setEditingFolder(null);
        setParentFolderId(null);
    };

    const handleDialogSuccess = () => {
        fetchFolders();
        handleDialogClose();
    };

    const renderFolder = (folder: FolderType, level: number = 0) => {
        const isExpanded = expandedFolders.has(folder.id);
        const isSelected = selectedFolderId === folder.id;
        const hasChildren = folder.children && folder.children.length > 0;
        const hasPrompts = folder.prompts && folder.prompts.length > 0;
        const isDraggedOver = draggedOverFolderId === folder.id;

        // Handle drag enter with proper counting to prevent false dragleave
        const handleDragEnter = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();

            // Check if we're dragging a prompt (has draggedPromptId or dataTransfer has data)
            const draggedPromptId = (window as any).draggedPromptId;

            // Some browsers don't expose types in dragenter, so check window variable first
            let hasPromptData = !!draggedPromptId;

            // Try to check dataTransfer types if available
            try {
                if (e.dataTransfer.types) {
                    const types = Array.from(e.dataTransfer.types);
                    hasPromptData = hasPromptData || types.includes('text/plain') || types.includes('application/json');
                }
            } catch (err) {
                // Types might not be available in dragenter in some browsers
            }


            if (!hasPromptData) {
                return;
            }

            // Auto-expand folder when dragging over it
            if (!isExpanded && (hasChildren || hasPrompts)) {
                setExpandedFolders(prev => {
                    const newSet = new Set(prev);
                    newSet.add(folder.id);
                    try {
                        const folderIds = Array.from(newSet);
                        localStorage.setItem('expandedFolders', JSON.stringify(folderIds));
                    } catch (error) {
                        console.error('Failed to save expanded folders:', error);
                    }
                    return newSet;
                });
            }

            // Increment drag enter count
            setDragEnterCount(prev => {
                const newMap = new Map(prev);
                const count = newMap.get(folder.id) || 0;
                newMap.set(folder.id, count + 1);
                return newMap;
            });

            setDraggedOverFolderId(folder.id);
        };

        // Handle drag leave with relatedTarget check
        const handleDragLeave = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();

            // Check if we're actually leaving the element (not just moving to a child)
            const relatedTarget = e.relatedTarget as HTMLElement;
            const currentTarget = e.currentTarget as HTMLElement;

            if (relatedTarget && currentTarget.contains(relatedTarget)) {
                // Still inside the element, don't remove highlight
                return;
            }

            // Decrement drag enter count
            setDragEnterCount(prev => {
                const newMap = new Map(prev);
                const count = newMap.get(folder.id) || 0;
                if (count <= 1) {
                    newMap.delete(folder.id);
                    if (draggedOverFolderId === folder.id) {
                        setDraggedOverFolderId(null);
                    }
                } else {
                    newMap.set(folder.id, count - 1);
                }
                return newMap;
            });
        };

        // Handle drag over
        const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';

            // Check if we have prompt data
            const draggedPromptId = (window as any).draggedPromptId;
            let hasPromptData = !!draggedPromptId;

            // Check dataTransfer types if available
            try {
                if (e.dataTransfer.types) {
                    const types = Array.from(e.dataTransfer.types);
                    hasPromptData = hasPromptData || types.includes('text/plain') || types.includes('application/json');
                }
            } catch (err) {
                // Types might not be available
            }

            if (!hasPromptData) {
                return;
            }

            // Ensure we're highlighted
            if (draggedOverFolderId !== folder.id) {
                setDraggedOverFolderId(folder.id);
            }
        };

        return (
            <div key={folder.id} className="select-none mb-1">
                <div
                    className={cn(
                        'group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent/50 transition-all relative',
                        isSelected && 'bg-primary/10 font-semibold border border-primary/30 shadow-sm'
                    )}
                    style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
                >
                    {/* Expand/Collapse Button */}
                    {(hasChildren || hasPrompts) ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(folder.id);
                            }}
                            className="p-1 hover:bg-accent rounded-md flex-shrink-0 transition-colors"
                            title={isExpanded ? "Collapse" : "Expand"}
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-primary" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                        </button>
                    ) : (
                        <div className="w-6 flex-shrink-0" />
                    )}

                    {/* Folder Name & Drop Zone */}
                    <div
                        className={cn(
                            "flex-1 flex items-center gap-2.5 text-left min-w-0 group/drop rounded-md transition-all",
                            isDraggedOver && "bg-primary/10 ring-2 ring-primary/30 scale-[1.02]"
                        )}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            // Reset drag state
                            setDraggedOverFolderId(null);
                            setDragEnterCount(new Map());

                            // Get prompt ID from multiple sources for reliability
                            let promptIdStr = (window as any).draggedPromptId;

                            if (!promptIdStr) {
                                promptIdStr = e.dataTransfer.getData('text/plain');
                            }
                            if (!promptIdStr) {
                                try {
                                    const jsonData = e.dataTransfer.getData('application/json');
                                    if (jsonData) {
                                        const data = JSON.parse(jsonData);
                                        promptIdStr = data.promptId;
                                    }
                                } catch (err) {
                                    // Ignore JSON parse errors
                                }
                            }

                            const promptId = typeof promptIdStr === 'number' ? promptIdStr : parseInt(String(promptIdStr));

                            if (!promptId || isNaN(promptId)) {
                                console.error('Invalid prompt ID:', promptIdStr);
                                (window as any).draggedPromptId = null;
                                return;
                            }

                            if (!onPromptMove) {
                                console.error('onPromptMove handler not available');
                                (window as any).draggedPromptId = null;
                                return;
                            }

                            // Check if prompt is already in this folder (prevent unnecessary moves)
                            const promptInThisFolder = folder.prompts?.some(p => p.id === promptId);
                            if (promptInThisFolder) {
                                (window as any).draggedPromptId = null;
                                return;
                            }

                            // Clear draggedPromptId immediately to prevent reuse
                            const currentPromptId = promptId;
                            (window as any).draggedPromptId = null;

                            try {
                                // Call the move handler
                                await onPromptMove(currentPromptId, folder.id);

                                // Refresh folders immediately and ensure folder is expanded
                                await fetchFolders();

                                // Ensure the folder is expanded to show the moved prompt
                                setExpandedFolders(prev => {
                                    const newSet = new Set(prev);
                                    newSet.add(folder.id);
                                    try {
                                        const folderIds = Array.from(newSet);
                                        localStorage.setItem('expandedFolders', JSON.stringify(folderIds));
                                    } catch (error) {
                                        console.error('Failed to save expanded folders:', error);
                                    }
                                    return newSet;
                                });

                                if (onFoldersRefresh) {
                                    onFoldersRefresh();
                                }
                            } catch (error) {
                                console.error('Failed to move prompt to folder:', error);
                                // Revert by refreshing
                                await fetchFolders();
                                if (onFoldersRefresh) {
                                    onFoldersRefresh();
                                }
                            }
                        }}
                    >
                        <button
                            onClick={() => onFolderSelect(folder.id)}
                            className="flex-1 flex items-center gap-2.5 text-left min-w-0"
                            type="button"
                        >
                            <Folder className={cn(
                                "w-4 h-4 flex-shrink-0 transition-colors",
                                isSelected ? "text-primary" : "text-muted-foreground"
                            )} />
                            <span className={cn(
                                "text-sm flex-1 min-w-0 transition-colors truncate",
                                isSelected ? "text-primary font-semibold" : "text-foreground font-medium"
                            )} title={folder.name}>
                                {folder.name}
                            </span>
                            {folder.prompts_count !== undefined && folder.prompts_count > 0 && (
                                <span className={cn(
                                    "text-xs flex-shrink-0 px-2 py-0.5 rounded-full font-medium transition-colors",
                                    isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    {folder.prompts_count}
                                </span>
                            )}
                        </button>
                        <span className="text-xs text-primary opacity-0 group-hover/drop:opacity-100 transition-opacity flex-shrink-0 whitespace-nowrap ml-1 font-medium pointer-events-none">
                            Drop
                        </span>
                    </div>

                    {/* Three Dots Menu - Clean UI */}
                    <DropdownMenu
                        open={openDropdownId === folder.id}
                        onOpenChange={(open) => {
                            setOpenDropdownId(open ? folder.id : null);
                        }}
                    >
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 hover:bg-accent text-muted-foreground hover:text-foreground rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-48 bg-card border-border shadow-lg"
                            onCloseAutoFocus={(e) => e.preventDefault()}
                        >
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDropdownId(null);
                                    handleEditFolder(folder);
                                }}
                                className="cursor-pointer focus:bg-accent"
                            >
                                <Edit2 className="w-4 h-4 mr-2" />
                                <span>Rename</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDropdownId(null);
                                    handleCreateFolder(folder.id);
                                }}
                                className="cursor-pointer focus:bg-accent"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                <span>Create Subfolder</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setOpenDropdownId(null);
                                    handleDeleteClick(folder.id);
                                }}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                <span>Delete Folder</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Show prompts when folder is expanded */}
                {isExpanded && folder.prompts && folder.prompts.length > 0 && (
                    <div className="ml-8 mt-1 space-y-0.5">
                        {folder.prompts.map((prompt) => (
                            <button
                                key={prompt.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.visit(`/prompt/${prompt.id}/edit`);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-accent/50 transition-colors text-left group/prompt"
                                style={{ paddingLeft: `${(level + 1) * 1.25 + 0.5}rem` }}
                            >
                                <FileText className="w-3.5 h-3.5 text-muted-foreground group-hover/prompt:text-primary flex-shrink-0" />
                                <span className="text-xs text-muted-foreground group-hover/prompt:text-foreground truncate flex-1">
                                    {prompt.title}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Show child folders when expanded */}
                {hasChildren && isExpanded && (
                    <div className="ml-2 mt-1">
                        {folder.children!.map(child => renderFolder(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Loading folders...
            </div>
        );
    }

    return (
        <>
            <div className="space-y-1">
                {/* Help Section - Show for first-time users */}
                {folders.length === 0 && !loading && (
                    <div className="mb-4 p-3 bg-accent/50 border border-border rounded-lg">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1 text-xs text-foreground">
                                <p className="font-medium mb-1">Get Started with Folders</p>
                                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                                    <li>Click <strong>+</strong> to create your first folder</li>
                                    <li>Drag prompts onto folders to organize them</li>
                                    <li>Create nested folders by clicking <strong>+</strong> on a folder</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Access Section */}
                <div className="mb-6 space-y-2">
                    <div className="flex items-center justify-between px-2 mb-3">
                        <span className="text-sm font-bold text-foreground uppercase tracking-wider">
                            Quick Access
                        </span>
                        {folders.length > 0 && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => setShowHelp(!showHelp)}
                                        className="p-1.5 hover:bg-accent rounded-md transition-colors"
                                    >
                                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Show help tips</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>

                    {showHelp && (
                        <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-lg text-xs">
                            <p className="font-semibold mb-2 text-primary">💡 Quick Tips:</p>
                            <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
                                <li>Drag prompts to folders to organize</li>
                                <li>Click folder name to view its prompts</li>
                                <li>Use <strong>+</strong> button to create subfolders</li>
                            </ul>
                        </div>
                    )}

                    {/* All Prompts */}
                    <button
                        onClick={() => onFolderSelect('all')}
                        className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-accent/50 transition-all text-base font-medium',
                            selectedFolderId === 'all' && 'bg-primary/10 border border-primary/30 shadow-sm'
                        )}
                    >
                        <FolderOpen className={cn(
                            "w-5 h-5 flex-shrink-0",
                            selectedFolderId === 'all' ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className={cn(
                            "flex-1",
                            selectedFolderId === 'all' ? "text-primary font-semibold" : "text-foreground font-medium"
                        )}>
                            All Prompts
                        </span>
                    </button>

                    {/* Unfoldered */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => onFolderSelect('unfoldered')}
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    const draggedPromptId = (window as any).draggedPromptId;
                                    let hasPromptData = !!draggedPromptId;

                                    try {
                                        if (e.dataTransfer.types) {
                                            const types = Array.from(e.dataTransfer.types);
                                            hasPromptData = hasPromptData || types.includes('text/plain') || types.includes('application/json');
                                        }
                                    } catch (err) {
                                        // Types might not be available
                                    }

                                    if (!hasPromptData) return;
                                    setDragEnterCount(prev => {
                                        const newMap = new Map(prev);
                                        const count = newMap.get('unfoldered') || 0;
                                        newMap.set('unfoldered', count + 1);
                                        return newMap;
                                    });
                                    setDraggedOverFolderId('unfoldered');
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.dataTransfer.dropEffect = 'move';
                                    if (draggedOverFolderId !== 'unfoldered') {
                                        setDraggedOverFolderId('unfoldered');
                                    }
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const relatedTarget = e.relatedTarget as HTMLElement;
                                    const currentTarget = e.currentTarget as HTMLElement;
                                    if (relatedTarget && currentTarget.contains(relatedTarget)) {
                                        return;
                                    }
                                    setDragEnterCount(prev => {
                                        const newMap = new Map(prev);
                                        const count = newMap.get('unfoldered') || 0;
                                        if (count <= 1) {
                                            newMap.delete('unfoldered');
                                            if (draggedOverFolderId === 'unfoldered') {
                                                setDraggedOverFolderId(null);
                                            }
                                        } else {
                                            newMap.set('unfoldered', count - 1);
                                        }
                                        return newMap;
                                    });
                                }}
                                onDrop={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Drop event fired on unfoldered');
                                    setDraggedOverFolderId(null);
                                    setDragEnterCount(new Map());

                                    // Get prompt ID from multiple sources for reliability
                                    let promptIdStr = (window as any).draggedPromptId;
                                    if (!promptIdStr) {
                                        promptIdStr = e.dataTransfer.getData('text/plain');
                                    }
                                    if (!promptIdStr) {
                                        try {
                                            const jsonData = e.dataTransfer.getData('application/json');
                                            if (jsonData) {
                                                const data = JSON.parse(jsonData);
                                                promptIdStr = data.promptId;
                                            }
                                        } catch (err) {
                                            // Ignore JSON parse errors
                                        }
                                    }

                                    const promptId = typeof promptIdStr === 'number' ? promptIdStr : parseInt(String(promptIdStr));

                                    if (!promptId || isNaN(promptId)) {
                                        console.error('Invalid prompt ID:', promptIdStr);
                                        (window as any).draggedPromptId = null;
                                        return;
                                    }

                                    if (!onPromptMove) {
                                        console.error('onPromptMove handler not available');
                                        (window as any).draggedPromptId = null;
                                        return;
                                    }

                                    // Clear draggedPromptId immediately to prevent reuse
                                    const currentPromptId = promptId;
                                    (window as any).draggedPromptId = null;

                                    try {
                                        await onPromptMove(currentPromptId, null);

                                        // Refresh folders immediately
                                        await fetchFolders();
                                        if (onFoldersRefresh) {
                                            onFoldersRefresh();
                                        }
                                    } catch (error) {
                                        console.error('Failed to move prompt to unfoldered:', error);
                                        // Revert by refreshing
                                        await fetchFolders();
                                        if (onFoldersRefresh) {
                                            onFoldersRefresh();
                                        }
                                    }
                                }}
                                className={cn(
                                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-accent/50 transition-all text-base font-medium relative group/drop',
                                    selectedFolderId === 'unfoldered' && 'bg-primary/10 border border-primary/30 shadow-sm',
                                    draggedOverFolderId === 'unfoldered' && 'bg-primary/10 ring-2 ring-primary/30 scale-[1.02]'
                                )}
                            >
                                <Folder className={cn(
                                    "w-5 h-5 flex-shrink-0",
                                    selectedFolderId === 'unfoldered' ? "text-primary" : "text-muted-foreground"
                                )} />
                                <span className={cn(
                                    "flex-1",
                                    selectedFolderId === 'unfoldered' ? "text-primary font-semibold" : "text-foreground font-medium"
                                )}>
                                    Unfoldered
                                </span>
                                <span className="text-xs text-primary opacity-0 group-hover/drop:opacity-100 transition-opacity whitespace-nowrap font-medium">
                                    Drop
                                </span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">Prompts without a folder. Drag prompts here to remove from folders.</p>
                        </TooltipContent>
                    </Tooltip>
                </div>

                {/* Folders Section */}
                <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between px-1 mb-3">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">My Folders</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary rounded-md transition-colors"
                                    onClick={() => handleCreateFolder(null)}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Create a new folder</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    {folders.length === 0 ? (
                        <div className="px-2 py-8 text-center">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                <Folder className="w-6 h-6 text-primary" />
                            </div>
                            <p className="text-sm font-semibold text-foreground mb-1.5">
                                No folders yet
                            </p>
                            <p className="text-xs text-muted-foreground mb-5">
                                Create your first folder to organize prompts
                            </p>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleCreateFolder(null)}
                                className="text-xs font-semibold"
                            >
                                <Plus className="w-3.5 h-3.5 mr-1.5" />
                                Create Folder
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-0.5">
                            {folders.map(folder => renderFolder(folder))}
                        </div>
                    )}
                </div>
            </div>

            {showCreateDialog && (
                <FolderDialog
                    folder={editingFolder}
                    parentId={parentFolderId}
                    onClose={handleDialogClose}
                    onSuccess={handleDialogSuccess}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) {
                        // Reset state when dialog closes
                        setFolderToDelete(null);
                    }
                }}
            >
                <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-foreground">
                            <AlertCircle className="w-5 h-5 text-destructive" />
                            Delete Folder?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Are you sure you want to delete this folder? All prompts in this folder will be moved to Unfoldered. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setFolderToDelete(null);
                            }}
                            className="text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="!bg-destructive !text-white hover:!bg-destructive/90 focus:ring-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 shadow-xs"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Error Dialog */}
            <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
                <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-foreground">
                            <AlertCircle className="w-5 h-5 text-destructive" />
                            Error
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            {errorMessage}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
                            OK
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

// Wrap the component with TooltipProvider
const FolderTreeWithProvider = (props: FolderTreeProps) => (
    <TooltipProvider>
        <FolderTree {...props} />
    </TooltipProvider>
);

export default FolderTreeWithProvider;

