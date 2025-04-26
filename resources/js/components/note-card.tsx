import React, { useState } from 'react';
import { Prompt } from '@/types';
import { Link, usePage } from '@inertiajs/react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const visibleTags = 2;
  const tags = prompt.tags;
  const hiddenCount = tags.length - visibleTags;

  const toggleTags = () => {
    setIsExpanded(!isExpanded);
  };

  const copyPrompt = async () => {
    const text = prompt?.prompt || '';
    if (!text) return;
  
    // Modern clipboard
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Clipboard write failed', err);
      }
    } else {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
  
      try {
        document.execCommand('copy');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
  
      document.body.removeChild(textarea);
    }
  };
  
  
  return (
    <div
      className="note-card bg-white/10 rounded-2xl p-3 xs:p-4 sm:p-5 md:p-6 hover:-translate-y-2 hover:shadow-lg hover:shadow-ai-cyan/30 transition-all duration-300"
      style={{ '--index': index } as React.CSSProperties}
    >
      <p className="text-white/90 text-xs xs:text-sm sm:text-base mb-3 sm:mb-4 h-12 xs:h-14 sm:h-16 md:h-20 overflow-hidden text-ellipsis">
        #{prompt.id} | {prompt.title} 
      </p>

      <div className="tags flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4 min-h-[1.5rem] sm:min-h-[1.75rem]">
        {tags.slice(0, visibleTags).map((tag, idx) => (
          <span
            key={idx}
            className="tag bg-ai-cyan/20 text-ai-cyan text-[0.65rem] xs:text-xs sm:text-sm font-medium px-2 xs:px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full hover:bg-ai-cyan/40 transition-colors"
          >
            {tag.name} {/* Display the tag name */}
          </span>
        ))}

        {tags.slice(visibleTags).map((tag, idx) => (
          <span
            key={idx + visibleTags}
            className={`tag bg-ai-cyan/20 text-ai-cyan text-[0.65rem] xs:text-xs sm:text-sm font-medium px-2 xs:px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full hover:bg-ai-cyan/40 transition-colors ${
              isExpanded ? '' : 'hidden'
            }`}
          >
            {tag.name} {/* Display the tag name */}
          </span>
        ))}

        {hiddenCount > 0 && (
          <span
            className="more-tags bg-ai-cyan/20 text-ai-cyan text-[0.65rem] xs:text-xs sm:text-sm font-medium px-2 xs:px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full cursor-pointer hover:bg-ai-cyan/40 transition-colors"
            onClick={toggleTags}
          >
            {isExpanded ? 'Show less' : `+${hiddenCount} more`}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-3">
  <button
    className={`copy-btn w-full text-white font-semibold px-3 xs:px-4 sm:px-5 py-2 rounded-full transition-colors text-xs xs:text-sm ${
      isCopied ? 'bg-green-500 hover:bg-green-500' : 'bg-ai-cyan hover:bg-ai-coral'
    }`}
    onClick={copyPrompt}
  >
    {isCopied ? 'Copied!' : 'Copy Prompt'}
  </button>

  <Link
    href={route('prompt.show', prompt.id)}
    className="bg-ai-cyan/20 text-ai-cyan text-xs xs:text-sm sm:text-sm font-medium px-3 xs:px-4 sm:px-5 py-2 rounded-full hover:bg-ai-cyan/40 transition-colors"
  >
    Show Full Details
  </Link>
</div>

    </div>
  );
}
