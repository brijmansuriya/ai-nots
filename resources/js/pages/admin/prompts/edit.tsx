import { useState, useEffect, useRef } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import Select from 'react-select';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { X, Upload } from 'lucide-react';
import type { Tag, Platform } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Templates',
        href: '/admin/prompts',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

export default function EditPrompt() {
    const { prompt, tags: availableTagsProp, platforms: platformsProp, categories: categoriesProp } = usePage().props as any;
    const [tags, setTags] = useState<string[]>(prompt.tags?.map((t: any) => t.name) || []);
    const [availableTags, setAvailableTags] = useState<Tag[]>(availableTagsProp || []);
    const [manualVars, setManualVars] = useState<string[]>(prompt.variables?.map((v: any) => v.name) || []);
    const [tagInput, setTagInput] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(prompt.image_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize platforms and categories from props
    const selectedPlatformIds = prompt.platforms?.map((p: any) => p.id.toString()) || [];
    const [platforms, setPlatforms] = useState<Platform[]>(
        (platformsProp || []).map((p: Platform) => ({
            ...p,
            selected: selectedPlatformIds.includes(p.id.toString()),
        }))
    );
    const [categories, setCategories] = useState<{ id: string; name: string }[]>(categoriesProp || []);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        title: prompt.title || '',
        prompt: prompt.prompt || '',
        description: prompt.description || '',
        tags: prompt.tags?.map((t: any) => t.name) || [],
        platform: prompt.platforms?.map((p: any) => p.id.toString()) || [],
        category_id: String(prompt.category_id || ''),
        dynamic_variables: prompt.variables?.map((v: any) => v.name) || [],
        image: null as File | null,
        remove_image: false,
        status: String(prompt.status || '0'),
    });

    // Initialize from props if available, otherwise try API (fallback)
    useEffect(() => {
        if (availableTagsProp && availableTagsProp.length > 0) {
            setAvailableTags(availableTagsProp);
        }
        
        if (platformsProp && platformsProp.length > 0) {
            const selectedIds = prompt.platforms?.map((p: any) => p.id.toString()) || [];
            setPlatforms(platformsProp.map((p: Platform) => ({
                ...p,
                selected: selectedIds.includes(p.id.toString()),
            })));
        }
        
        if (categoriesProp && categoriesProp.length > 0) {
            setCategories(categoriesProp);
        }
    }, [availableTagsProp, platformsProp, categoriesProp, prompt.platforms]);

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
        const updated = (platforms || []).map((p) =>
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

        if (file.size > 2 * 1024 * 1024) {
            alert('Image size must be less than 2MB');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setData('image', null);
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('Please upload a valid image file');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setData('image', null);
            return;
        }

        setData('image', file);
        setData('remove_image', false);
        clearErrors('image');

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setData('image', null);
        setData('remove_image', true);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const selectedPlatforms = (platforms || []).filter((p) => p.selected).map((p) => p.id.toString());

        setData('tags', tags);
        setData('platform', selectedPlatforms);
        setData('title', data.title?.trim() || '');
        setData('prompt', data.prompt?.trim() || '');
        setData('description', data.description?.trim() || '');
        setData('category_id', data.category_id ? String(data.category_id) : '');
        setData('status', data.status || '0');

        post(route('admin.prompts.update', prompt.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                router.visit(route('admin.prompts.index'));
            },
        });
    };

    const categoryOptions = (categories || []).map((category) => ({
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
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Template" />
            <div className="flex items-center justify-between mb-4 px-4 pt-4">
                <h1 className="text-2xl font-bold text-foreground">Edit Template</h1>
            </div>

            <form onSubmit={handleSubmit} className="px-4 py-4 space-y-6">
                <div>
                    <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                    <input
                        id="title"
                        type="text"
                        value={data.title}
                        onChange={(e) => {
                            setData('title', e.target.value);
                            if (errors.title && e.target.value.trim()) {
                                clearErrors('title');
                            }
                        }}
                        placeholder="Enter template title"
                        disabled={processing}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:outline-none"
                    />
                    <InputError message={errors.title} className="mt-2" />
                </div>

                <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => {
                            setData('description', e.target.value);
                            if (errors.description) {
                                clearErrors('description');
                            }
                        }}
                        placeholder="Brief description..."
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:outline-none resize-y"
                        disabled={processing}
                    />
                    <InputError message={errors.description} className="mt-2" />
                </div>

                <div>
                    <Label htmlFor="image-input">Image</Label>
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
                                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-gray-900 dark:hover:border-gray-500"
                            >
                                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload</p>
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
                    <InputError message={errors.image} className="mt-2" />
                </div>

                <div>
                    <Label htmlFor="prompt-textarea">AI Prompt <span className="text-red-500">*</span></Label>
                    <textarea
                        id="prompt-textarea"
                        value={data.prompt}
                        onChange={(e) => handlePromptChange(e.target.value)}
                        placeholder="Use [variable_name] inside your prompt..."
                        rows={8}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:outline-none resize-y font-mono"
                        disabled={processing}
                    />
                    <InputError message={errors.prompt} className="mt-2" />
                </div>

                <DynamicVariableInput
                    manualVars={manualVars}
                    setManualVars={setManualVars}
                    data={data}
                    setData={setData}
                    insertVariableIntoPrompt={insertVariableIntoPrompt}
                />

                <div>
                    <Label htmlFor="category_id">Category <span className="text-red-500">*</span></Label>
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
                    <InputError message={errors.category_id} className="mt-2" />
                </div>

                <TagSelector
                    tags={tags}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                    availableTags={availableTags}
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

                <div>
                    <Label>Platforms <span className="text-red-500">*</span></Label>
                    <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {(platforms || []).map((platform) => (
                                <button
                                    key={platform.id}
                                    type="button"
                                    onClick={() => handlePlatformToggle(platform.id.toString())}
                                    className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${platform.selected
                                        ? 'bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-200 text-white dark:text-gray-900'
                                        : 'bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-800 hover:border-gray-900 dark:hover:border-white'
                                        }`}
                                    disabled={processing}
                                >
                                    {platform.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <InputError message={errors.platform} className="mt-2" />
                </div>

                <div>
                    <Label className="mb-2 block text-foreground">Status</Label>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="status"
                                value="0"
                                checked={data.status === '0'}
                                onChange={(e) => setData('status', e.target.value)}
                                disabled={processing}
                                className="text-foreground"
                            />
                            <span className="text-foreground">Pending</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="status"
                                value="1"
                                checked={data.status === '1'}
                                onChange={(e) => setData('status', e.target.value)}
                                disabled={processing}
                                className="text-foreground"
                            />
                            <span className="text-foreground">Active</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="status"
                                value="2"
                                checked={data.status === '2'}
                                onChange={(e) => setData('status', e.target.value)}
                                disabled={processing}
                                className="text-foreground"
                            />
                            <span className="text-foreground">Rejected</span>
                        </label>
                    </div>
                    <InputError message={errors.status} className="mt-2" />
                </div>

                <div className="flex gap-2">
                    <Button type="submit" disabled={processing}>Update Template</Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.visit(route('admin.prompts.index'))}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}

function TagSelector({ tags, tagInput, setTagInput, availableTags, setTags, setData, error, clearErrors }: any) {
    return (
        <div>
            <Label htmlFor="tags-input">Tags <span className="text-red-500">*</span></Label>
            <div className="relative">
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 min-h-[48px]">
                    {tags.map((tag: string, i: number) => (
                        <div
                            key={i}
                            className="flex items-center gap-1 rounded-full bg-gray-900 dark:bg-white px-3 py-1 text-sm text-white dark:text-gray-900"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => {
                                    const updated = tags.filter((_: any, index: number) => index !== i);
                                    setTags(updated);
                                    setData('tags', updated);
                                    if (error && updated.length > 0) {
                                        clearErrors('tags');
                                    }
                                }}
                                className="ml-1 text-white dark:text-gray-900 hover:text-gray-300 dark:hover:text-gray-700"
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
                            if (e.key === 'Enter' && tagInput.trim()) {
                                e.preventDefault();
                                if (!tags.includes(tagInput.trim())) {
                                    const updated = [...tags, tagInput.trim()];
                                    setTags(updated);
                                    setData('tags', updated);
                                    setTagInput('');
                                    if (error) {
                                        clearErrors('tags');
                                    }
                                }
                            }
                        }}
                        placeholder="Type and press Enter"
                        className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none min-w-[150px] text-sm"
                    />
                </div>
                {availableTags.length > 0 && (
                    <ul className="mt-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950 p-2">
                        {availableTags
                            .filter((tag: Tag) => tag.name.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(tag.name))
                            .map((tag: Tag) => (
                                <li
                                    key={tag.id}
                                    onClick={() => {
                                        if (!tags.includes(tag.name)) {
                                            const updated = [...tags, tag.name];
                                            setTags(updated);
                                            setData('tags', updated);
                                            setTagInput('');
                                            if (error) {
                                                clearErrors('tags');
                                            }
                                        }
                                    }}
                                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer rounded text-sm"
                                >
                                    {tag.name}
                                </li>
                            ))}
                    </ul>
                )}
            </div>
            {error && <InputError message={error} className="mt-2" />}
        </div>
    );
}

function DynamicVariableInput({ manualVars, setManualVars, data, setData, insertVariableIntoPrompt }: any) {
    return (
        <div>
            <Label htmlFor="dynamic-variables-input">Dynamic Variables</Label>
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
                            className="ml-1 text-white dark:text-gray-900 hover:text-gray-300 dark:hover:text-gray-700"
                        >
                            <X className="w-3 h-3" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertVariableIntoPrompt(v)}
                            className="ml-1 text-white dark:text-gray-900 hover:text-gray-300 dark:hover:text-gray-700 text-xs"
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


