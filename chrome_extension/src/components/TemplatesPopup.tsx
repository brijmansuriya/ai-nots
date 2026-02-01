import { useState, useEffect, useRef, useMemo } from 'react';
import Fuse from 'fuse.js';
import { apiService } from '../services/api';
import type { Category, Tag } from '../services/api';
import { ThemeToggle } from './ThemeToggle';
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
}

interface TemplatesPopupProps {
    onSelect: (text: string) => void;
    onClose: () => void;
    initialView?: 'list' | 'create';
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
    )
};

const TemplatesPopup = ({ onSelect, onClose }: TemplatesPopupProps) => {
    // Core Data State
    const [templates, setTemplates] = useState<Template[]>([]);
    const [prompts, setPrompts] = useState<Template[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [activeTab, setActiveTab] = useState<'templates' | 'prompts'>('templates');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState('');
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
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        prompt: '',
        category_id: '',
        tags: '',
    });

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Load initial data and persisted state
    const loadData = async () => {
        try {
            setLoading(true);
            const userData = await apiService.getCurrentUser();
            setIsAuthenticated(!!userData);

            const [templatesRes, categoriesRes, tagsRes] = await Promise.all([
                apiService.getTemplates(),
                apiService.getCategories(),
                apiService.getTags()
            ]);

            setTemplates(templatesRes || []);
            setCategories(categoriesRes || []);
            setTags(tagsRes || []);

            if (userData) {
                const promptsRes = await apiService.getPrompts();
                setPrompts(promptsRes || []);
            }

            // Load from storage
            chrome.storage.local.get(['fav_prompts', 'recent_prompts', 'last_filters'], (result: any) => {
                if (result.fav_prompts) setFavorites(result.fav_prompts as number[]);
                if (result.recent_prompts) setRecentIds(result.recent_prompts as number[]);
                if (result.last_filters) {
                    const filters = result.last_filters;
                    setSelectedCategory(filters.category || null);
                    setSelectedTags(filters.tags || []);
                }
            });

        } catch (err) {
            setError('Failed to load data. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();

        // Listen for external auth changes
        const handleMessage = (message: any) => {
            if (message.type === 'AUTH_SUCCESS' || message.type === 'AUTH_LOGOUT') loadData();
        };
        chrome.runtime.onMessage.addListener(handleMessage);

        // Keyboard Shortcut: '/' to focus search
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Selection Logic: Filtering + Fuzzy Search
    const filteredData = useMemo(() => {
        let baseList = activeTab === 'templates' ? templates : prompts;

        // Apply Category Filter (Single-select)
        if (selectedCategory !== null) {
            baseList = baseList.filter(item => item.category_id === selectedCategory);
        }

        // Apply Tag Filter (Match ALL selected tags - AND logic)
        if (selectedTags.length > 0) {
            baseList = baseList.filter(item =>
                selectedTags.every(tagId => item.tags?.some(tag => tag.id === tagId))
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

        // Apply Fuzzy Search
        if (searchQuery.trim()) {
            const fuse = new Fuse(baseList, {
                keys: ['title', 'prompt', 'category.name', 'tags.name'],
                threshold: 0.4,
                distance: 100,
                ignoreLocation: true
            });
            return fuse.search(searchQuery).map(result => result.item);
        }

        return baseList;
    }, [templates, prompts, activeTab, selectedCategory, selectedTags, showFavoritesOnly, showRecentlyUsed, favorites, recentIds, searchQuery]);

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

    const handleCopy = (e: React.MouseEvent, text: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        // Simple visual feedback could go here
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            prompt: '',
            category_id: categories.length > 0 ? String(categories[0].id) : '',
            tags: '',
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
            const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
            const payload = {
                title: formData.title,
                description: formData.description,
                prompt: formData.prompt,
                category_id: Number(formData.category_id),
                tags: tagsArray,
                platform: ['ChatGPT'],
                status: '1'
            };

            if (isEditing && editingId) {
                await apiService.updatePrompt(editingId, payload);
            } else if (activeTab === 'templates') {
                await apiService.createTemplate(payload);
            } else {
                await apiService.savePrompt(payload);
            }
            resetForm();
            loadData();
        } catch (err: any) {
            setError(err.message || 'Failed to save');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = async () => {
        try {
            setLoading(true);
            await apiService.logout();
            setIsAuthenticated(false);
            setPrompts([]);
            setShowLogoutConfirm(false);
            loadData();
        } catch (err) {
            console.error('Logout failed', err);
        } finally {
            setLoading(false);
        }
    };

    const truncateWords = (text: string, count: number) => {
        const words = text.split(/\s+/);
        if (words.length <= count) return text;
        return words.slice(0, count).join(' ') + '...';
    };

    return (
        <div className="templates-popup-overlay" onClick={onClose}>
            <div className="templates-popup" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="templates-popup-header">
                    <div className="header-top-row">
                        <div className="templates-tabs">
                            <div className={`tab-item ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
                                <Icons.FileText />
                                <h2>Templates</h2>
                            </div>
                            <div className={`tab-item ${activeTab === 'prompts' ? 'active' : ''}`} onClick={() => setActiveTab('prompts')}>
                                <Icons.MessageSquare />
                                <h2>My Prompts</h2>
                            </div>
                        </div>
                        <div className="header-actions">
                            <ThemeToggle />
                            <button className="refresh-btn" onClick={loadData} title="Refresh">
                                <Icons.Refresh />
                            </button>
                            <button className="close-btn" onClick={onClose}>×</button>
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="search-filter-container">
                        <div className="search-wrapper">
                            <Icons.Search />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search title, content... (Press /)"
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

                {/* Main Content */}
                <div className="templates-popup-content">
                    {loading && !(isCreating || isEditing) ? (
                        <div className="loader-box">
                            <div className="spinner"></div>
                            <p>Loading templates...</p>
                        </div>
                    ) : error ? (
                        <div className="error-box">{error}</div>
                    ) : activeTab === 'prompts' && !isAuthenticated ? (
                        <div className="auth-required">
                            <div className="auth-icon-placeholder">🔐</div>
                            <h3>Authentication Required</h3>
                            <p>Log in to access and sync your personal prompt library.</p>
                            <button className="login-primary-btn" onClick={() => window.open(apiService.getLoginUrl(), '_blank')}>
                                Login with AI Notes
                            </button>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="empty-state">
                            <p>No matches found for your criteria.</p>
                            <button className="reset-filters-btn" onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory(null);
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
                                        <div className="card-title-group">
                                            <span className="card-label">{item.category?.name || 'Uncategorized'}</span>
                                            <h4 className="card-title">{item.title}</h4>
                                        </div>
                                        <div className="card-actions-float">
                                            <button
                                                className={`action-btn fav ${favorites.includes(item.id) ? 'active' : ''}`}
                                                onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                                            >
                                                <Icons.Heart filled={favorites.includes(item.id)} />
                                            </button>
                                            <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleSelect(item); }} title="Insert into ChatGPT">
                                                <Icons.Plus />
                                            </button>
                                            <button className="action-btn" onClick={(e) => handleCopy(e, item.prompt)} title="Copy to clipboard">
                                                <Icons.Copy />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="card-preview">{truncateWords(item.prompt, 100)}</p>
                                    <div className="card-tags">
                                        {(item.tags || []).map(tag => (
                                            <span key={tag.id} className="tag-chip mini">{tag.name}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="templates-popup-footer">
                    <button className="f-btn secondary" onClick={() => { setActiveTab('templates'); resetForm(); setIsCreating(true); }}>
                        + New Template
                    </button>
                    <button className="f-btn primary" onClick={() => { setActiveTab('prompts'); resetForm(); setIsCreating(true); }}>
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
                                </div>
                                <div className="m-field">
                                    <label>Category</label>
                                    <select required value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="m-field">
                                    <label>Tags (Comma separated)</label>
                                    <input value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} placeholder="writing, seo, coding..." />
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
        </div>
    );
};

export default TemplatesPopup;
