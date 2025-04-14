import React, { useState } from 'react';

interface Prompt {
  id: number;
  text: string;
  tags: string[];
}

interface NoteCardProps {
  prompt: Prompt;
  index: number;
}

const NoteCard: React.FC<NoteCardProps> = ({ prompt, index }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const visibleTags = 2;
  const tags = prompt.tags;
  const hiddenCount = tags.length - visibleTags;

  const toggleTags = () => {
    setIsExpanded(!isExpanded);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt.text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div
      className="note-card bg-white/10 rounded-2xl p-3 xs:p-4 sm:p-5 md:p-6 hover:-translate-y-2 hover:shadow-lg hover:shadow-ai-cyan/30 transition-all duration-300"
      style={{ '--index': index } as React.CSSProperties}
    >
      <p className="text-white/90 text-xs xs:text-sm sm:text-base mb-3 sm:mb-4 h-12 xs:h-14 sm:h-16 md:h-20 overflow-hidden text-ellipsis">
        {prompt.text}
      </p>
      <div className="tags flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4 min-h-[1.5rem] sm:min-h-[1.75rem]">
        {tags.slice(0, visibleTags).map((tag, idx) => (
          <span
            key={idx}
            className="tag bg-ai-cyan/20 text-ai-cyan text-[0.65rem] xs:text-xs sm:text-sm font-medium px-2 xs:px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full hover:bg-ai-cyan/40 transition-colors"
          >
            {tag}
          </span>
        ))}
        {tags.slice(visibleTags).map((tag, idx) => (
          <span
            key={idx + visibleTags}
            className={`tag bg-ai-cyan/20 text-ai-cyan text-[0.65rem] xs:text-xs sm:text-sm font-medium px-2 xs:px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full hover:bg-ai-cyan/40 transition-colors ${
              isExpanded ? '' : 'hidden'
            }`}
          >
            {tag}
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
      <button
        className={`copy-btn w-full text-white font-semibold px-3 xs:px-4 sm:px-5 py-2 rounded-full transition-colors text-xs xs:text-sm ${
          isCopied ? 'bg-green-500 hover:bg-green-500' : 'bg-ai-cyan hover:bg-ai-coral'
        }`}
        onClick={copyPrompt}
      >
        {isCopied ? 'Copied!' : 'Copy Prompt'}
      </button>
    </div>
  );
};

export default NoteCard;