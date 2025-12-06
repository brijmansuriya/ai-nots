import { useState } from 'react';
import { Copy, Star, Folder, Check } from 'lucide-react';
import { Prompt } from '@/types';
import { cn } from '@/utils/cn';

interface PromptCardProps {
  prompt: Prompt;
  onCopy: (text: string) => void;
}

export function PromptCard({ prompt, onCopy }: PromptCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sm text-foreground line-clamp-1 flex-1">
          {prompt.title}
        </h3>
        <button
          onClick={handleCopy}
          className={cn(
            "p-1.5 rounded-md transition-colors flex-shrink-0 ml-2",
            copied
              ? "bg-green-500/20 text-green-600 dark:text-green-400"
              : "bg-muted hover:bg-accent text-muted-foreground"
          )}
          title="Copy prompt"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {prompt.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {prompt.description}
        </p>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {prompt.folder && (
          <div className="flex items-center gap-1">
            <Folder className="w-3 h-3" />
            <span>{prompt.folder.name}</span>
          </div>
        )}
        {prompt.is_saved && (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>Saved</span>
          </div>
        )}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {prompt.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="px-1.5 py-0.5 bg-muted rounded text-xs"
              >
                {tag.name}
              </span>
            ))}
            {prompt.tags.length > 2 && (
              <span className="text-xs">+{prompt.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground line-clamp-3 font-mono">
          {prompt.prompt}
        </p>
      </div>
    </div>
  );
}

