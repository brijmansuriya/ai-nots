// Import CSS as inline strings
import contentStyles from './content.css?inline';
import aiBottomBarStyles from './components/AIBottomBar.css?inline';
import extensionDashboardStyles from './components/ExtensionDashboard.css?inline';
import indexStyles from './index.css?inline'; // Import global variables

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AIBottomBar from './components/AIBottomBar';
import { debug } from './utils/debug';
import { ThemeProvider } from './context/ThemeContext';
import { queryClient, chromeStoragePersister } from './lib/queryClient';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

// Function to inject styles
const injectStyles = () => {
    const styleId = 'ai-nots-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        ${indexStyles}
        ${contentStyles}
        ${aiBottomBarStyles}
        ${extensionDashboardStyles}
    `;
    document.head.appendChild(style);
    debug.info('Styles injected', 'ContentScript');
};

// Inject immediately
injectStyles();
// Store root reference to avoid recreating it
let rootInstance: ReturnType<typeof createRoot> | null = null;

// Check if we're on a ChatGPT page
const isChatGPTPage = (): boolean => {
    const hostname = window.location.hostname.toLowerCase();
    const isChatGPT = hostname.includes('chat.openai.com') ||
        hostname.includes('chatgpt.com') ||
        hostname.includes('openai.com');

    debug.info(`Checking if ChatGPT page: ${hostname} → ${isChatGPT}`, 'ContentScript');
    return isChatGPT;
};

// Check if we're on a Gemini page
const isGeminiPage = (): boolean => {
    const hostname = window.location.hostname.toLowerCase();
    const isGemini = hostname.includes('gemini.google.com');

    debug.info(`Checking if Gemini page: ${hostname} → ${isGemini}`, 'ContentScript');
    return isGemini;
};

// Function to render or re-render the component
const renderComponent = (container: HTMLElement) => {
    const isChatGPT = isChatGPTPage();
    const isGemini = isGeminiPage();

    // For ChatGPT/Gemini pages, render AIBottomBar
    // For other pages, render nothing
    let ComponentToRender;
    let componentName;

    if (isChatGPT || isGemini) {
        componentName = 'AIBottomBar';
        ComponentToRender = AIBottomBar;
    } else {
        // Don't render anything for non-AI pages
        componentName = 'None';
        ComponentToRender = () => null;
    }

    debug.render(componentName, { isChatGPT, isGemini, hostname: window.location.hostname });

    try {
        if (!rootInstance) {
            rootInstance = createRoot(container);
            console.log('🔵 [Content Script] Created new React root');
        }

        rootInstance.render(
            <StrictMode>
                <PersistQueryClientProvider
                    client={queryClient}
                    persistOptions={{ persister: chromeStoragePersister }}
                >
                    <ThemeProvider rootElement={container}>
                        <ComponentToRender />
                    </ThemeProvider>
                </PersistQueryClientProvider>
            </StrictMode>
        );
        console.log('🔵 [Content Script] Successfully rendered', componentName);
        debug.info(`Successfully rendered ${componentName}`, 'ContentScript');
    } catch (renderError) {
        console.error('❌ [Content Script] Failed to render component:', renderError);
        debug.error(`Failed to render ${componentName}`, 'ContentScript', renderError);
        throw renderError;
    }
};

// Function to initialize the extension
const initExtension = () => {
    // Safety check for extension context
    if (!chrome.runtime?.id) {
        console.warn('⚠️ [Content Script] Extension context invalidated. Stopping initialization.');
        return;
    }

    try {
        const isChatGPT = isChatGPTPage();
        const isGemini = isGeminiPage();

        // ONLY inject and initialize if we are on a supported AI page
        if (!isChatGPT && !isGemini) {
            debug.info('Not on a supported AI page, skipping initialization', 'ContentScript', {
                hostname: window.location.hostname
            });
            return;
        }

        console.log('🔵 [Content Script] Initializing extension for', isChatGPT ? 'ChatGPT' : 'Gemini');

        // Inject styles only when we are sure we're on a supported page
        injectStyles();

        debug.info('Initializing extension...', 'ContentScript', {
            readyState: document.readyState,
            url: window.location.href,
            hostname: window.location.hostname,
        });

        // Check if container already exists
        let container = document.getElementById('ai-notes-bottom-bar-root');

        if (!container) {
            console.log('🔵 [Content Script] Creating container element');
            debug.info('Creating container element', 'ContentScript');
            // Create a container for the React app
            container = document.createElement('div');
            container.id = 'ai-notes-bottom-bar-root';
            container.style.display = 'none'; // Hidden container for React components

            if (!document.body) {
                console.error('❌ [Content Script] document.body is null! Cannot append container.');
                debug.error('document.body is null! Cannot append container.', 'ContentScript');
                // Retry after a short delay
                setTimeout(initExtension, 100);
                return;
            }

            document.body.appendChild(container);
            console.log('🔵 [Content Script] Container appended to body', {
                containerId: container.id,
                bodyChildren: document.body.children.length,
            });
            debug.info('Container appended to body', 'ContentScript', {
                containerId: container.id,
                bodyChildren: document.body.children.length,
            });
        } else {
            console.log('🔵 [Content Script] Container already exists, reusing it');
            debug.warn('Container already exists, reusing it', 'ContentScript');
        }

        // Render the appropriate component based on the page
        renderComponent(container);
    } catch (error) {
        console.error('❌ [Content Script] Failed to initialize extension:', error);
        debug.error('Failed to initialize extension', 'ContentScript', error);
    }
};

// Wait for DOM to be ready
debug.info('Content script loaded', 'ContentScript', {
    readyState: document.readyState,
    url: window.location.href,
});

if (document.readyState === 'loading') {
    debug.info('DOM is loading, waiting for DOMContentLoaded', 'ContentScript');
    document.addEventListener('DOMContentLoaded', () => {
        debug.info('DOMContentLoaded fired, initializing extension', 'ContentScript');
        initExtension();
    });
} else {
    debug.info('DOM is already ready, initializing immediately', 'ContentScript');
    // DOM is already ready
    initExtension();
}

// Global error handlers for content script
window.addEventListener('error', (event) => {
    console.error('❌ [Content Script] Uncaught error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack,
    });
    debug.error('Uncaught error in content script', 'ContentScript', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ [Content Script] Unhandled promise rejection:', {
        reason: event.reason,
        error: event.reason instanceof Error ? {
            message: event.reason.message,
            stack: event.reason.stack,
        } : event.reason,
    });
    debug.error('Unhandled promise rejection in content script', 'ContentScript', event.reason);
});

// Listen for messages from popup
if (chrome.runtime?.id) {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        // Double check context inside listener
        if (!chrome.runtime?.id) return;

        debug.info('Message received from popup', 'ContentScript', message);

        if (message.type === 'TOGGLE_BOTTOM_BAR') {
            try {
                debug.action('Toggling bottom bar visibility', 'ContentScript', { visible: message.visible });

                // Update storage (this will trigger storage.onChanged listeners)
                if (chrome.runtime?.id) {
                    chrome.storage.local.set({ bottomBarVisible: message.visible }, () => {
                        if (chrome.runtime.lastError) return;

                        // Also directly update AI toolbar if it exists
                        const aiToolbar = document.getElementById('ai-nots-chatgpt-toolbar');
                        if (aiToolbar) {
                            aiToolbar.style.display = message.visible ? 'flex' : 'none';
                        }

                        // Re-render the component to reflect the change
                        const container = document.getElementById('ai-notes-bottom-bar-root');
                        if (container) {
                            renderComponent(container);
                        } else {
                            initExtension();
                        }
                    });
                }

                sendResponse({ success: true });
            } catch (error) {
                debug.error('Failed to toggle bottom bar', 'ContentScript', error);
                sendResponse({ success: false, error: error });
            }
            return true; // Keep the message channel open for async response
        }

        return false;
    });
}

// Also listen for page navigation (for SPAs)
let lastUrl = window.location.href;
new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;

        // Only re-initialize if we are on a supported AI site or moving to one
        const isChatGPT = isChatGPTPage();
        const isGemini = isGeminiPage();

        if (isChatGPT || isGemini) {
            debug.info('URL changed, reinitializing extension', 'ContentScript', {
                from: lastUrl,
                to: currentUrl,
            });
            console.log('🔵 [Content Script] URL changed, reinitializing:', { from: lastUrl, to: currentUrl });
            setTimeout(initExtension, 500);
        }
    }
}).observe(document, { subtree: true, childList: true });

