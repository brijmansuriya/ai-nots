import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Category } from '../services/api';
import { ThemeToggle } from './ThemeToggle';
import './TemplatesPopup.css';

interface Template {
    id: number;
    title: string;
    description: string;
    prompt: string;
    category?: string;
}

interface TemplatesPopupProps {
    onSelect: (text: string) => void;
    onClose: () => void;
    initialView?: 'list' | 'create';
}

const TemplatesPopup = ({ onSelect, onClose, initialView = 'list' }: TemplatesPopupProps) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [prompts, setPrompts] = useState<Template[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeTab, setActiveTab] = useState<'templates' | 'prompts'>('templates');
    const [isCreating, setIsCreating] = useState(initialView === 'create');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        prompt: '',
        category_id: '',
        tags: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const user = await apiService.getCurrentUser();
            setIsAuthenticated(!!user);

            const [templatesData, promptsData, categoriesData] = await Promise.all([
                apiService.getTemplates(),
                user ? apiService.getPrompts() : Promise.resolve([]),
                apiService.getCategories()
            ]);

            console.log('Templates data:', templatesData);
            console.log('Prompts data:', promptsData);

            if (templatesData.length === 0) {
                const mockTemplates: Template[] = [
                    { id: 1, title: 'Summarize Text', description: 'Create a concise summary of the provided text.', prompt: 'Please summarize the following text, capturing the main points and key arguments:' },
                    { id: 2, title: 'Code Review', description: 'Analyze code for bugs and improvements.', prompt: 'Review the following code for bugs, performance issues, and readability improvements:' },
                ];
                setTemplates(mockTemplates);
            } else {
                setTemplates(templatesData);
            }

            setPrompts(promptsData);
            setCategories(categoriesData);
        } catch (err) {
            setError('Failed to load data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = () => {
        if (!isAuthenticated) {
            window.open(apiService.getLoginUrl(), '_blank');
            return;
        }

        setIsCreating(true);
        // Don't reset everything, maybe user wants to switch context
        if (!formData.category_id && categories.length > 0) {
            setFormData(prev => ({
                ...prev,
                category_id: String(categories[0].id)
            }));
        }
    };

    const handleCancelCreate = () => {
        if (initialView === 'create') {
            onClose(); // Verify this behavior with user if needed, but logic implies if opened to create, cancel should close
        } else {
            setIsCreating(false);
            setError(null);
        }
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
                platform: ['ChatGPT'], // Default
                status: '1'
            };

            if (activeTab === 'templates') {
                await apiService.createTemplate(payload);
            } else {
                await apiService.savePrompt(payload);
            }

            // Success
            setIsCreating(false);
            if (initialView === 'create') {
                onClose();
            } else {
                loadData(); // Reload list
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create');
        } finally {
            setSubmitting(false);
        }
    };

    const currentData = activeTab === 'templates' ? templates : prompts;

    return (
        <div className="templates-popup-overlay" onClick={onClose}>
            <div className="templates-popup" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="templates-popup-close-top" onClick={onClose}>×</button>

                <div className="templates-popup-header">
                    <div className="header-left">
                        <div className="templates-tabs">
                            <h2
                                className={activeTab === 'templates' ? 'active' : ''}
                                onClick={() => setActiveTab('templates')}
                            >
                                {isCreating ? 'New Template' : 'Templates'}
                            </h2>
                            <h2
                                className={activeTab === 'prompts' ? 'active' : ''}
                                onClick={() => setActiveTab('prompts')}
                            >
                                {isCreating ? 'New Prompt' : 'Prompts'}
                            </h2>
                        </div>

                        {!isCreating && (
                            <span className="refresh-status" onClick={loadData}>
                                <svg className="refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
                                {loading ? 'Refreshing...' : 'Refresh'}
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <ThemeToggle />
                        {!isCreating && (
                            <button type="button" className="new-template-btn" onClick={handleCreate}>
                                <span className="plus-icon">+</span> New {activeTab === 'templates' ? 'Template' : 'Prompt'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="templates-popup-content">
                    {loading && !isCreating ? (
                        <div className="loading-container">Loading...</div>
                    ) : error ? (
                        <div className="error-container">{error}</div>
                    ) : isCreating ? (
                        <form className="create-template-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Code Reviewer"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    placeholder="Short description..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Prompt Content</label>
                                <textarea
                                    required
                                    placeholder="Enter the prompt text here..."
                                    value={formData.prompt}
                                    onChange={e => setFormData({ ...formData, prompt: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={formData.category_id}
                                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tags (comma separated)</label>
                                <input
                                    type="text"
                                    placeholder="coding, review, bugfix"
                                    value={formData.tags}
                                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={handleCancelCreate} disabled={submitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn" disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Save ' + (activeTab === 'templates' ? 'Template' : 'Prompt')}
                                </button>
                            </div>
                        </form>
                    ) : activeTab === 'prompts' && !isAuthenticated ? (
                        <div className="templates-popup-empty">
                            <p>Login required to see your personal prompts</p>
                            <button
                                className="login-prompt-btn"
                                onClick={() => window.open(apiService.getLoginUrl(), '_blank')}
                            >
                                Login to AI Notes
                            </button>
                        </div>
                    ) : currentData.length === 0 ? (
                        <div className="templates-popup-empty">No {activeTab} found</div>
                    ) : (
                        <div className="templates-list">
                            {currentData.map((item) => (
                                <div key={item.id} className="template-item">
                                    <div className="template-item-info">
                                        <span className="template-item-title">{item.title}</span>
                                        <p className="template-item-desc">{item.description}</p>
                                    </div>
                                    <div className="template-item-actions">
                                        <button
                                            type="button"
                                            className="insert-template-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelect(item.prompt);
                                                // Small delay to ensure insertion logic runs before popup is unmounted
                                                setTimeout(() => onClose(), 50);
                                            }}
                                        >
                                            Insert
                                        </button>
                                        {/* <button type="button" className="template-menu-btn">···</button> */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TemplatesPopup;
