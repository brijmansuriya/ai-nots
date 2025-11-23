import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import Select from 'react-select';

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
  onSuccess: () => void;
}

export default function AddPromptModal({ onClose, onSuccess }: AddPromptModalProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [manualVars, setManualVars] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const { data, setData, post, processing, errors } = useForm({
    title: '',
    prompt: '',
    tags: [] as string[],
    platform: [] as string[],
    category_id: '',
    dynamic_variables: [] as string[],
  });

  useEffect(() => {
    axios.get(route('tags')).then((res) => setAvailableTags(res.data.tags));
    axios.get(route('platform')).then((res) =>
      setPlatforms(res.data.platforms.map((p: Platform) => ({ ...p, selected: false })))
    );

    axios.get(route('categories')).then((res) => {
      // Assuming categories are fetched and set in a similar way
      setCategories(res.data.categories);
    });

    // Disable scrolling on mount
    document.body.style.overflow = 'hidden';

    return () => {
      // Re-enable scrolling on unmount
      document.body.style.overflow = '';
    };
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
    post(route('prompt.store'), {
      onSuccess: () => {
        onSuccess();
        onClose();
      }, // Close modal on success
      onError: () => console.error('Form submission failed:', errors),
    });
  };

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: '', // Dark background
      borderColor: 'rgba(255, 255, 255, 0.2)', // Light border
      color: '#fff', // White text
      borderRadius: '0.5rem',
      padding: '0.25rem',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#00FFFF', // AI Cyan hover
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: 'rgba(0, 0, 0, 0.9)', // Dark dropdown menu
      borderRadius: '0.5rem',
      overflow: 'hidden',
      color: '#fff', // White text
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? 'rgba(0, 255, 255, 0.3)' : 'transparent', // AI Cyan hover
      color: '#fff', // White text
      padding: '0.5rem',
      cursor: 'pointer',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#fff', // White text for selected value
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: 'rgba(255, 255, 255, 0.5)', // Light placeholder text
    }),
    input: (provided: any) => ({
      ...provided,
      color: '#fff', // White text for search input
    }),
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white/10 backdrop-blur-lg shadow-lg">
        {/* Scrollable content with themed scrollbar */}
        <div className="max-h-[80vh] overflow-y-auto p-6 themed-scrollbar">
          <h2 className="mb-6 text-xl font-bold text-ai-cyan">Add New AI Prompt</h2>

          {/* Error Messages */}
          {/* {Object.keys(errors).length > 0 && (
            <div className="mb-4 text-sm text-red-500">
              {Object.entries(errors).map(([field, error], index) => (
                <div key={index}>
                  <strong>{field}:</strong> {error}
                </div>
              ))}
            </div>
          )} */}

          <form id="prompt-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <InputField
              label="Title"
              value={data.title}
              onChange={(e) => setData('title', e.target.value)}
              error={errors.title}
            />

            {/* Prompt */}
            <div>
              <label htmlFor="prompt-textarea" className="block mb-2 text-sm font-medium text-white/80">
                AI Prompt
              </label>
              <textarea
                id="prompt-textarea"
                value={data.prompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                placeholder="Use [variable_name] inside your prompt..."
                className="min-h-[120px] w-full rounded-lg border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-ai-cyan focus:outline-none resize-y"
              />
              {errors.prompt && (
                <span className="block text-sm text-red-500">{errors.prompt}</span>
              )}
            </div>

            {/* Dynamic Variables */}
            <DynamicVariableInput
              manualVars={manualVars}
              setManualVars={setManualVars}
              data={data}
              setData={setData}
            />

            {/* Category */}
            <div>
              <label htmlFor="category_id" className="block mb-2 text-sm font-medium text-white/80">
                Category
              </label>
              <Select
                id="category_id"
                options={categoryOptions}
                value={categoryOptions.find((option) => option.value === data.category_id)}
                onChange={(selectedOption) => setData('category_id', selectedOption?.value || '')}
                styles={customStyles}
                placeholder="Select a category"
                isClearable
              />
              {errors.category_id && (
                <span className="mt-1 block text-sm text-red-500">{errors.category_id}</span>
              )}
            </div>

            {/* Tags */}
            <TagSelector
              tags={tags}
              tagInput={tagInput}
              setTagInput={setTagInput}
              availableTags={availableTags}
              setTags={setTags}
              setData={setData}
              error={errors.tags}
            />
            {/* {errors.tags && (
              <span className="mt-1 block text-sm text-red-500">{errors.tags}</span>
            )} */}

            {/* Platforms */}
            <div>
              <label className="block mb-2 text-sm font-medium text-white/80">Platforms</label>
              <div className="max-h-40 overflow-y-auto rounded-lg bg-white/5 p-4 themed-scrollbar">
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => handlePlatformToggle(platform.id.toString())}
                      className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${platform.selected
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
          </form>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 p-4 border-t border-white/20">
          <button
            type="submit"
            form="prompt-form" // Link button to form
            disabled={processing}
            className="rounded-lg bg-ai-cyan px-6 py-2 text-sm font-semibold text-white hover:bg-ai-cyan/80 disabled:opacity-50 transition-colors"
          >
            {processing ? 'Adding...' : 'Add Prompt'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white/10 px-6 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
}) {
  return (
    <>
      <label htmlFor={`${label.toLowerCase()}-input`} className="block mb-2 text-sm font-medium text-white/80">
        {label}
      </label>
      <input
        id={`${label.toLowerCase()}-input`}
        type="text"
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-lg border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-ai-cyan focus:outline-none mb-2"
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
      {error && <span className="block text-sm text-red-500">{error}</span>}
      
    </>
  );
}

function TagSelector({ tags, tagInput, setTagInput, availableTags, setTags, setData, error }: any) {
  return (
    <div>
      <label htmlFor="tags-input" className="block mb-2 text-sm font-medium text-white/80">
        Tags
      </label>
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/20 bg-transparent p-3">
          {tags.map((tag: string, i: number) => (
            <div
              key={i}
              className="flex items-center gap-1 rounded bg-ai-cyan/40 px-3 py-1 text-sm text-white"
            >
              {tag}
              <button
                type="button"
                onClick={() => {
                  const updated = tags.filter((_: any, index: number) => index !== i);
                  setTags(updated);
                  setData('tags', updated);
                }}
                className="ml-1 text-white hover:text-red-400 transition-colors"
                aria-label={`Remove ${tag}`}
              >
                ✕
              </button>
            </div>
          ))}
          <input
            id="tags-input"
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
            className="flex-1 bg-transparent text-white placeholder:text-white/40 focus:outline-none min-w-[150px]"
          />
        </div>
        {error && <span className="mt-1 block text-sm text-red-500">{error}</span>}

        {tagInput && (
          <ul className="absolute z-10 mt-2 max-h-40 w-full overflow-auto rounded-lg border border-white/20 bg-black/80 shadow-lg themed-scrollbar">
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
                  className="cursor-pointer px-4 py-2 text-sm text-white hover:bg-ai-cyan/40 transition-colors"
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
      <label htmlFor="dynamic-variables-input" className="block mb-2 text-sm font-medium text-white/80">
        Dynamic Variables
      </label>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/20 bg-transparent p-3">
        {manualVars.map((v: string, i: number) => (
          <div
            key={i}
            className="flex items-center gap-1 rounded bg-ai-cyan/40 px-3 py-1 text-sm text-white"
          >
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
              className="ml-1 text-white hover:text-red-400 transition-colors"
              aria-label={`Remove ${v}`}
            >
              ✕
            </button>
          </div>
        ))}
        <input
          id="dynamic-variables-input"
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
          className="flex-1 bg-transparent text-white placeholder:text-white/40 focus:outline-none min-w-[150px]"
        />
      </div>
    </div>
  );
}