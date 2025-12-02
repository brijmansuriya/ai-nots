import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, router } from '@inertiajs/react';
import axios from 'axios';
import Select from 'react-select';
import WebLayout from '@/layouts/web-layout';
import { ArrowLeft, X, Clock, Tag as TagIcon, Layers, FileText, Upload } from 'lucide-react';
import type { Tag, Platform } from '@/types';
import { VersionHistory } from '@/components/version-history';

interface EditPromptProps {
    prompt: {
        id: number;
        title: string;
        prompt: string;
        description: string | null;
        category_id: string | number | null;
        tags: { id: number; name: string }[];
        platforms: { id: number; name: string }[];
        variables?: { name: string }[];
        image_url?: string | null;
    };
}

// Reusable react-select styles outside component to avoid re-renders
const reactSelectStyles = {
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

export default function EditPrompt({ prompt }: EditPromptProps) {
    const abortRef = useRef<AbortController | null>(null);
    const platformsInitialized = useRef(false);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        title: prompt.title || '',
        prompt: prompt.prompt || '',
        description: prompt.description || '',
        category_id: String(prompt.category_id || ''),
        tags: prompt.tags.map((t) => t.name),
        platform: prompt.platforms.map((p) => p.id.toString()),
        dynamic_variables: prompt.variables?.map((v) => v.name) ?? [],
        image: null as File | null,
        remove_image: false as boolean,
        status: String(prompt.status || '0'), // 0: pending, 1: active, 2: rejected
    });

    const [imagePreview, setImagePreview] = useState<string | null>(prompt.image_url || null);
    const [meta, setMeta] = useState<{
        tags: Tag[];
        categories: { id: string; name: string }[];
        platforms: Platform[];
    }>({
        tags: [],
        categories: [],
        platforms: [],
    });

    // Update image preview when prompt changes (e.g., after validation errors)
    useEffect(() => {
        if (prompt.image_url && !imagePreview) {
            setImagePreview(prompt.image_url);
        }
    }, [prompt.image_url]);

    const [tags, setTags] = useState<string[]>(prompt.tags.map((t) => t.name));
    const [tagInput, setTagInput] = useState('');
    const [manualVars, setManualVars] = useState<string[]>(prompt.variables?.map((v) => v.name) ?? []);

    // Helper to extract variables from prompt
    const extractVars = useCallback((text: string): string[] => {
        const matches = [...text.matchAll(/\[([^\]]+)\]/g)];
        return Array.from(new Set(matches.map((m) => m[1].trim())));
    }, []);

    // Load all meta in parallel (tags, categories, platforms)
    useEffect(() => {
        abortRef.current = new AbortController();

        axios
            .get(route('meta.all'), { signal: abortRef.current.signal, timeout: 10000 })
            .then((res) => {
                const platformsData = res.data.platforms as Platform[];
                const initialPlatforms = data.platform;

                // Set platforms with selected state
                const platformsWithSelection = platformsData.map((p) => ({
                    ...p,
                    selected: initialPlatforms.includes(p.id.toString()),
                }));

                setMeta({
                    tags: res.data.tags,
                    categories: res.data.categories,
                    platforms: platformsWithSelection,
                });
            })
            .catch((err) => {
                if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
                    console.error('Failed to load meta:', err);
                }
            });

        return () => abortRef.current?.abort();
    }, []);

    // Initialize platforms selection when meta loads (only once)
    useEffect(() => {
        if (meta.platforms.length > 0 && data.platform.length > 0 && !platformsInitialized.current) {
            const updated = meta.platforms.map((p) => ({
                ...p,
                selected: data.platform.includes(p.id.toString()),
            }));
            setMeta((prev) => ({ ...prev, platforms: updated }));
            platformsInitialized.current = true;
        }
    }, [meta.platforms.length, data.platform]);

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
        if (meta.platforms.filter((p) => p.selected).length > 0 && errors.platform) {
            clearErrors('platform');
        }
    }, [data.title, data.prompt, data.category_id, tags, meta.platforms, errors]);

    // Handle prompt change + extract dynamic vars
    const onPromptChange = useCallback(
        (text: string) => {
            setData('prompt', text);
            const vars = extractVars(text);
            setManualVars(vars);
            setData('dynamic_variables', vars);
            if (errors.prompt) clearErrors('prompt');
        },
        [extractVars, setData, errors.prompt, clearErrors]
    );

    // Insert variable into prompt
    const insertVariableIntoPrompt = useCallback(
        (variable: string) => {
            const textarea = document.getElementById('prompt-textarea') as HTMLTextAreaElement;
            if (!textarea) return;

            const cursorPos = textarea.selectionStart;
            const newPrompt = `${data.prompt.slice(0, cursorPos)}[${variable}]${data.prompt.slice(cursorPos)}`;

            setData('prompt', newPrompt);
            onPromptChange(newPrompt);

            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(cursorPos + variable.length + 2, cursorPos + variable.length + 2);
            }, 0);
        },
        [data.prompt, setData, onPromptChange]
    );

    // Handle platform toggle
    const handlePlatformToggle = useCallback(
        (id: string) => {
            const updated = meta.platforms.map((p) =>
                p.id.toString() === id ? { ...p, selected: !p.selected } : p
            );
            setMeta((prev) => ({ ...prev, platforms: updated }));
            const selectedPlatforms = updated.filter((p) => p.selected).map((p) => p.id.toString());
            setData('platform', selectedPlatforms);
            if (errors.platform && selectedPlatforms.length > 0) {
                clearErrors('platform');
            }
        },
        [meta.platforms, setData, errors.platform, clearErrors]
    );

    // Image upload handler
    const onImageChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) {
                setData('image', null);
                setImagePreview(null);
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                alert('Image must be < 2MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                alert('Invalid image type');
                return;
            }

            setData('image', file);
            setData('remove_image', false);
            clearErrors('image');

            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.onerror = () => {
                alert('Failed to load image preview');
                setData('image', null);
                setImagePreview(null);
            };
            reader.readAsDataURL(file);
        },
        [setData, clearErrors]
    );

    // Remove image
    const removeImage = useCallback(() => {
        setImagePreview(null);
        setData('image', null);
        if (prompt.image_url) {
            setData('remove_image', true);
        }
    }, [setData, prompt.image_url]);

    // Submit form
    const submitForm = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            // Get current values from state and form data
            const currentTags = tags.length > 0 ? tags : (data.tags || []);
            const selectedPlatforms = meta.platforms.filter((p) => p.selected);
            const currentPlatforms = selectedPlatforms.length > 0
                ? selectedPlatforms.map((p) => p.id.toString())
                : (data.platform || []);

            // Convert category_id to integer, ensure it's valid
            let categoryId: number | string = '';
            const categoryIdValue = data.category_id || prompt.category_id;
            if (categoryIdValue && String(categoryIdValue).trim() !== '') {
                const parsed = parseInt(String(categoryIdValue), 10);
                if (!isNaN(parsed)) {
                    categoryId = parsed;
                }
            }

            // Get title and prompt from form data or prompt prop
            const formTitle = (data.title || prompt.title || '').trim();
            const formPrompt = (data.prompt || prompt.prompt || '').trim();
            const formDescription = (data.description || prompt.description || '').trim();

            // Prepare payload with current form data
            const payload: any = {
                _method: 'PUT', // Laravel method spoofing for POST request
                title: formTitle,
                prompt: formPrompt,
                description: formDescription,
                category_id: categoryId,
                tags: Array.isArray(currentTags) ? currentTags : [],
                platform: Array.isArray(currentPlatforms) ? currentPlatforms : [],
                dynamic_variables: Array.isArray(data.dynamic_variables) ? data.dynamic_variables : [],
                remove_image: data.image ? false : !imagePreview && prompt.image_url ? true : false,
                status: data.status || prompt.status || '0', // Include status
            };

            // Add image file if exists
            if (data.image) {
                payload.image = data.image;
            }

            // Debug log before submission
            console.log('Submitting form with payload:', {
                title: payload.title,
                prompt: payload.prompt,
                category_id: payload.category_id,
                tags: payload.tags,
                platform: payload.platform,
                hasImage: !!payload.image,
            });

            // Validate required fields before submission
            if (!payload.title || !payload.prompt || !categoryId || payload.tags.length === 0 || payload.platform.length === 0) {
                console.error('Validation failed: Missing required fields', payload);
                // Don't return, let backend validation handle it and show errors
            }

            post(route('prompt.update', prompt.id), {
                ...payload,
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => router.visit(route('home')),
                onError: (errors) => {
                    console.error('Form update failed:', errors);
                    console.error('Form data at error:', payload);
                },
            });
        },
        [data, tags, meta.platforms, imagePreview, prompt, post, setData]
    );

    const categoryOptions = meta.categories.map((category) => ({
        value: String(category.id),
        label: category.name,
    }));

    return (
        <WebLayout title="Edit Prompt">
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
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Edit Prompt</h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">Update your AI prompt details</p>
                            </div>
                            <VersionHistory promptId={prompt.id} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 transition-colors">
                                <form onSubmit={submitForm} className="space-y-6">
                                    {/* Title */}
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

                                    {/* Description */}
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

                                    {/* Image Upload */}
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
                                                        onClick={removeImage}
                                                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                                        aria-label="Remove image"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => document.getElementById('image-input')?.click()}
                                                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-gray-900 dark:hover:border-gray-500 transition-colors"
                                                >
                                                    <Upload className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Click to upload an image</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, WEBP or GIF (Max 2MB)</p>
                                                </div>
                                            )}
                                            <input
                                                id="image-input"
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                                onChange={onImageChange}
                                                className="hidden"
                                            />
                                        </div>
                                        {errors.image && <span className="mt-1 block text-sm text-red-500">{errors.image}</span>}
                                    </div>

                                    {/* Prompt */}
                                    <div>
                                        <label htmlFor="prompt-textarea" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            AI Prompt <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="prompt-textarea"
                                            value={data.prompt}
                                            onChange={(e) => onPromptChange(e.target.value)}
                                            placeholder="Use [variable_name] inside your prompt..."
                                            rows={8}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:outline-none resize-y font-mono"
                                        />
                                        {errors.prompt && <span className="mt-1 block text-sm text-red-500">{errors.prompt}</span>}
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
                                            value={data.category_id && categoryOptions.length > 0
                                                ? categoryOptions.find((option) => String(option.value) === String(data.category_id)) || null
                                                : null}
                                            onChange={(selectedOption) => {
                                                setData('category_id', selectedOption?.value || '');
                                                if (errors.category_id) {
                                                    clearErrors('category_id');
                                                }
                                            }}
                                            styles={reactSelectStyles}
                                            placeholder="Select a category"
                                            isClearable
                                        />
                                        {errors.category_id && <span className="mt-1 block text-sm text-red-500">{errors.category_id}</span>}
                                    </div>

                                    {/* Tags */}
                                    <TagSelector
                                        tags={tags}
                                        tagInput={tagInput}
                                        setTagInput={setTagInput}
                                        availableTags={meta.tags}
                                        setTags={setTags}
                                        setData={(field: string, value: any) => {
                                            setData(field, value);
                                            if (errors.tags && value && value.length > 0) {
                                                clearErrors('tags');
                                            }
                                        }}
                                        error={errors.tags && tags.length === 0 ? errors.tags : undefined}
                                        clearErrors={clearErrors}
                                    />

                                    {/* Platforms */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Platforms <span className="text-red-500">*</span>
                                        </label>
                                        <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {meta.platforms.map((platform) => (
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

                                    {/* Status Toggle */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Status
                                        </label>
                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="0"
                                                    checked={data.status === '0'}
                                                    onChange={(e) => {
                                                        setData('status', e.target.value);
                                                        if (errors.status) {
                                                            clearErrors('status');
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-gray-900 dark:focus:ring-white"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Pending</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="1"
                                                    checked={data.status === '1'}
                                                    onChange={(e) => {
                                                        setData('status', e.target.value);
                                                        if (errors.status) {
                                                            clearErrors('status');
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-gray-900 dark:focus:ring-white"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="2"
                                                    checked={data.status === '2'}
                                                    onChange={(e) => {
                                                        setData('status', e.target.value);
                                                        if (errors.status) {
                                                            clearErrors('status');
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-gray-900 dark:focus:ring-white"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Rejected</span>
                                            </label>
                                        </div>
                                        {errors.status && <span className="mt-1 block text-sm text-red-500">{errors.status}</span>}
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
                                            {processing ? 'Updating...' : 'Update Prompt'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Sidebar */}
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
                                            <p className="font-medium">Title</p>
                                            <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{data.title || 'No title set'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <TagIcon className="w-4 h-4 mt-0.5 text-gray-500 dark:text-gray-400" />
                                        <div>
                                            <p className="font-medium">Tags & platforms</p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {tags.length} tag{tags.length === 1 ? '' : 's'} ·{' '}
                                                {meta.platforms.filter((p) => p.selected).length} platform
                                                {meta.platforms.filter((p) => p.selected).length === 1 ? '' : 's'}
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
                                                    : 'No variables detected'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-5 sm:p-6 lg:sticky lg:top-80">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Writing tips</h2>
                                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                    <li>Be specific about the task and expected output.</li>
                                    <li>
                                        Use dynamic variables like <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-900 text-xs">[topic]</code> to reuse prompts.
                                    </li>
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
                        <div key={i} className="flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1 text-sm text-white">
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
                    <div key={i} className="flex items-center gap-1 rounded-full bg-gray-900 dark:bg-white px-3 py-1 text-sm text-white dark:text-gray-900">
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
