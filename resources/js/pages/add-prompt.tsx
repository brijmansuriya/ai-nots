import { useState, useEffect, useRef } from 'react';
import { useForm, router } from '@inertiajs/react';
import axios from 'axios';
import Select from 'react-select';
import WebLayout from '@/layouts/web-layout';
import { ArrowLeft, X, Clock, Tag as TagIcon, Layers, FileText, Image as ImageIcon, Upload } from 'lucide-react';
import type { Tag, Platform } from '@/types';

export default function AddPrompt() {
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [manualVars, setManualVars] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [draftCreatedAt] = useState<string>(() => new Date().toISOString());
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dataLoadedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { data, setData, post, processing, errors, clearErrors } = useForm({
    title: '',
    prompt: '',
    description: '',
    tags: [] as string[],
    platform: [] as string[],
    category_id: '',
    dynamic_variables: [] as string[],
    image: null as File | null,
    status: '0' as string, // Default to pending (0: pending, 1: active, 2: rejected)
  });

  // Load API data (tags, platforms, categories) - only once on mount
  useEffect(() => {
    if (dataLoadedRef.current) {
      return;
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const loadTags = async () => {
      try {
        const res = await axios.get(route('tags'), { signal, timeout: 10000 });
        setAvailableTags(res.data.tags);
      } catch (error: any) {
        if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
          console.error('Failed to load tags:', error);
        }
      }
    };

    const loadPlatforms = async () => {
      try {
        const res = await axios.get(route('platform'), { signal, timeout: 10000 });
        const all = res.data.platforms as Platform[];
        setPlatforms(all);
      } catch (error: any) {
        if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
          console.error('Failed to load platforms:', error);
        }
      }
    };

    const loadCategories = async () => {
      try {
        const res = await axios.get(route('categories'), { signal, timeout: 10000 });
        setCategories(res.data.categories);
      } catch (error: any) {
        if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
          console.error('Failed to load categories:', error);
        }
      }
    };

    Promise.all([loadTags(), loadPlatforms(), loadCategories()]).then(() => {
      dataLoadedRef.current = true;
    });

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Clear errors when form fields have valid data
  useEffect(() => {
    if (data.title && data.title.trim() && errors.title) {
      clearErrors('title');
    }
    if (data.prompt && data.prompt.trim() && errors.prompt) {
      clearErrors('prompt');
    }
    if (data.category_id && errors.category_id) {
      clearErrors('category_id');
    }
    if (tags.length > 0 && errors.tags) {
      clearErrors('tags');
    }
    if (platforms.filter((p) => p.selected).length > 0 && errors.platform) {
      clearErrors('platform');
    }
  }, [data.title, data.prompt, data.category_id, tags, platforms, errors]);

  const extractDynamicVariables = (promptText: string): string[] => {
    const matches = [...promptText.matchAll(/\[([^\]]+)\]/g)];
    return Array.from(new Set(matches.map((m) => m[1].trim())));
  };

  const handlePromptChange = (text: string) => {
    setData('prompt', text);
    if (errors.prompt && text.trim()) {
      clearErrors('prompt');
    }
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
    const selectedPlatforms = updated.filter((p) => p.selected).map((p) => p.id.toString());
    setData('platform', selectedPlatforms);
    if (errors.platform && selectedPlatforms.length > 0) {
      clearErrors('platform');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setData('image', null);
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setData('image', null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WEBP, or GIF)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setData('image', null);
      return;
    }

    // Set the image file
    setData('image', file);
    clearErrors('image');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.onerror = () => {
      alert('Failed to load image preview');
      setData('image', null);
      setImagePreview(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setData('image', null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare all form data
    const selectedPlatforms = platforms.filter((p) => p.selected).map((p) => p.id.toString());

    // Sync all fields - ensure image is preserved
    setData('tags', tags);
    setData('platform', selectedPlatforms);
    setData('title', data.title?.trim() || '');
    setData('prompt', data.prompt?.trim() || '');
    setData('description', data.description?.trim() || '');
    setData('category_id', data.category_id ? String(data.category_id) : '');
    setData('status', data.status || '0'); // Ensure status is set
    // Image should already be set, but ensure it's included
    if (data.image instanceof File) {
      setData('image', data.image);
    }

    // Debug: Log form data before submission
    console.log('Submitting form with image:', data.image ? 'Yes' : 'No', data.image);

    // Submit using Inertia.js post method
    post(route('prompt.store'), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        router.visit(route('home'));
      },
      onError: (errors) => {
        console.error('Form submission failed:', errors);
      },
    });
  };

  const categoryOptions = categories.map((category) => ({
    value: String(category.id),
    label: category.name,
  }));

  const customStyles = {
    control: (provided: any, state: any) => {
      const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
      return {
        ...provided,
        backgroundColor: isDark ? '#020617' : '#ffffff',
        borderColor: state.isFocused
          ? isDark ? '#e5e7eb' : '#111827'
          : isDark ? '#1f2937' : '#d1d5db',
        color: isDark ? '#f9fafb' : '#111827',
        borderRadius: '0.5rem',
        padding: '0.25rem',
        boxShadow: 'none',
        '&:hover': {
          borderColor: isDark ? '#e5e7eb' : '#111827',
        },
      };
    },
    menu: (provided: any) => {
      const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
      return {
        ...provided,
        backgroundColor: isDark ? '#020617' : '#ffffff',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        color: isDark ? '#f9fafb' : '#111827',
        border: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}`,
      };
    },
    option: (provided: any, state: any) => {
      const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
      return {
        ...provided,
        backgroundColor: state.isFocused
          ? isDark ? '#111827' : '#f3f4f6'
          : 'transparent',
        color: isDark ? '#f9fafb' : '#111827',
        padding: '0.5rem',
        cursor: 'pointer',
      };
    },
    singleValue: (provided: any) => {
      const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
      return {
        ...provided,
        color: isDark ? '#f9fafb' : '#111827',
      };
    },
    placeholder: (provided: any) => {
      const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
      return {
        ...provided,
        color: isDark ? '#6b7280' : '#9ca3af',
      };
    },
    input: (provided: any) => {
      const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
      return {
        ...provided,
        color: isDark ? '#f9fafb' : '#111827',
      };
    },
  };

  return (
    <WebLayout title="Add New Prompt">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <button
              onClick={() => router.visit(route('home'))}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Add New Prompt
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create and share your AI prompt with the community
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 transition-colors">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="title-input" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title-input"
                      type="text"
                      value={data.title}
                      onChange={(e) => {
                        setData('title', e.target.value);
                        if (errors.title && e.target.value.trim()) {
                          clearErrors('title');
                        }
                      }}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:outline-none"
                      placeholder="Enter a descriptive title..."
                    />
                    {errors.title && <span className="mt-1 block text-sm text-red-500">{errors.title}</span>}
                  </div>

                  <div>
                    <label htmlFor="description-input" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      id="description-input"
                      value={data.description}
                      onChange={(e) => {
                        setData('description', e.target.value);
                        if (errors.description) {
                          clearErrors('description');
                        }
                      }}
                      placeholder="Brief description of what this prompt does..."
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:outline-none resize-y"
                    />
                    {errors.description && <span className="mt-1 block text-sm text-red-500">{errors.description}</span>}
                  </div>

                  <div>
                    <label htmlFor="image-input" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Image <span className="text-gray-500 text-xs">(Optional)</span>
                    </label>
                    <div className="space-y-3">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-700"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                            aria-label="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-gray-900 dark:hover:border-gray-500 transition-colors"
                        >
                          <Upload className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Click to upload an image
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            PNG, JPG, WEBP or GIF (Max 2MB)
                          </p>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        id="image-input"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                    {errors.image && <span className="mt-1 block text-sm text-red-500">{errors.image}</span>}
                  </div>

                  <div>
                    <label htmlFor="prompt-textarea" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      AI Prompt <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        id="prompt-textarea"
                        value={data.prompt}
                        onChange={(e) => handlePromptChange(e.target.value)}
                        placeholder="Use [variable_name] inside your prompt..."
                        rows={8}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 pb-8 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:outline-none resize-y font-mono"
                      />
                      <div className={`absolute bottom-3 right-3 text-[10px] font-medium transition-colors ${data.prompt.length > 10000
                        ? 'text-red-500'
                        : 'text-gray-400 dark:text-gray-500'
                        }`}>
                        {data.prompt.length.toLocaleString()} / 10,000
                      </div>
                    </div>
                    {errors.prompt && <span className="mt-1 block text-sm text-red-500">{errors.prompt}</span>}
                  </div>

                  <DynamicVariableInput
                    manualVars={manualVars}
                    setManualVars={setManualVars}
                    data={data}
                    setData={setData}
                    insertVariableIntoPrompt={insertVariableIntoPrompt}
                  />

                  <div>
                    <label htmlFor="category_id" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="category_id"
                      options={categoryOptions}
                      value={data.category_id && categoryOptions.length > 0
                        ? categoryOptions.find((option) => String(option.value) === String(data.category_id)) || null
                        : null}
                      onChange={(selectedOption) => {
                        setData('category_id', selectedOption?.value || '');
                        if (errors.category_id) {
                          clearErrors('category_id');
                        }
                      }}
                      styles={customStyles}
                      placeholder="Select a category"
                      isClearable
                    />
                    {errors.category_id && <span className="mt-1 block text-sm text-red-500">{errors.category_id}</span>}
                  </div>

                  <TagSelector
                    tags={tags}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                    availableTags={availableTags}
                    setTags={setTags}
                    setData={(field: string, value: any) => {
                      (setData as any)(field, value);
                      if (errors.tags && value && value.length > 0) {
                        clearErrors('tags');
                      }
                    }}
                    error={errors.tags && tags.length === 0 ? errors.tags : undefined}
                    clearErrors={clearErrors}
                  />

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Platforms <span className="text-red-500">*</span>
                    </label>
                    <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {platforms.map((platform) => (
                          <button
                            key={platform.id}
                            type="button"
                            onClick={() => handlePlatformToggle(platform.id.toString())}
                            className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${platform.selected
                              ? 'bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-200 text-white dark:text-gray-900 shadow-md'
                              : 'bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-800 hover:border-gray-900 dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-900'
                              }`}
                          >
                            {platform.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    {errors.platform && <span className="mt-1 block text-sm text-red-500">{errors.platform}</span>}
                  </div>

                  {/* Visibility toggle (is_public) */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="status"
                          value="1"
                          checked={data.status === '1'}
                          onChange={(e) => setData('status', e.target.value)}
                          className="w-4 h-4 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-gray-900 dark:focus:ring-white"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Public</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="status"
                          value="0"
                          checked={data.status === '0'}
                          onChange={(e) => setData('status', e.target.value)}
                          className="w-4 h-4 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-gray-900 dark:focus:ring-white"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Private</span>
                      </label>
                    </div>
                    {errors.status && <span className="mt-1 block text-sm text-red-500">{errors.status}</span>}
                  </div>

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

            <div className="space-y-6 lg:space-y-8">
              <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-5 sm:p-6 lg:sticky lg:top-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  Prompt Snapshot
                </h2>
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-0.5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-medium">Draft title</p>
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                        {data.title || 'Start by giving your prompt a clear, descriptive title.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-0.5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-medium">Draft started</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {new Date(draftCreatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <TagIcon className="w-4 h-4 mt-0.5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-medium">Tags & platforms</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {tags.length} tag{tags.length === 1 ? '' : 's'} ·{' '}
                        {platforms.filter((p) => p.selected).length} platform
                        {platforms.filter((p) => p.selected).length === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Layers className="w-4 h-4 mt-0.5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-medium">Dynamic variables</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {manualVars.length
                          ? `${manualVars.length} variable${manualVars.length === 1 ? '' : 's'} detected`
                          : 'Use [variable_name] to add dynamic values to your prompt.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-5 sm:p-6 lg:sticky lg:top-80">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Writing tips
                </h2>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>Be specific about the task and expected output.</li>
                  <li>Use dynamic variables like <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-900 text-xs">[topic]</code> to reuse prompts.</li>
                  <li>Add tags and platforms so others can discover your prompt easily.</li>
                  <li>Keep the title short but descriptive.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WebLayout>
  );
}

function TagSelector({ tags, tagInput, setTagInput, availableTags, setTags, setData, error, clearErrors }: any) {
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
