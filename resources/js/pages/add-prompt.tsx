import { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import axios from 'axios';
import Select from 'react-select';
import WebLayout from '@/layouts/web-layout';
import { ArrowLeft, X } from 'lucide-react';

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

export default function AddPrompt() {
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [manualVars, setManualVars] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const { data, setData, post, processing, errors } = useForm({
    title: '',
    prompt: '',
    description: '',
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
      setCategories(res.data.categories);
    });
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
        router.visit(route('home'));
      },
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
      backgroundColor: 'white',
      borderColor: '#d1d5db',
      color: '#111827',
      borderRadius: '0.5rem',
      padding: '0.25rem',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#111827',
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      color: '#111827',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#f3f4f6' : 'transparent',
      color: '#111827',
      padding: '0.5rem',
      cursor: 'pointer',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#111827',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#9ca3af',
    }),
    input: (provided: any) => ({
      ...provided,
      color: '#111827',
    }),
  };

  return (
    <WebLayout title="Add New Prompt">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.visit(route('home'))}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Add New Prompt</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Create and share your AI prompt with the community</p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 transition-colors">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title-input" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title-input"
                  type="text"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:outline-none"
                  placeholder="Enter a descriptive title..."
                />
                {errors.title && (
                  <span className="mt-1 block text-sm text-red-500">{errors.title}</span>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description-input" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  id="description-input"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Brief description of what this prompt does..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:outline-none resize-y"
                />
                {errors.description && (
                  <span className="mt-1 block text-sm text-red-500">{errors.description}</span>
                )}
              </div>

              {/* Prompt */}
              <div>
                <label htmlFor="prompt-textarea" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  AI Prompt <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="prompt-textarea"
                  value={data.prompt}
                  onChange={(e) => handlePromptChange(e.target.value)}
                  placeholder="Use [variable_name] inside your prompt..."
                  rows={8}
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:outline-none resize-y font-mono"
                />
                {errors.prompt && (
                  <span className="mt-1 block text-sm text-red-500">{errors.prompt}</span>
                )}
              </div>

              {/* Dynamic Variables */}
              <DynamicVariableInput
                manualVars={manualVars}
                setManualVars={setManualVars}
                data={data}
                setData={setData}
                insertVariableIntoPrompt={insertVariableIntoPrompt}
              />

              {/* Category */}
              <div>
                <label htmlFor="category_id" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category <span className="text-red-500">*</span>
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

              {/* Platforms */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Platforms <span className="text-red-500">*</span></label>
                <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {platforms.map((platform) => (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => handlePlatformToggle(platform.id.toString())}
                        className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                          platform.selected
                            ? 'bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-200 text-white dark:text-gray-900 shadow-md'
                            : 'bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-800 hover:border-gray-900 dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-900'
                        }`}
                      >
                        {platform.name}
                      </button>
                    ))}
                  </div>
                </div>
                {errors.platform && (
                  <span className="mt-1 block text-sm text-red-500">{errors.platform}</span>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => router.visit(route('home'))}
                  className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-200 text-white dark:text-gray-900 font-medium hover:from-black dark:hover:from-gray-100 hover:to-gray-900 dark:hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  {processing ? 'Adding...' : 'Add Prompt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </WebLayout>
  );
}

function TagSelector({ tags, tagInput, setTagInput, availableTags, setTags, setData, error }: any) {
  return (
    <div>
      <label htmlFor="tags-input" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Tags <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 min-h-[48px]">
          {tags.map((tag: string, i: number) => (
            <div
              key={i}
              className="flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1 text-sm text-white"
            >
              {tag}
              <button
                type="button"
                onClick={() => {
                  const updated = tags.filter((_: any, index: number) => index !== i);
                  setTags(updated);
                  setData('tags', updated);
                }}
                className="ml-1 text-gray-300 hover:text-white transition-colors"
                aria-label={`Remove ${tag}`}
              >
                <X className="w-3 h-3" />
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
            placeholder="Type to add tags..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none min-w-[150px] text-sm"
          />
        </div>
        {error && <span className="mt-1 block text-sm text-red-500">{error}</span>}

        {tagInput && (
          <ul className="absolute z-10 mt-2 max-h-40 w-full overflow-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg">
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
                  className="cursor-pointer px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
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

function DynamicVariableInput({ manualVars, setManualVars, data, setData, insertVariableIntoPrompt }: any) {
  return (
    <div>
      <label htmlFor="dynamic-variables-input" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Dynamic Variables
      </label>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 min-h-[48px]">
        {manualVars.map((v: string, i: number) => (
          <div
            key={i}
            className="flex items-center gap-1 rounded-full bg-gray-900 dark:bg-white px-3 py-1 text-sm text-white dark:text-gray-900"
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
              className="ml-1 text-white dark:text-gray-900 hover:text-gray-300 dark:hover:text-gray-700 transition-colors"
              aria-label={`Remove ${v}`}
            >
              <X className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => insertVariableIntoPrompt(v)}
              className="ml-1 text-white dark:text-gray-900 hover:text-gray-300 dark:hover:text-gray-700 transition-colors text-xs"
              title="Insert into prompt"
            >
              Insert
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
          placeholder="Type variable name and press Enter"
          className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none min-w-[150px] text-sm"
        />
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Variables detected from your prompt (wrapped in [brackets]) or add manually
      </p>
    </div>
  );
}

