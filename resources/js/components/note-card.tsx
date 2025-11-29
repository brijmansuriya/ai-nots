import React from 'react';
import { Prompt } from '@/types';
import { Link, usePage, router } from '@inertiajs/react';
import { Edit2, Trash2, ExternalLink } from 'lucide-react';
import { CopyButton } from '@/components/ui/copy-button';

export interface Tags {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  created_by_id: number;
  created_by_type: string;
  created_at: string;
  updated_at: string;
  pivot: {
    prompt_id: number;
    tag_id: number;
    created_at: string;
    updated_at: string;
  };
}

interface NoteCardProps {
  prompt: Prompt;
  index: number;
}

export default function NoteCard({ prompt, index }: NoteCardProps) {
  const { auth } = usePage().props;
  const user = auth?.user;
  const isOwner = user && prompt.promptable_id === user.id;

  const description = (prompt as any).description || prompt.prompt?.substring(0, 120) || 'No description available';
  const truncatedDescription = description.length > 120 ? description.substring(0, 120) + '...' : description;

  return (
    <div
      className="note-card bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      style={{ '--index': index } as React.CSSProperties}
    >
      {/* Header with Title and Actions */}
      <div className="flex items-start justify-between mb-3">
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
                // TODO: Implement edit functionality
                router.visit(route('prompt.edit', prompt.id));
              }}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Edit prompt"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                // TODO: Implement delete functionality
                if (confirm('Are you sure you want to delete this prompt?')) {
                  // router.delete(route('prompt.destroy', prompt.id));
                }
              }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete prompt"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
        {truncatedDescription}
      </p>

      {/* Tags */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
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

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
        <CopyButton
          value={prompt.prompt}
          size="sm"
          className="px-4 py-2"
        />
        <Link
          href={route('prompt.show', prompt.id)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <span>View</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
