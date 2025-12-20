import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import BottomBar from './components/BottomBar';
import ChatGPTDetector from './components/ChatGPTDetector';
import ChatGPTBottomBar from './components/ChatGPTBottomBar';
import { debug } from './utils/debug';
import './components/BottomBar.css';
import './components/ChatGPTDetector.css';
import './components/ChatGPTBottomBar.css';
import './content.css';

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

// Function to render or re-render the component
const renderComponent = (container: HTMLElement) => {
    const isChatGPT = isChatGPTPage();
    
    // For ChatGPT pages, render both ChatGPTDetector (for save button) and ChatGPTBottomBar (for bottom bar)
    // For other pages, render BottomBar
    let ComponentToRender;
    let componentName;
    
    if (isChatGPT) {
        // Render both components for ChatGPT
        componentName = 'ChatGPTComponents';
        ComponentToRender = () => (
            <>
                <ChatGPTDetector />
                <ChatGPTBottomBar />
            </>
        );
    } else {
        ComponentToRender = BottomBar;
        componentName = 'BottomBar';
    }

    debug.render(componentName, { isChatGPT, hostname: window.location.hostname });

    try {
        if (!rootInstance) {
            rootInstance = createRoot(container);
            console.log('🔵 [Content Script] Created new React root');
        }
        
        rootInstance.render(
            <StrictMode>
                <ComponentToRender />
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
    try {
        const isChatGPT = isChatGPTPage();
        console.log('🔵 [Content Script] Initializing extension...', {
            readyState: document.readyState,
            url: window.location.href,
            hostname: window.location.hostname,
            isChatGPT: isChatGPT,
        });
        
        debug.info('Initializing extension...', 'ContentScript', {
            readyState: document.readyState,
            url: window.location.href,
            hostname: window.location.hostname,
            isChatGPT: isChatGPT,
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
        console.log('🔵 [Content Script] Rendering component for page type:', isChatGPT ? 'ChatGPT' : 'Regular');
        renderComponent(container);
    } catch (error) {
        console.error('❌ [Content Script] Failed to initialize extension:', error);
        debug.error('Failed to initialize extension', 'ContentScript', error);
    }
};

// Wait for DOM to be ready
console.log('🔵 [Content Script] Content script loaded', {
    readyState: document.readyState,
    url: window.location.href,
});
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
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log('🔵 [Content Script] Message received:', message);
    debug.info('Message received from popup', 'ContentScript', message);
    
    if (message.type === 'TOGGLE_BOTTOM_BAR') {
        try {
            console.log('🔵 [Content Script] Toggling bottom bar visibility:', message.visible);
            debug.action('Toggling bottom bar visibility', 'ContentScript', { visible: message.visible });
            
            // Update storage (this will trigger storage.onChanged listeners)
            chrome.storage.local.set({ bottomBarVisible: message.visible }, () => {
                console.log('🔵 [Content Script] Bottom bar visibility updated in storage');
                
                // Also directly update ChatGPT toolbar if it exists
                const chatGPTToolbar = document.getElementById('ai-nots-chatgpt-toolbar');
                if (chatGPTToolbar) {
                    chatGPTToolbar.style.display = message.visible ? 'flex' : 'none';
                    console.log('🔵 [Content Script] ChatGPT toolbar visibility updated directly');
                }
                
                // Re-render the component to reflect the change (for non-ChatGPT pages)
                const container = document.getElementById('ai-notes-bottom-bar-root');
                if (container) {
                    renderComponent(container);
                    console.log('🔵 [Content Script] Component re-rendered with new visibility');
                } else {
                    console.warn('⚠️ [Content Script] Container not found, initializing extension');
                    initExtension();
                }
            });
            
            sendResponse({ success: true });
        } catch (error) {
            console.error('❌ [Content Script] Error handling toggle message:', error);
            debug.error('Failed to toggle bottom bar', 'ContentScript', error);
            sendResponse({ success: false, error: error });
        }
        return true; // Keep the message channel open for async response
    }
    
    return false;
});

console.log('🔵 [Content Script] Content script initialized with error handlers and message listener');

// Also listen for page navigation (for SPAs)
let lastUrl = window.location.href;
new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
        debug.info('URL changed, reinitializing extension', 'ContentScript', {
            from: lastUrl,
            to: currentUrl,
        });
        console.log('🔵 [Content Script] URL changed, reinitializing:', { from: lastUrl, to: currentUrl });
        lastUrl = currentUrl;
        setTimeout(initExtension, 500);
    }
}).observe(document, { subtree: true, childList: true });

