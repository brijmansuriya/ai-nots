import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
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
}

const TemplatesPopup = ({ onSelect, onClose }: TemplatesPopupProps) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [prompts, setPrompts] = useState<Template[]>([]);
    const [activeTab, setActiveTab] = useState<'templates' | 'prompts'>('templates');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const user = await apiService.getCurrentUser();
            setIsAuthenticated(!!user);

            const [templatesData, promptsData] = await Promise.all([
                apiService.getTemplates(),
                user ? apiService.getPrompts() : Promise.resolve([])
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
                                Templates
                            </h2>
                            <h2
                                className={activeTab === 'prompts' ? 'active' : ''}
                                onClick={() => setActiveTab('prompts')}
                            >
                                Prompts
                            </h2>
                        </div>
                        <span className="refresh-status" onClick={loadData}>
                            <svg className="refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </span>
                    </div>
                    <button type="button" className="new-template-btn">
                        <span className="plus-icon">+</span> New {activeTab === 'templates' ? 'Template' : 'Prompt'}
                    </button>
                </div>

                <div className="templates-popup-content">
                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>Loading templates...</div>
                    ) : error ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>
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
                                        <button type="button" className="template-menu-btn">···</button>
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
