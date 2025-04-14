import { useState } from 'react';

interface NewPrompt {
  text: string;
  tags: string[];
  platform: string;
}

interface AddPromptModalProps {
  onClose: () => void;
  onSubmit: (prompt: NewPrompt) => void;
}

const availableTags = [
  'Creative',
  'Sci-Fi',
  'Writing',
  'Fiction',
  'Worldbuilding',
  'Coding',
  'Python',
  'Data Analysis',
  'NLP',
  'Marketing',
  'Branding',
  'Advertising',
  'AI',
  'Fitness',
  'Health',
  'AI Optimization',
  'Beginner',
];

export default function AddPromptModal({ onClose, onSubmit }: AddPromptModalProps) {
  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [platform, setPlatform] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Prompt text is required.');
      return;
    }
    if (tags.length === 0) {
      setError('At least one tag is required.');
      return;
    }
    setError('');
    onSubmit({ text, tags, platform });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="modal bg-white/10 backdrop-blur-lg rounded-2xl p-4 xs:p-6 sm:p-8 w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-ai-cyan mb-4 sm:mb-6">Add New AI Prompt</h2>
        
        {error && <p className="text-red-400 text-xs sm:text-sm mb-3 sm:mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* Prompt Text */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-white/80 text-xs sm:text-sm mb-1 sm:mb-2">AI Prompt</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your prompt..."
              className="w-full bg-transparent border border-white/20 rounded-lg px-3 sm:px-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-ai-cyan"
            />
          </div>

          {/* Tags Selector */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-white/80 text-xs sm:text-sm mb-1 sm:mb-2">Tags</label>
            <select
              multiple
              value={tags}
              onChange={(e) =>
                setTags(Array.from(e.target.selectedOptions, (opt) => opt.value))
              }
              className="w-full bg-transparent border border-white/20 rounded-lg px-3 sm:px-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-ai-cyan max-h-32"
            >
              {availableTags.map((tag) => (
                <option key={tag} value={tag} className="text-white bg-ai-dark">
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Platform Input */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-white/80 text-xs sm:text-sm mb-1 sm:mb-2">Support Platform</label>
            <input
              type="text"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="e.g., Grok, ChatGPT..."
              className="w-full bg-transparent border border-white/20 rounded-lg px-3 sm:px-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-ai-cyan"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              type="submit"
              className="bg-ai-cyan text-white font-semibold px-4 sm:px-6 py-2 rounded-full hover:bg-ai-coral transition-colors text-xs sm:text-sm"
            >
              Add Prompt
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-white/10 text-white font-semibold px-4 sm:px-6 py-2 rounded-full hover:bg-white/20 transition-colors text-xs sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
