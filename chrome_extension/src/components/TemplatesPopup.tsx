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
                <div className="templates-popup-header">
                    <h2>Templates</h2>
                    <button className="templates-popup-close" onClick={onClose}>×</button>
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
                                <div
                                    key={template.id}
                                    className="template-item"
                                    onClick={() => {
                                        onSelect(template.prompt);
                                        onClose();
                                    }}
                                >
                                    <span className="template-item-title">{template.title}</span>
                                    <p className="template-item-desc">{template.description}</p>
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
