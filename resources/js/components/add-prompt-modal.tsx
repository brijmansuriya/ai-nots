import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';

interface NewPrompt {
  title: string;
  prompt: string;
  tags: string[];
  platform: string;
  dynamic_variables: string[];
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

interface AddPromptModalProps {
  onClose: () => void;
}

export default function AddPromptModal({ onClose }: AddPromptModalProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [dynamicVariables, setDynamicVariables] = useState<string[]>([]);

  // Extract dynamic variables from prompt text
  const extractDynamicVariables = (text: string): string[] => {
    const matches = text.match(/{(.*?)}/g);
    return matches ? Array.from(new Set(matches.map(v => v.replace(/[{}]/g, '')))) : [];
  };

  // Tag toggle handler
  const handleTagToggle = (tag: string) => {
    const newTags = tags.includes(tag)
      ? tags.filter((t) => t !== tag)
      : [...tags, tag];

    setTags(newTags);
    setData('tags', newTags);
  };

  // Fetch tags
  const getTagsData = async () => {
    try {
      const response = await axios.get(route('tags'));
      setAvailableTags(response.data.tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setError('Failed to load tags.');
    }
  };

  useEffect(() => {
    getTagsData();
  }, []);

  const { data, setData, post, processing, errors } = useForm<NewPrompt>({
    title: '',
    prompt: '',
    tags: [],
    platform: '',
    dynamic_variables: [],
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('prompts.store'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-lg p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-ai-cyan">Add New AI Prompt</h2>

        <form onSubmit={submit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">Title</label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData('title', e.target.value)}
              placeholder="Enter your prompt title..."
              className="w-full rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-ai-cyan focus:outline-none"
            />
          </div>

          {/* dynamic_variables */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">Dynamic Variables</label>
            <input
              type="text"
              value={data.dynamic_variables.join(', ')}
              onChange={(e) => setData('dynamic_variables', e.target.value.split(',').map(v => v.trim()))}
              placeholder="Enter dynamic variables separated by commas..."
              className="w-full rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-ai-cyan focus:outline-none"
            />
          </div>

          {/* Prompt */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">AI Prompt</label>
            <textarea
              value={data.prompt}
              onChange={(e) => {
                const text = e.target.value;
                const variables = extractDynamicVariables(text);
                setDynamicVariables(variables);
                setData('prompt', text);
                setData('dynamic_variables', variables);
              }}
              placeholder="Enter your prompt with {variables}..."
              className="min-h-[100px] w-full resize-none rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-ai-cyan focus:outline-none"
            />
            {dynamicVariables.length > 0 && (
              <p className="mt-2 text-xs text-white/60">
                Detected Variables: {dynamicVariables.join(', ')}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">Tags</label>
            <div className="max-h-32 overflow-y-auto rounded-lg bg-white/5 p-3">
              <div className="grid grid-cols-2 gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id.toString())}
                    className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${
                      tags.includes(tag.id.toString())
                        ? 'bg-ai-cyan text-white shadow shadow-ai-cyan/30'
                        : 'bg-ai-cyan/20 text-ai-cyan hover:bg-ai-cyan/40'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Support Platform
            </label>
            <input
              type="text"
              value={data.platform}
              onChange={(e) => setData('platform', e.target.value)}
              placeholder="e.g., Grok, ChatGPT..."
              className="w-full rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-ai-cyan focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={processing}
              className="rounded-lg bg-ai-cyan px-6 py-2 text-sm font-semibold text-white hover:bg-ai-cyan/80 transition-all"
            >
              Add Prompt
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-white/10 px-6 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
