import React, { useState } from 'react';
import { Prompt, Tags } from '@/types';
import { Link, usePage, router } from '@inertiajs/react';
import { Edit2, Trash2, ExternalLink, Bookmark, Copy, Heart, Eye, TrendingUp, Move, MoreVertical, Download, ArrowRight } from 'lucide-react';
import { SaveButton } from '@/components/ui/save-button';
import { LikeButton } from '@/components/ui/like-button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface NoteCardProps {
  prompt: Prompt;
  index: number;
  onDeleted?: (id: number) => void;
}

function NoteCard({ prompt, index, onDeleted }: NoteCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { auth } = usePage().props;
  const user = auth?.user;
  const isOwner = user && prompt.promptable_id === user.id;
  const imageUrl = (prompt as any).image_url;

  const description = (prompt as any).description || prompt.prompt?.substring(0, 120) || 'No description available';
  const truncatedDescription = description.length > 120 ? description.substring(0, 120) + '...' : description;

  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    // Don't start drag if clicking on the menu button or other interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('[role="button"]') || 
        target.closest('button') || 
        target.closest('a') ||
        target.closest('[role="menuitem"]')) {
      e.preventDefault();
      return;
    }
    
    // Validate prompt ID
    if (!prompt.id || isNaN(prompt.id)) {
      console.error('Invalid prompt ID for drag:', prompt.id);
      e.preventDefault();
      return;
    }
    
    // Store the prompt ID in a global variable (simple approach)
    (window as any).draggedPromptId = prompt.id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', prompt.id.toString());
    e.dataTransfer.setData('application/json', JSON.stringify({ promptId: prompt.id }));
    
    // Add visual feedback
    setIsDragging(true);
    e.currentTarget.style.opacity = '0.6';
    e.currentTarget.style.transform = 'scale(0.98)';
    e.currentTarget.style.cursor = 'grabbing';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    e.currentTarget.style.opacity = '1';
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.cursor = '';
    
    // Clear dragged prompt ID after a short delay to allow drop handler to read it
    setTimeout(() => {
      (window as any).draggedPromptId = null;
    }, 100);
  };

  return (
    <div
      draggable={isOwner}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "note-card bg-card rounded-xl border border-border p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 hover:-translate-y-1 relative group flex flex-col h-full",
        isOwner && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-60 scale-95 z-50"
      )}
      style={{ '--index': index } as React.CSSProperties}
      title={isOwner ? "Drag to move to a folder" : undefined}
    >
      {isOwner && !isDragging && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
            <Move className="w-3 h-3" />
            <span>Drag to organize</span>
          </div>
        </div>
      )}

      {/* Row 1: Header - Title and Actions */}
      <div className="flex items-start justify-between mb-3 flex-shrink-0">
        <div 
          className="flex-1 min-w-0 pr-2"
          onDragStart={(e) => e.stopPropagation()}
        >
          <Link
            href={route('prompt.show', prompt.id)}
            className="block group"
            onDragStart={(e) => e.stopPropagation()}
          >
            <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
              {prompt.title}
            </h3>
          </Link>
        </div>
        {isOwner && (
          <div 
            className="flex items-center gap-1 ml-2 flex-shrink-0"
            onDragStart={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onDragStart={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className={cn(
                    "p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors opacity-0 group-hover:opacity-100",
                    isDragging && "opacity-0 pointer-events-none"
                  )}
                  style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-lg">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.visit(`/prompt/${prompt.id}/edit`);
                  }}
                  className="cursor-pointer focus:bg-accent"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    // Duplicate functionality
                    router.visit(`/prompt/${prompt.id}/duplicate`);
                  }}
                  className="cursor-pointer focus:bg-accent"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  <span>Duplicate</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    // Move to folder functionality
                  }}
                  className="cursor-pointer focus:bg-accent"
                >
                  <Move className="w-4 h-4 mr-2" />
                  <span>Move to Folder</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    // Export functionality
                    const data = JSON.stringify(prompt, null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${prompt.title}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="cursor-pointer focus:bg-accent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span>Export</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setDeleteOpen(true);
                      }}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle className="text-foreground">
                        Delete this prompt?
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        This action cannot be undone. This will permanently delete the prompt{" "}
                        <span className="font-semibold">"{prompt.title}"</span>.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-accent transition-colors"
                        onClick={() => setDeleteOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                        onClick={() => {
                          router.delete(`/prompt/${prompt.id}`, {
                            preserveScroll: true,
                            onSuccess: () => {
                              setDeleteOpen(false);
                              if (onDeleted) {
                                onDeleted(prompt.id);
                              }
                            },
                            onFinish: () => setDeleteOpen(false),
                          });
                        }}
                      >
                        Delete
                      </button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Row 2: Image Preview (if exists) */}
      {imageUrl && (
        <Link
          href={route('prompt.show', prompt.id)}
          className="block mb-3 rounded-lg overflow-hidden border border-border hover:opacity-90 transition-opacity flex-shrink-0"
        >
          <img
            src={imageUrl}
            alt={prompt.title}
            className="w-full h-36 sm:h-40 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </Link>
      )}

      {/* Row 3: Description */}
      <div className="mb-3 flex-shrink-0">
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
          {truncatedDescription}
        </p>
      </div>

      {/* Row 4: Tags */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3 flex-shrink-0">
          {prompt.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-accent text-accent-foreground border border-border"
            >
              {tag.name}
            </span>
          ))}
          {prompt.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
              +{prompt.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Row 5: Metrics - Organized in Grid */}
      {(prompt.save_count !== undefined || prompt.copy_count !== undefined ||
        prompt.likes_count !== undefined || prompt.views_count !== undefined) && (
          <div className="mb-3 pt-3 pb-2 border-t border-border flex-shrink-0">
            <div className="grid grid-cols-5 gap-1.5">
              <div className="flex flex-col items-center justify-center p-1.5 rounded-md bg-muted border border-border">
                <Bookmark className="w-3 h-3 text-muted-foreground mb-0.5" />
                <span className="text-xs font-semibold text-foreground">{prompt.save_count ?? 0}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-1.5 rounded-md bg-muted border border-border">
                <Copy className="w-3 h-3 text-muted-foreground mb-0.5" />
                <span className="text-xs font-semibold text-foreground">{prompt.copy_count ?? 0}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-1.5 rounded-md bg-muted border border-border">
                <Heart className="w-3 h-3 text-muted-foreground mb-0.5" />
                <span className="text-xs font-semibold text-foreground">{prompt.likes_count ?? 0}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-1.5 rounded-md bg-muted border border-border">
                <Eye className="w-3 h-3 text-muted-foreground mb-0.5" />
                <span className="text-xs font-semibold text-foreground">{prompt.views_count ?? 0}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-1.5 rounded-md bg-primary/10 border border-primary/20">
                <TrendingUp className="w-3 h-3 text-primary mb-0.5" />
                <span className="text-xs font-semibold text-primary">
                  {(typeof prompt.popularity_score === 'number' 
                    ? prompt.popularity_score 
                    : parseFloat(String(prompt.popularity_score || 0)) || 0).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}

      {/* Row 6: Actions - Fixed at bottom */}
      <div className="flex items-center justify-between gap-2 pt-3 mt-auto border-t border-border flex-shrink-0 min-w-0">
        <div className="flex items-center gap-1 min-w-0">
          {user && (
            <>
              <SaveButton
                promptId={prompt.id}
                isSaved={prompt.is_saved ?? false}
                saveCount={prompt.save_count ?? 0}
                size="sm"
                variant="ghost"
                className="flex-shrink-0"
              />
              <LikeButton
                promptId={prompt.id}
                isLiked={prompt.is_liked ?? false}
                likesCount={prompt.likes_count ?? 0}
                size="sm"
                variant="ghost"
                className="flex-shrink-0"
              />
            </>
          )}
        </div>
        <Link
          href={route('prompt.show', prompt.id)}
          className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm hover:shadow-md whitespace-nowrap flex-shrink-0"
        >
          <span>View</span>
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
        </Link>
      </div>
    </div>
  );
}

// Wrap with TooltipProvider for tooltips
const NoteCardWithProvider = (props: NoteCardProps) => (
  <TooltipProvider>
    <NoteCard {...props} />
  </TooltipProvider>
);

export default NoteCardWithProvider;
