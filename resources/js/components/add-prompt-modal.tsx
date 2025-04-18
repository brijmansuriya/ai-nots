import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';

interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

interface Platform {
  id: number;
  name: string;
  selected?: boolean;
}

interface AddPromptModalProps {
  onClose: () => void;
}

export default function AddPromptModal({ onClose }: AddPromptModalProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [manualVars, setManualVars] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  const { data, setData, post, processing } = useForm({
    title: '',
    prompt: '',
    tags: [] as string[],
    platform: [] as string[],
    dynamic_variables: [] as string[],
  });

  useEffect(() => {
    axios.get(route('tags')).then((res) => setAvailableTags(res.data.tags));
    axios.get(route('platform')).then((res) =>
      setPlatforms(res.data.platforms.map((p: Platform) => ({ ...p, selected: false })))
    );
  }, []);

  const extractDynamicVariables = (promptText: string): string[] => {
    const matches = [...promptText.matchAll(/\[([^\]]+)\]/g)];
    return Array.from(new Set(matches.map((m) => m[1].trim())));
  };

  const handlePromptChange = (text: string) => {
    setData('prompt', text);
    const variables = extractDynamicVariables(text);
    setManualVars(variables);
    setData('dynamic_variables', variables);
  };

  const insertVariableIntoPrompt = (variable: string) => {
    const textarea = document.getElementById('prompt-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const newPrompt = `${data.prompt.slice(0, cursorPos)}[${variable}]${data.prompt.slice(cursorPos)}`;

    setData('prompt', newPrompt);
    handlePromptChange(newPrompt);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos + variable.length + 2, cursorPos + variable.length + 2);
    }, 0);
  };

  const handlePlatformToggle = (id: string) => {
    const updated = platforms.map((p) =>
      p.id.toString() === id ? { ...p, selected: !p.selected } : p
    );
    setPlatforms(updated);
    setData('platform', updated.filter((p) => p.selected).map((p) => p.id.toString()));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('prompts.store'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-lg p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-ai-cyan">Add New AI Prompt</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <InputField label="Title" value={data.title} onChange={(e) => setData('title', e.target.value)} />

          {/* Prompt */}
          <div>
            <label className="block mb-2 text-sm font-medium text-white/80">AI Prompt</label>
            <textarea
              id="prompt-textarea"
              value={data.prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              placeholder="Use [variable_name] inside your prompt..."
              className="min-h-[100px] w-full rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-ai-cyan focus:outline-none"
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
                      className="rounded bg-ai-cyan/30 px-2 py-1 text-xs font-medium text-white hover:bg-ai-cyan/50"
                    >
                      [{v}]
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Variables */}
          <DynamicVariableInput
            manualVars={manualVars}
            setManualVars={setManualVars}
            data={data}
            setData={setData}
          />

          {/* Tags */}
          <TagSelector
            tags={tags}
            tagInput={tagInput}
            setTagInput={setTagInput}
            availableTags={availableTags}
            setTags={setTags}
            setData={setData}
          />

          {/* Platforms */}
          <div>
            <label className="block mb-2 text-sm font-medium text-white/80">Platforms</label>
            <div className="max-h-32 overflow-y-auto rounded-lg bg-white/5 p-3">
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => handlePlatformToggle(platform.id.toString())}
                    className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${
                      platform.selected
                        ? 'bg-ai-cyan text-white shadow shadow-ai-cyan/30'
                        : 'bg-ai-cyan/20 text-ai-cyan hover:bg-ai-cyan/40'
                    }`}
                  >
                    {platform.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={processing}
              className="rounded-lg bg-ai-cyan px-6 py-2 text-sm font-semibold text-white hover:bg-ai-cyan/80"
            >
              Add Prompt
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-white/10 px-6 py-2 text-sm font-semibold text-white hover:bg-white/20"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ⬇️ Reusable input components for clean structure
function InputField({ label, value, onChange }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-white/80">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-ai-cyan focus:outline-none"
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
    </div>
  );
}

function TagSelector({ tags, tagInput, setTagInput, availableTags, setTags, setData }: any) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-white/80">Tags</label>
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/20 bg-transparent p-2">
          {tags.map((tag: string, i: number) => (
            <div key={i} className="flex items-center gap-1 rounded bg-ai-cyan/40 px-2 py-1 text-sm text-white">
              {tag}
              <button
                type="button"
                onClick={() => {
                  const updated = tags.filter((_: any, index: number) => index !== i);
                  setTags(updated);
                  setData('tags', updated);
                }}
                className="ml-1 text-white hover:text-red-400"
              >
                ✕
              </button>
            </div>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                e.preventDefault();
                const newTag = tagInput.trim();
                if (!tags.includes(newTag)) {
                  const updated = [...tags, newTag];
                  setTags(updated);
                  setData('tags', updated);
                }
                setTagInput('');
              }
            }}
            placeholder="Type to add or select..."
            className="flex-1 bg-transparent text-white placeholder:text-white/40 focus:outline-none"
          />
        </div>

        {tagInput && (
          <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-lg border border-white/20 bg-black/80 shadow-lg">
            {availableTags
              .filter((t: Tag) => t.name.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(t.name))
              .map((tag: Tag) => (
                <li
                  key={tag.id}
                  onClick={() => {
                    const updated = [...tags, tag.name];
                    setTags(updated);
                    setData('tags', updated);
                    setTagInput('');
                  }}
                  className="cursor-pointer px-4 py-2 text-sm text-white hover:bg-ai-cyan/40"
                >
                  {tag.name}
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function DynamicVariableInput({ manualVars, setManualVars, data, setData }: any) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-white/80">Dynamic Variables</label>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/20 bg-transparent p-2">
        {manualVars.map((v: string, i: number) => (
          <div key={i} className="flex items-center gap-1 rounded bg-ai-cyan/40 px-2 py-1 text-sm text-white">
            {v}
            <button
              type="button"
              onClick={() => {
                const updated = manualVars.filter((_: any, index: number) => index !== i);
                setManualVars(updated);
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
  );
}
