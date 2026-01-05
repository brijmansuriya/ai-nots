import { useState, useEffect } from 'react';
import { debug } from '../utils/debug';
import './BottomBar.css';

const BottomBar = () => {
    const [searchValue, setSearchValue] = useState('');
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        debug.render('BottomBar');
        debug.info('BottomBar component mounted', 'BottomBar', {
            containerExists: !!document.getElementById('ai-notes-bottom-bar-root'),
            bodyExists: !!document.body,
        });

        if (!chrome.runtime?.id) return;

        // Load visibility state from storage
        chrome.storage.local.get(['bottomBarVisible'], (result: { [key: string]: any }) => {
            if (chrome.runtime.lastError) return;
            const visible = result.bottomBarVisible !== false; // Default to true
            setIsVisible(visible);
            console.log('🔵 [BottomBar] Loaded visibility state:', visible);
            debug.info('Loaded bottom bar visibility', 'BottomBar', { visible });
        });

        // Listen for storage changes (when toggled from popup)
        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (!chrome.runtime?.id) return;
            if (changes.bottomBarVisible) {
                const visible = changes.bottomBarVisible.newValue !== false;
                setIsVisible(visible);
                console.log('🔵 [BottomBar] Visibility changed from storage:', visible);
                debug.info('Visibility changed from storage', 'BottomBar', { visible });
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);

        return () => {
            if (chrome.runtime?.id) {
                chrome.storage.onChanged.removeListener(handleStorageChange);
            }
        };
    }, []);

    const toggleVisibility = () => {
        if (!chrome.runtime?.id) return;

        const newVisibility = !isVisible;
        setIsVisible(newVisibility);
        chrome.storage.local.set({ bottomBarVisible: newVisibility }, () => {
            if (chrome.runtime.lastError) return;
            console.log('🔵 [BottomBar] Toggled visibility:', newVisibility);
            debug.action('Toggled bottom bar visibility', 'BottomBar', { visible: newVisibility });
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        debug.action('Input changed', 'BottomBar', { value, length: value.length });
    };

    const handleGeneratePrompt = () => {
        debug.action('Generate Prompt clicked', 'BottomBar');
        // Placeholder function
    };

    const handleTemplates = () => {
        debug.action('Templates clicked', 'BottomBar');
        // Placeholder function
    };

    const handlePersonas = () => {
        debug.action('Personas clicked', 'BottomBar');
        // Placeholder function
    };

    debug.info('Rendering BottomBar JSX', 'BottomBar', {
        searchValueLength: searchValue.length,
    });

    return (
        <>
            {/* Toggle Button - Always visible */}
            <button
                className="bottom-bar-toggle"
                onClick={toggleVisibility}
                title={isVisible ? 'Hide Bottom Bar' : 'Show Bottom Bar'}
            >
                {isVisible ? '▼' : '▲'}
            </button>

            {/* Bottom Bar - Conditionally visible */}
            {isVisible && (
                <div className="bottom-bar-container">
                    <div className="bottom-bar">
                        <div className="bottom-bar-content">
                            <input
                                type="text"
                                className="bottom-bar-input"
                                placeholder="Ask anything…"
                                value={searchValue}
                                onChange={handleInputChange}
                            />
                            <div className="bottom-bar-buttons">
                                <button
                                    className="bottom-bar-button"
                                    onClick={handleGeneratePrompt}
                                >
                                    Generate Prompt
                                </button>
                                <button
                                    className="bottom-bar-button"
                                    onClick={handleTemplates}
                                >
                                    Templates
                                </button>
                                <button
                                    className="bottom-bar-button"
                                    onClick={handlePersonas}
                                >
                                    Personas
                                </button>
                                <button
                                    className="bottom-bar-button"
                                    onClick={toggleVisibility}
                                    title={isVisible ? 'Hide Bottom Bar' : 'Show Bottom Bar'}
                                >
                                    {isVisible ? '▼ Hide' : '▲ Show'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BottomBar;


