import React, { useState } from 'react';
import { Prompt, Tags } from '@/types';
import { Link, usePage, router } from '@inertiajs/react';
import { Edit2, Trash2, ExternalLink } from 'lucide-react';
import { SaveButton } from '@/components/ui/save-button';
import { LikeButton } from '@/components/ui/like-button';
import { MetricsDisplay } from '@/components/ui/metrics-display';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface NoteCardProps {
  prompt: Prompt;
  index: number;
  onDeleted?: (id: number) => void;
}

export default function NoteCard({ prompt, index, onDeleted }: NoteCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { auth } = usePage().props;
  const user = auth?.user;
  const isOwner = user && prompt.promptable_id === user.id;
  const imageUrl = (prompt as any).image_url;

  const description = (prompt as any).description || prompt.prompt?.substring(0, 120) || 'No description available';
  const truncatedDescription = description.length > 120 ? description.substring(0, 120) + '...' : description;

  return (
    <div
      className="note-card bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      style={{ '--index': index } as React.CSSProperties}
    >
      {/* Header with Title and Actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <Link
            href={route('prompt.show', prompt.id)}
            className="block group"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-gray-200 transition-colors line-clamp-2">
              {prompt.title}
            </h3>
          </Link>
        </div>
        {isOwner && (
          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.visit(`/prompt/${prompt.id}/edit`);
              }}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Edit prompt"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger asChild>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteOpen(true);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete prompt"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white">
                    Delete this prompt?
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400">
                    This action cannot be undone. This will permanently delete the prompt{" "}
                    <span className="font-semibold">"{prompt.title}"</span>.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setDeleteOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
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
          </div>
        )}
      </div>

      {/* Image Preview - Show if image exists */}
      {imageUrl && (
        <Link
          href={route('prompt.show', prompt.id)}
          className="block mb-5 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:opacity-90 transition-opacity"
        >
          <img
            src={imageUrl}
            alt={prompt.title}
            className="w-full h-48 object-cover"
          />
        </Link>
      )}

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 line-clamp-2 min-h-[2.5rem]">
        {truncatedDescription}
      </p>

      {/* Tags */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {prompt.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {tag.name}
            </span>
          ))}
          {prompt.tags.length > 3 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
              +{prompt.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Metrics Display */}
      {(prompt.save_count !== undefined || prompt.copy_count !== undefined ||
        prompt.likes_count !== undefined || prompt.views_count !== undefined) && (
          <div className="mb-5 pt-4 pb-3 border-t border-gray-100 dark:border-gray-700">
            <MetricsDisplay
              saveCount={prompt.save_count ?? 0}
              copyCount={prompt.copy_count ?? 0}
              likesCount={prompt.likes_count ?? 0}
              viewsCount={prompt.views_count ?? 0}
              popularityScore={prompt.popularity_score ?? 0}
              size="sm"
              showLabels={false}
            />
          </div>
        )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-5 pb-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {user && (
            <>
              <SaveButton
                promptId={prompt.id}
                isSaved={prompt.is_saved ?? false}
                saveCount={prompt.save_count ?? 0}
                size="sm"
                variant="ghost"
              />
              <LikeButton
                promptId={prompt.id}
                isLiked={prompt.is_liked ?? false}
                likesCount={prompt.likes_count ?? 0}
                size="sm"
                variant="ghost"
              />
            </>
          )}
        </div>
        <Link
          href={route('prompt.show', prompt.id)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm hover:shadow-md whitespace-nowrap"
        >
          <span>View</span>
          <ExternalLink className="w-4 h-4 flex-shrink-0" />
        </Link>
      </div>
    </div>
  );
}
