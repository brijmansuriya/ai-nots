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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadTemplates = async () => {
            try {
                setLoading(true);
                const data = await apiService.getTemplates();
                console.log('Templates data:', data);

                // Transform data if needed, or use as is
                // For now assuming data matches Template interface or close to it
                // If data is empty, we can mock some for demo if in dev mode
                if (data.length === 0) {
                    console.log('No templates found, using mock data');
                    // Fallback mock data for demonstration if API returns nothing
                    const mockTemplates: Template[] = [
                        { id: 1, title: 'Summarize Text', description: 'Create a concise summary of the provided text.', prompt: 'Please summarize the following text, capturing the main points and key arguments:' },
                        { id: 2, title: 'Code Review', description: 'Analyze code for bugs and improvements.', prompt: 'Review the following code for bugs, performance issues, and readability improvements:' },
                    ];
                    setTemplates(mockTemplates);
                } else {
                    setTemplates(data);
                }
            } catch (err) {
                setError('Failed to load templates');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadTemplates();
    }, []);

    return (
        <div className="templates-popup-overlay" onClick={onClose}>
            <div className="templates-popup" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="templates-popup-close-top" onClick={onClose}>×</button>
                <div className="templates-popup-header">
                    <div className="header-left">
                        <h2>Templates</h2>
                        <span className="refresh-status">
                            <svg className="refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
                            Refreshing...
                        </span>
                    </div>
                    <button type="button" className="new-template-btn">
                        <span className="plus-icon">+</span> New Template
                    </button>
                </div>

                <div className="templates-popup-content">
                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>Loading templates...</div>
                    ) : error ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>
                    ) : templates.length === 0 ? (
                        <div className="templates-popup-empty">No templates found</div>
                    ) : (
                        <div className="templates-list">
                            {templates.map((template) => (
                                <div key={template.id} className="template-item">
                                    <div className="template-item-info">
                                        <span className="template-item-title">{template.title}</span>
                                        <p className="template-item-desc">{template.description}</p>
                                    </div>
                                    <div className="template-item-actions">
                                        <button
                                            type="button"
                                            className="insert-template-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelect(template.prompt);
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
