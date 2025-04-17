import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';

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
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [detectedVars, setDetectedVars] = useState<string[]>([]);
  const [manualVars, setManualVars] = useState<string[]>([]);
  const [error, setError] = useState('');

  const { data, setData, post, processing } = useForm({
    title: '',
    prompt: '',
    tags: [] as string[],
    platform: '',
    dynamic_variables: [] as string[],
  });

  useEffect(() => {
    axios
      .get(route('tags'))
      .then((res) => setAvailableTags(res.data.tags))
      .catch(() => setError('Failed to load tags.'));
  }, []);

  const extractDynamicVariables = (promptText: string): string[] => {
    const matches = [...promptText.matchAll(/\[([^\]]+)\]/g)];
    const unique = Array.from(new Set(matches.map((m) => m[1].trim())));
    return unique;
  };

  const handlePromptChange = (text: string) => {
    setData('prompt', text);
    const variables = extractDynamicVariables(text);
    setDetectedVars(variables);
    setManualVars(variables);
    setData('dynamic_variables', variables);
  };

  const insertVariableIntoPrompt = (variable: string) => {
    const textarea = document.getElementById('prompt-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const before = data.prompt.slice(0, cursorPos);
    const after = data.prompt.slice(cursorPos);
    const newPrompt = `${before}[${variable}]${after}`;

    setData('prompt', newPrompt);
    handlePromptChange(newPrompt);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos + variable.length + 2, cursorPos + variable.length + 2);
    }, 0);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = tags.includes(tag)
      ? tags.filter((t) => t !== tag)
      : [...tags, tag];

    setTags(newTags);
    setData('tags', newTags);
  };

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
              placeholder="Prompt title..."
              className="w-full rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-ai-cyan focus:outline-none"
            />
          </div>

          {/* Prompt */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">AI Prompt</label>
            <textarea
              id="prompt-textarea"
              value={data.prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              placeholder="Use [variable_name] inside your prompt..."
              className="min-h-[100px] w-full resize-none rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-ai-cyan focus:outline-none"
            />
            {manualVars.length > 0 && (
              <div className="mt-2 text-xs text-white/70">
                <p className="mb-1">Click a variable to insert:</p>
                <div className="flex flex-wrap gap-2">
                  {manualVars.map((v, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => insertVariableIntoPrompt(v)}
                      className="rounded bg-ai-cyan/30 px-2 py-1 text-xs font-medium text-white hover:bg-ai-cyan/50 transition-all"
                    >
                      [{v}]
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Manual Dynamic Variables as tags */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Dynamic Variables
            </label>
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/20 bg-transparent p-2">
              {manualVars.map((v, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 rounded bg-ai-cyan/40 px-2 py-1 text-sm text-white"
                >
                  {v}
                  <button
                    type="button"
                    onClick={() => {
                      const updated = manualVars.filter((_, index) => index !== i);
                      setManualVars(updated);
                      setDetectedVars(updated);
                      setData('dynamic_variables', updated);
                      const newPrompt = data.prompt.replaceAll(`[${v}]`, v);
                      setData('prompt', newPrompt);
                    }}
                    className="ml-1 text-white hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <input
                type="text"
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ',') && e.currentTarget.value.trim()) {
                    e.preventDefault();
                    const newVar = e.currentTarget.value.trim();
                    if (!manualVars.includes(newVar)) {
                      const updated = [...manualVars, newVar];
                      setManualVars(updated);
                      setDetectedVars(updated);
                      setData('dynamic_variables', updated);

                      const newPrompt = data.prompt.includes(`[${newVar}]`)
                        ? data.prompt
                        : `${data.prompt} [${newVar}]`;
                      setData('prompt', newPrompt);
                    }
                    e.currentTarget.value = '';
                  }
                }}
                placeholder="Type and press Enter"
                className="flex-1 bg-transparent text-white placeholder:text-white/40 focus:outline-none"
              />
            </div>
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
            <label className="mb-2 block text-sm font-medium text-white/80">Platform</label>
            <input
              type="text"
              value={data.platform}
              onChange={(e) => setData('platform', e.target.value)}
              placeholder="e.g., ChatGPT, Grok..."
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
