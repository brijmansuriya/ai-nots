import { useState, useEffect, useRef, useMemo } from 'react';
import Fuse from 'fuse.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { TokenCounter } from './TokenCounter';


import './TemplatesPopup.css';

interface Template {
    id: number;
    title: string;
    description: string;
    prompt: string;
    category_id: number;
    category?: { id: number; name: string };
    tags?: Array<{ id: number; name: string }>;
    platforms?: Array<{ id: number; name: string }>;
    folder_id?: number | null;
}

interface TemplatesPopupProps {
    onSelect: (text: string) => void;
    onClose: () => void;
    initialMode?: 'create' | 'list';
    initialPromptText?: string;
    initialTab?: 'templates' | 'prompts' | 'folders';
}

const Icons = {
    FileText: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
    ),
    MessageSquare: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    ),
    Refresh: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
    ),
    Search: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
    ),
    Heart: ({ filled }: { filled?: boolean }) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
    ),
    Copy: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
    ),
    Plus: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7v14" /></svg>
    ),
    Filter: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
    ),
    Check: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    ),
    History: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    ),
    Folder: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
    ),
    ChevronRight: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
    ),
    ChevronDown: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
    ),
    MoreVertical: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
    ),
    Trash: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
    ),
    Edit: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
    ),
    X: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    ),
};

interface Folder {
    id: number;
    name: string;
    emoji?: string;
    color?: string;
    parent_id?: number;
    prompts_count: number;
    children?: Folder[];
}

const TemplatesPopup = ({ onSelect, onClose, initialMode = 'list', initialPromptText = '', initialTab = 'templates' }: TemplatesPopupProps) => {
    const queryClient = useQueryClient();

    // Queries
    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['user'],
        queryFn: () => apiService.getCurrentUser(),
    });

    const isAuthenticated = !!user;

    const { data: templates = [], isLoading: templatesLoading } = useQuery({
        queryKey: ['templates'],
        queryFn: () => apiService.getTemplates(),
    });

    const { data: categories = [], isLoading: categoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => apiService.getCategories(),
    });

    const { data: tags = [], isLoading: tagsLoading } = useQuery({
        queryKey: ['tags'],
        queryFn: () => apiService.getTags(),
    });

    const { data: prompts = [], isLoading: promptsLoading } = useQuery({
        queryKey: ['prompts'],
        queryFn: () => apiService.getPrompts(),
        enabled: isAuthenticated,
    });

    const { data: folders = [], isLoading: foldersLoading } = useQuery({
        queryKey: ['folders'],
        queryFn: () => apiService.getFolders(),
        enabled: isAuthenticated,
    });

    const { data: platforms = [] } = useQuery({
        queryKey: ['platforms'],
        queryFn: () => apiService.getPlatforms(),
    });


    const [activeTab, setActiveTab] = useState<'templates' | 'prompts' | 'folders'>(initialTab);
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<number[]>([]);

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [showRecentlyUsed, setShowRecentlyUsed] = useState(false);

    // Filter Panel State
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [tempCategory, setTempCategory] = useState<number | null>(null);
    const [tempTags, setTempTags] = useState<number[]>([]);
    const [tempFavs, setTempFavs] = useState(false);
    const [tempRecent, setTempRecent] = useState(false);

    // Persistence State
    const [favorites, setFavorites] = useState<number[]>([]);
    const [recentIds, setRecentIds] = useState<number[]>([]);

    // Form / Modal State
    const [isCreating, setIsCreating] = useState(initialMode === 'create');
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        prompt: string;
        category_id: string;
        tags: string[];
        platform: string[];
    }>({
        title: '',
        description: '',
        prompt: '',
        category_id: '',
        tags: ['ai', 'prompts'],
        platform: ['ChatGPT'],
    });

    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [folderFormData, setFolderFormData] = useState<{ id?: number; name: string; parent_id: string; color: string }>({
        name: '',
        parent_id: '',
        color: '#3b82f6'
    });

    const [contextMenu, setContextMenu] = useState<{ id: number; x: number; y: number; type: 'folder' | 'prompt' } | null>(null);

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Mutations
    const logoutMutation = useMutation({
        mutationFn: () => apiService.logout(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            queryClient.setQueryData(['prompts'], []);
            setShowLogoutConfirm(false);
        }
    });

    // 1. Initial Load: Restore persistent state (favorites/recents/filters) once on mount
    useEffect(() => {
        chrome.storage.local.get(['fav_prompts', 'recent_prompts', 'last_filters'], (result: any) => {
            if (result.fav_prompts) setFavorites(result.fav_prompts as number[]);
            if (result.recent_prompts) setRecentIds(result.recent_prompts as number[]);
            if (result.last_filters) {
                const filters = result.last_filters;
                if (filters.category !== undefined) setSelectedCategory(filters.category);
                if (filters.tags) setSelectedTags(filters.tags);
            }
        });
    }, []);

    // 2. Auth Sync: Invalidate queries on storage change (api_token/user)
    useEffect(() => {
        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.api_token || changes.user) {
                console.log('🔵 [TemplatesPopup] Auth state sync: refreshing queries...');
                queryClient.invalidateQueries();
            }
        };
        chrome.storage.onChanged.addListener(handleStorageChange);
        return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }, [queryClient]);

    // 3. Message Listener: Handle specific auth events
    useEffect(() => {
        const handleMessage = (message: any) => {
            if (message.type === 'AUTH_SUCCESS' || message.type === 'AUTH_LOGOUT') {
                queryClient.invalidateQueries();
            }
        };
        chrome.runtime.onMessage.addListener(handleMessage);
        return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }, [queryClient]);

    // 4. Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }

            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                setActiveTab('prompts');
                resetForm();
                setIsCreating(true);
            }
            if (e.ctrlKey && e.shiftKey && e.key === 'N') {
                e.preventDefault();
                handleNewFolder();
            }
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'F2' && selectedFolderId) {
                e.preventDefault();
                const folder = folders.find(f => f.id === selectedFolderId);
                if (folder) handleEditFolder(folder);
            }
            if (e.key === 'Delete' && selectedFolderId) {
                e.preventDefault();
                if (window.confirm('Are you sure you want to delete this folder?')) {
                    handleDeleteFolder(selectedFolderId);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [folders, selectedFolderId]);

    // Global click to close context menu
    useEffect(() => {
        const h = () => setContextMenu(null);
        window.addEventListener('click', h);
        return () => window.removeEventListener('click', h);
    }, []);

    const loading = templatesLoading || categoriesLoading || tagsLoading || (isAuthenticated && promptsLoading) || (isAuthenticated && foldersLoading) || userLoading;

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Initialize form when creating or when initialPromptText changes
    useEffect(() => {
        if ((initialMode === 'create' || isCreating) && categories.length > 0) {
            const isGemini = window.location.hostname.includes('gemini.google.com');
            const defaultPlatform = isGemini ? 'Gemini' : 'ChatGPT';

            if (initialPromptText && !formData.prompt) {
                setFormData(prev => ({
                    ...prev,
                    prompt: initialPromptText,
                    title: initialPromptText.trim().slice(0, 50).replace(/\n/g, ' ') || 'Untitled Prompt',
                    category_id: prev.category_id || String(categories[0].id),
                    platform: [defaultPlatform],
                    tags: ['ai', 'prompts']
                }));
            } else if (!formData.category_id) {
                setFormData(prev => ({
                    ...prev,
                    category_id: String(categories[0].id),
                    platform: [defaultPlatform],
                    tags: ['ai', 'prompts']
                }));
            }
        }
    }, [isCreating, categories, initialPromptText, initialMode]);

    // Optimize Folder Search: Pre-calculate folder -> prompts map
    const folderPromptsMap = useMemo(() => {
        const map: Record<number, Template[]> = {};
        prompts.forEach(p => {
            if (p.folder_id) {
                if (!map[p.folder_id]) map[p.folder_id] = [];
                map[p.folder_id].push(p);
            }
        });
        return map;
    }, [prompts]);

    // Selection Logic: Filtering + Fuzzy Search
    const filteredData = useMemo(() => {
        let baseList = activeTab === 'templates' ? templates : prompts;

        // Apply Category Filter (Single-select)
        if (selectedCategory !== null) {
            baseList = baseList.filter(item => item.category_id === selectedCategory);
        }

        // Apply Folder Filter
        if (selectedFolderId !== null) {
            baseList = baseList.filter(item => (item as any).folder_id === selectedFolderId);
        }

        // Apply Tag Filter (Match ALL selected tags - AND logic)
        if (selectedTags.length > 0) {
            baseList = baseList.filter(item =>
                selectedTags.every(tagId => (item.tags || []).some((tag: any) => tag.id === tagId))
            );
        }

        // Apply Favorites Filter
        if (showFavoritesOnly) {
            baseList = baseList.filter(item => favorites.includes(item.id));
        }

        // Apply Recently Used Filter
        if (showRecentlyUsed) {
            baseList = baseList.filter(item => recentIds.includes(item.id))
                .sort((a, b) => recentIds.indexOf(b.id) - recentIds.indexOf(a.id));
        }

        // Apply Fuzzy Search (Using debounced query)
        if (debouncedSearchQuery.trim()) {
            const fuse = new Fuse(baseList, {
                keys: ['title', 'prompt', 'category.name', 'tags.name'],
                threshold: 0.4,
                distance: 100,
                ignoreLocation: true
            });
            return fuse.search(debouncedSearchQuery).map(result => result.item);
        }

        return baseList;
    }, [templates, prompts, activeTab, selectedCategory, selectedTags, showFavoritesOnly, showRecentlyUsed, favorites, recentIds, debouncedSearchQuery]);

    // Persist filters when they change
    useEffect(() => {
        chrome.storage.local.set({
            last_filters: {
                category: selectedCategory,
                tags: selectedTags
            }
        });
    }, [selectedCategory, selectedTags]);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (selectedCategory !== null) count++;
        count += selectedTags.length;
        if (showFavoritesOnly) count++;
        if (showRecentlyUsed) count++;
        return count;
    }, [selectedCategory, selectedTags, showFavoritesOnly, showRecentlyUsed]);

    const openFilterPanel = () => {
        console.log('Opening Filter Panel');
        setTempCategory(selectedCategory);
        setTempTags([...selectedTags]);
        setTempFavs(showFavoritesOnly);
        setTempRecent(showRecentlyUsed);
        setIsFilterPanelOpen(true);
    };

    const applyFilters = () => {
        console.log('Applying Filters');
        setSelectedCategory(tempCategory);
        console.log('tempTags::::::002', tempTags);
        setSelectedTags(tempTags);
        setShowFavoritesOnly(tempFavs);
        setShowRecentlyUsed(tempRecent);
        setIsFilterPanelOpen(false);
    };

    const clearAllFilters = () => {
        setTempCategory(null);
        setTempTags([]);
        setTempFavs(false);
        setTempRecent(false);
    };

    const toggleFavorite = (id: number) => {
        const newFavs = favorites.includes(id)
            ? favorites.filter(f => f !== id)
            : [...favorites, id];
        setFavorites(newFavs);
        chrome.storage.local.set({ fav_prompts: newFavs });
    };

    const handleSelect = (item: Template) => {
        // Track recent
        const newRecents = [item.id, ...recentIds.filter(id => id !== item.id)].slice(0, 20);
        setRecentIds(newRecents);
        chrome.storage.local.set({ recent_prompts: newRecents });
        onSelect(item.prompt);
        setTimeout(() => onClose(), 100);
    };

    const resetForm = () => {
        const isGemini = window.location.hostname.includes('gemini.google.com');
        const defaultPlatform = isGemini ? 'Gemini' : 'ChatGPT';

        setFormData({
            title: '',
            description: '',
            prompt: '',
            category_id: categories.length > 0 ? String(categories[0].id) : '',
            tags: ['ai', 'prompts'],
            platform: [defaultPlatform],
        });
        setIsCreating(false);
        setIsEditing(false);
        setEditingId(null);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const payload: any = {
                title: formData.title,
                description: formData.description,
                prompt: formData.prompt,
                category_id: Number(formData.category_id),
                tags: formData.tags,
                platform: formData.platform,
                status: '1',
                folder_id: null,
            };

            if (isEditing && editingId) {
                await apiService.updatePrompt(editingId, payload);
            } else if (activeTab === 'templates') {
                await apiService.createTemplate(payload);
            } else {
                await apiService.savePrompt(payload);
            }
            queryClient.invalidateQueries();
            resetForm();
        } catch (err: any) {
            setError(err.message || 'Failed to save');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = () => {
        logoutMutation.mutate();
    };

    const truncateWords = (text: string, count: number) => {
        const words = text.split(/\s+/);
        if (words.length <= count) return text;
        return words.slice(0, count).join(' ') + '...';
    };

    const renderFolders = (foldersList: Folder[], level = 0): any[] => {
        const query = searchQuery.trim().toLowerCase();

        // Helper to check if folder matches or has matching descendants (recursive)
        const matchesQuery = (folder: Folder): boolean => {
            if (!query) return true;
            // Folder name matches
            if (folder.name.toLowerCase().includes(query)) return true;

            // Check if any prompt in this folder matches (Title, Description, or Content)
            const folderPrompts = folderPromptsMap[folder.id] || [];
            const hasMatchingPrompt = folderPrompts.some(p =>
                p.title.toLowerCase().includes(query) ||
                (p.description && p.description.toLowerCase().includes(query)) ||
                p.prompt.toLowerCase().includes(query)
            );
            if (hasMatchingPrompt) return true;

            // Check children recursively
            return !!(folder.children && folder.children.some(child => matchesQuery(child)));
        };

        const filteredFolders = foldersList.filter(matchesQuery);

        if (level === 0 && query && filteredFolders.length === 0) {
            return [<div key="no-matches" className="empty-state"><p>No folders match your search.</p></div>];
        }

        return filteredFolders.map(folder => {
            const hasChildren = folder.children && folder.children.length > 0;
            const isExpanded = expandedFolders.includes(folder.id) || (query && (
                folder.children?.some(matchesQuery) ||
                (folderPromptsMap[folder.id] || []).some(p =>
                    p.title.toLowerCase().includes(query) ||
                    (p.description && p.description.toLowerCase().includes(query)) ||
                    p.prompt.toLowerCase().includes(query)
                )
            ));

            // Find prompts in this folder using pre-indexed map
            const folderPrompts = folderPromptsMap[folder.id] || [];
            const filteredPrompts = query
                ? folderPrompts.filter(p =>
                    p.title.toLowerCase().includes(query) ||
                    (p.description && p.description.toLowerCase().includes(query)) ||
                    p.prompt.toLowerCase().includes(query)
                )
                : folderPrompts;

            return (
                <div key={folder.id} className={`folder-item-wrapper ${isExpanded ? 'is-expanded' : ''}`} style={{ '--level': level } as any}>
                    <div
                        className={`folder-item ${selectedFolderId === folder.id ? 'active' : ''}`}
                        style={{ paddingLeft: `${level * 16 + 12}px` }}
                        onClick={() => {
                            if (selectedFolderId === folder.id) {
                                // Toggle expansion if already selected
                                setExpandedFolders(prev =>
                                    prev.includes(folder.id) ? prev.filter(f => f !== folder.id) : [...prev, folder.id]
                                );
                            } else {
                                setSelectedFolderId(folder.id);
                                if (!expandedFolders.includes(folder.id)) {
                                    setExpandedFolders(prev => [...prev, folder.id]);
                                }
                            }
                        }}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            setContextMenu({ id: folder.id, x: e.clientX, y: e.clientY, type: 'folder' });
                        }}
                    >
                        <div className="folder-item-left">
                            <button
                                className={`expand-btn ${hasChildren || filteredPrompts.length > 0 ? '' : 'invisible'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedFolders(prev =>
                                        prev.includes(folder.id) ? prev.filter(f => f !== folder.id) : [...prev, folder.id]
                                    );
                                }}
                            >
                                {isExpanded ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                            </button>
                            <span className="folder-color-indicator" style={{ backgroundColor: folder.color || '#3b82f6' }}></span>
                            <span className="folder-name">{folder.name}</span>
                        </div>
                        <div className="folder-item-right" onClick={(e) => e.stopPropagation()}>
                            <button
                                className="kebab-btn"
                                onClick={(e) => {
                                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                                    setContextMenu({ id: folder.id, x: rect.left, y: rect.bottom, type: 'folder' });
                                }}
                            >
                                <Icons.MoreVertical />
                            </button>
                        </div>
                    </div>
                    {isExpanded && (
                        <div className="folder-content-body">
                            {hasChildren && (
                                <div className="folder-children">
                                    {renderFolders(folder.children!, level + 1)}
                                </div>
                            )}
                            {filteredPrompts.length > 0 && (
                                <div className="folder-prompts-list">
                                    {filteredPrompts.map(p => (
                                        <div
                                            key={p.id}
                                            className="inline-prompt-item"
                                            style={{ paddingLeft: `${(level + 1) * 16 + 12}px` }}
                                        >
                                            <div className="inline-prompt-content" onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelect(p);
                                            }}>
                                                <div className="inline-prompt-header">
                                                    <Icons.MessageSquare />
                                                    <span className="inline-prompt-title">{p.title}</span>
                                                </div>
                                                <p className="inline-prompt-preview">
                                                    {p.prompt.length > 80 ? p.prompt.substring(0, 80) + '...' : p.prompt}
                                                </p>
                                            </div>
                                            <div className="inline-prompt-actions">
                                                <button className="inline-action-btn insert" title="Insert Into Chat" onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelect(p);
                                                }}>
                                                    Insert
                                                </button>
                                                <button className="inline-action-btn delete" title="Delete Prompt" onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeletePrompt(p.id);
                                                }}>
                                                    <Icons.Trash />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        });
    };

    const handleNewFolder = (parentId?: number) => {
        setFolderFormData({
            name: '',
            parent_id: parentId?.toString() || '',
            color: '#3b82f6'
        });
        setIsCreatingFolder(true);
    };

    const handleEditFolder = (folder: Folder) => {
        setFolderFormData({
            id: folder.id,
            name: folder.name,
            parent_id: folder.parent_id?.toString() || '',
            color: folder.color || '#3b82f6'
        });
        setIsCreatingFolder(true);
    };

    const handleDeleteFolder = async (id: number) => {
        try {
            await apiService.deleteFolder(id);
            queryClient.invalidateQueries({ queryKey: ['folders'] });
            if (selectedFolderId === id) setSelectedFolderId(null);
        } catch (err: any) {
            setError(err.message || 'Failed to delete folder');
        }
    };

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const payload = {
                name: folderFormData.name,
                parent_id: folderFormData.parent_id ? Number(folderFormData.parent_id) : null,
                color: folderFormData.color,
            };

            if (folderFormData.id) {
                await apiService.updateFolder(folderFormData.id, payload);
            } else {
                await apiService.createFolder(payload);
            }

            await queryClient.refetchQueries({ queryKey: ['folders'] });
            await queryClient.refetchQueries({ queryKey: ['prompts'] });
            setIsCreatingFolder(false);
        } catch (err: any) {
            setError(err.message || 'Failed to sync folder');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePrompt = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this prompt?')) return;
        try {
            await apiService.deletePrompt(id);
            // Optimistic update or refetch
            queryClient.invalidateQueries({ queryKey: ['prompts'] });
            // If in search, maybe clear or wait for invalidation
        } catch (err: any) {
            setError(err.message || 'Failed to delete prompt');
        }
    };

    const handleSimilarPrompts = (item: Template) => {
        // Clear search query first
        if (searchQuery) setSearchQuery('');

        // Use tags if available
        if (item.tags && item.tags.length > 0) {
            const tagIds = item.tags.map(t => (t as any).id);
            // Only update if tags are different to prevent flickering
            const currentTagIds = selectedTags;
            const isSame = tagIds.length === currentTagIds.length && tagIds.every(id => currentTagIds.includes(id));

            if (!isSame) {
                setSelectedTags(tagIds);
                setTempTags(tagIds);
            }
        } else if (item.category_id) {
            // Fallback to category if no tags
            if (selectedCategory !== item.category_id) {
                setSelectedCategory(item.category_id);
                setTempCategory(item.category_id);
            }
        }

        // Close filter panel if it was open to avoid confusion
        setIsFilterPanelOpen(false);
    };

    const findFolderName = (folderId?: number | null) => {
        if (!folderId) return null;
        const findInFolders = (list: Folder[]): string | null => {
            for (const f of list) {
                if (f.id === folderId) return f.name;
                if (f.children) {
                    const found = findInFolders(f.children);
                    if (found) return found;
                }
            }
            return null;
        };
        return findInFolders(folders);
    };

    const renderFolderOptions = (foldersList: Folder[], level = 0): any[] => {
        const options: any[] = [];
        foldersList.forEach(folder => {
            options.push(
                <option key={folder.id} value={folder.id}>
                    {'\u00A0'.repeat(level * 4)}{folder.emoji || '📁'} {folder.name}
                </option>
            );
            if (folder.children && folder.children.length > 0) {
                options.push(...renderFolderOptions(folder.children, level + 1));
            }
        });
        return options;
    };

    return (
        <div className="templates-popup-overlay" onClick={onClose}>
            <div className="templates-popup" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="templates-popup-header">
                    <div className="header-top-row">
                        <div className="templates-tabs">
                            <div className={`tab-item ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => { setActiveTab('templates'); setSelectedFolderId(null); }}>
                                <Icons.FileText />
                                <h2>Templates</h2>
                            </div>
                            <div className={`tab-item ${activeTab === 'prompts' ? 'active' : ''}`} onClick={() => { setActiveTab('prompts'); setSelectedFolderId(null); }}>
                                <Icons.MessageSquare />
                                <h2>My Prompts</h2>
                            </div>
                            <div className={`tab-item ${activeTab === 'folders' ? 'active' : ''}`} onClick={() => setActiveTab('folders')}>
                                <Icons.Folder />
                                <h2>Folders</h2>
                            </div>
                        </div>
                        <div className="header-actions">
                            <button className="refresh-btn" onClick={() => queryClient.invalidateQueries()} title="Refresh">
                                <Icons.Refresh />
                            </button>

                            {/* Header Auth Section */}
                            {isAuthenticated ? (
                                <div className="user-profile-header">
                                    <div className="user-avatar" title={user.name}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="user-name-abbr">{user.name.split(' ')[0]}</span>
                                </div>
                            ) : (
                                <button className="header-login-btn" onClick={async () => {
                                    const url = await apiService.getLoginUrl();
                                    window.open(url, '_blank');
                                }}>
                                    Login
                                </button>
                            )}

                            <button className="close-btn" onClick={onClose} title="Close Popup">
                                <Icons.X />
                            </button>
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="search-filter-container">
                        <div className="search-wrapper">
                            <Icons.Search />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder={activeTab === 'folders' ? "Search folders..." : "Search title, content... (Press /)"}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button className="clear-search" onClick={() => setSearchQuery('')}>×</button>
                            )}
                        </div>
                        <button
                            className={`filter-toggle-btn ${activeFiltersCount > 0 ? 'active' : ''}`}
                            onClick={openFilterPanel}
                        >
                            <Icons.Filter />
                            <span className="btn-label">Filter</span>
                            {activeFiltersCount > 0 && (
                                <span className="filter-badge">{activeFiltersCount}</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Modern Filter Panel */}
                <div className={`filter-panel-wrapper ${isFilterPanelOpen ? 'open' : ''}`}>
                    <div className="filter-panel-overlay" onClick={() => applyFilters()}></div>
                    <div className="filter-panel">
                        <div className="panel-scroll-content">
                            {/* Categories Section */}
                            <div className="panel-section">
                                <div className="section-header">
                                    <span className="section-label">Category</span>
                                    {tempCategory !== null && (
                                        <button className="section-clear" onClick={() => setTempCategory(null)}>Reset</button>
                                    )}
                                </div>
                                <div className="chip-grid">
                                    <button
                                        className={`panel-chip ${tempCategory === null ? 'active' : ''}`}
                                        onClick={() => setTempCategory(null)}
                                    >
                                        All Categories
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            className={`panel-chip ${tempCategory === cat.id ? 'active' : ''}`}
                                            onClick={() => setTempCategory(cat.id)}
                                        >
                                            {cat.name}
                                            {tempCategory === cat.id && <Icons.Check />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tags Section */}
                            {tags.length > 0 && (
                                <div className="panel-section">
                                    <div className="section-header">
                                        <span className="section-label">Tags</span>
                                        {tempTags.length > 0 && (
                                            <button className="section-clear" onClick={() => setTempTags([])}>Clear</button>
                                        )}
                                    </div>
                                    <div className="chip-grid">
                                        {tags.map(tag => (
                                            <button
                                                key={tag.id}
                                                className={`panel-chip ${tempTags.includes(tag.id) ? 'active' : ''}`}
                                                onClick={() => {
                                                    setTempTags(prev =>
                                                        prev.includes(tag.id) ? prev.filter(t => t !== tag.id) : [...prev, tag.id]
                                                    );
                                                }}
                                            >
                                                {tag.name}
                                                {tempTags.includes(tag.id) && <Icons.Check />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick Filters */}
                            <div className="panel-section">
                                <div className="section-header">
                                    <span className="section-label">Quick Filters</span>
                                </div>
                                <div className="toggle-grid">
                                    <button
                                        className={`toggle-item ${tempFavs ? 'active' : ''}`}
                                        onClick={() => setTempFavs(!tempFavs)}
                                    >
                                        <Icons.Heart filled={tempFavs} />
                                        <span>Favorites</span>
                                    </button>
                                    <button
                                        className={`toggle-item ${tempRecent ? 'active' : ''}`}
                                        onClick={() => setTempRecent(!tempRecent)}
                                    >
                                        <Icons.History />
                                        <span>Recently Used</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Panel Footer */}
                        <div className="panel-footer">
                            <button className="footer-btn secondary" onClick={clearAllFilters}>
                                Clear All
                            </button>
                            <button className="footer-btn primary" onClick={applyFilters}>
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Context Menu */}
                {contextMenu && (
                    <div
                        className="custom-context-menu"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={() => {
                            const folder = folders.find(f => f.id === contextMenu.id);
                            if (folder) handleEditFolder(folder);
                            setContextMenu(null);
                        }}>
                            <Icons.Edit /> Rename
                        </button>
                        <button onClick={() => {
                            handleNewFolder(contextMenu.id);
                            setContextMenu(null);
                        }}>
                            <Icons.Plus /> New Subfolder
                        </button>
                        <div className="menu-divider" />
                        <button className="danger" onClick={() => {
                            if (window.confirm('Delete this folder?')) {
                                handleDeleteFolder(contextMenu.id);
                            }
                            setContextMenu(null);
                        }}>
                            <Icons.Trash /> Delete
                        </button>
                    </div>
                )}

                {/* Main Content */}
                <div className="templates-popup-content">
                    {loading && !(isCreating || isEditing) ? (
                        <div className="loader-box">
                            <div className="spinner"></div>
                            <p>Loading templates...</p>
                        </div>
                    ) : error ? (
                        <div className="error-box">{error}</div>
                    ) : (activeTab === 'prompts' || activeTab === 'folders') && !isAuthenticated ? (
                        <div className="auth-required">
                            <div className="auth-icon-placeholder">🔐</div>
                            <h3>Authentication Required</h3>
                            <p>Log in to access and sync {activeTab === 'prompts' ? 'your personal prompt library' : 'your folder structure'}.</p>
                            <button className="login-primary-btn" onClick={async () => {
                                const url = await apiService.getLoginUrl();
                                window.open(url, '_blank');
                            }}>
                                Login with AI Notes
                            </button>
                        </div>
                    ) : activeTab === 'folders' ? (
                        <div className="folder-container">
                            {folders.length === 0 ? (
                                <div className="empty-state">
                                    <p>No folders found. Create folders from the website.</p>
                                </div>
                            ) : (
                                <div className="folder-list">
                                    {renderFolders(folders)}
                                </div>
                            )}
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="empty-state">
                            <p>No matches found for your criteria.</p>
                            <button className="reset-filters-btn" onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory(null);
                                console.log('reset filters 004');
                                setSelectedTags([]);
                                setShowFavoritesOnly(false);
                                setShowRecentlyUsed(false);
                            }}>Clear all filters</button>
                        </div>
                    ) : (
                        <div className="template-grid">
                            {filteredData.map(item => (
                                <div key={item.id} className="modern-card" onClick={() => handleSelect(item)}>
                                    <div className="card-header">
                                        <div className="card-badges-column">
                                            <span className="item-badge category">{item.category?.name || 'Uncategorized'}</span>
                                            {item.folder_id && (
                                                <span className="item-badge folder">
                                                    <Icons.Folder />
                                                    {findFolderName(item.folder_id)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="card-actions-float">
                                            <button
                                                className="action-btn similar"
                                                title="Find Similar"
                                                onClick={(e) => { e.stopPropagation(); handleSimilarPrompts(item); }}
                                            >
                                                <Icons.Search />
                                                <span>Similar</span>
                                            </button>
                                            <button className="action-btn insert" onClick={(e) => { e.stopPropagation(); handleSelect(item); }} title="Insert into ChatGPT">
                                                <Icons.Plus />
                                                <span>Insert</span>
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="card-title" title={item.title}>{item.title}</h4>
                                    <p className="card-preview">{truncateWords(item.prompt, 100)}</p>

                                    <div className="card-footer-actions">
                                        <div className="card-tags">
                                            {(item.tags || []).map((tag: any) => (
                                                <span key={tag.id} className="tag-chip mini">{tag.name}</span>
                                            ))}
                                        </div>
                                        <div className="card-footer-btns">
                                            <button
                                                className={`action-btn fav ${favorites.includes(item.id) ? 'active' : ''}`}
                                                onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                                                title={favorites.includes(item.id) ? "Remove from Favorites" : "Add to Favorites"}
                                            >
                                                <Icons.Heart filled={favorites.includes(item.id)} />
                                            </button>
                                            {activeTab === 'prompts' && (
                                                <button className="action-btn delete" onClick={(e) => { e.stopPropagation(); handleDeletePrompt(item.id); }} title="Delete Prompt">
                                                    <Icons.Trash />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="templates-popup-footer">
                    <button
                        className="f-btn secondary"
                        onClick={() => { setActiveTab('templates'); resetForm(); setIsCreating(true); }}
                        disabled={!isAuthenticated}
                        title={!isAuthenticated ? "Login required to create templates" : ""}
                    >
                        + New Template
                    </button>
                    <button
                        className="f-btn secondary"
                        onClick={() => handleNewFolder()}
                        disabled={!isAuthenticated}
                        title={!isAuthenticated ? "Login required to create folders" : ""}
                    >
                        + New Folder
                    </button>
                    <button
                        className="f-btn primary"
                        onClick={() => { setActiveTab('prompts'); resetForm(); setIsCreating(true); }}
                        disabled={!isAuthenticated}
                        title={!isAuthenticated ? "Login required to create prompts" : ""}
                    >
                        + New Prompt
                    </button>
                    {isAuthenticated && (
                        <button className="f-btn ghost" onClick={() => setShowLogoutConfirm(true)}>Logout</button>
                    )}
                </div>

                {/* Modals */}
                {(isCreating || isEditing) && (
                    <div className="modal-overlay-layer">
                        <div className="modal-panel">
                            <div className="modal-header">
                                <h3>{isEditing ? 'Edit' : 'Create'} {activeTab === 'templates' ? 'Template' : 'Prompt'}</h3>
                                <button className="m-close" onClick={resetForm}>×</button>
                            </div>
                            <form className="m-form" onSubmit={handleSubmit}>
                                <div className="m-field">
                                    <label>Title</label>
                                    <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Give it a name..." />
                                </div>
                                <div className="m-field">
                                    <label>Prompt</label>
                                    <textarea required value={formData.prompt} onChange={e => setFormData({ ...formData, prompt: e.target.value })} placeholder="AI instructions go here..." />

                                    <TokenCounter
                                        text={formData.prompt}
                                        selectedPlatformIds={formData.platform}
                                        platforms={platforms}
                                    />
                                </div>
                                <div className="m-field">
                                    <label>Category</label>
                                    <select required value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="m-footer">
                                    <button type="button" className="f-btn ghost" onClick={resetForm}>Cancel</button>
                                    <button type="submit" className="f-btn primary" disabled={submitting}>
                                        {submitting ? 'Saving...' : 'Save Draft'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isCreatingFolder && (
                    <div className="modal-overlay-layer">
                        <div className="modal-panel">
                            <div className="modal-header">
                                <h3>{folderFormData.id ? 'Edit Folder' : 'Create New Folder'}</h3>
                                <button className="m-close" onClick={() => setIsCreatingFolder(false)}>×</button>
                            </div>
                            <form className="m-form" onSubmit={handleCreateFolder}>
                                <div className="m-field">
                                    <label>Folder Name</label>
                                    <input required value={folderFormData.name} onChange={e => setFolderFormData({ ...folderFormData, name: e.target.value })} placeholder="Enter folder name..." />
                                </div>
                                <div className="m-field">
                                    <label>Parent Folder (Optional)</label>
                                    <select value={folderFormData.parent_id} onChange={e => setFolderFormData({ ...folderFormData, parent_id: e.target.value })}>
                                        <option value="">Root Level</option>
                                        {renderFolderOptions(folders)}
                                    </select>
                                </div>
                                <div className="m-footer">
                                    <button type="button" className="f-btn ghost" onClick={() => setIsCreatingFolder(false)}>Cancel</button>
                                    <button type="submit" className="f-btn primary" disabled={submitting}>
                                        {submitting ? 'Creating...' : 'Create Folder'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showLogoutConfirm && (
                    <div className="modal-overlay-layer">
                        <div className="modal-panel mini">
                            <h3>Logout</h3>
                            <p>Are you sure you want to sign out?</p>
                            <div className="m-footer">
                                <button className="f-btn ghost" onClick={() => setShowLogoutConfirm(false)}>Stay</button>
                                <button className="f-btn danger" onClick={handleLogout}>Logout</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default TemplatesPopup;
