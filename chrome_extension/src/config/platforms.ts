export interface PlatformConfig {
    id: string;
    name: string;
    hostnames: string[];
    selectors: {
        input: string;
        container: string;
        portalClass: string;
    };
}

export const PLATFORMS: PlatformConfig[] = [
    {
        id: 'chatgpt',
        name: 'ChatGPT',
        hostnames: ['chat.openai.com', 'chatgpt.com', 'openai.com'],
        selectors: {
            input: '#prompt-textarea[contenteditable="true"]',
            container: 'form',
            portalClass: 'chatgpt-portal'
        }
    },
    {
        id: 'gemini',
        name: 'Gemini',
        hostnames: ['gemini.google.com'],
        selectors: {
            input: 'div[contenteditable="true"][role="textbox"]',
            container: '.input-area-container', // Main floating container
            portalClass: 'gemini-portal'
        }
    },
    {
        id: 'claude',
        name: 'Claude',
        hostnames: ['claude.ai'],
        selectors: {
            input: 'div[contenteditable="true"][role="textbox"]',
            container: '.sticky.bottom-0 > div, [role="presentation"] .flex.flex-col.relative, fieldset',
            portalClass: 'claude-portal'
        }
    },
    {
        id: 'grok',
        name: 'Grok',
        hostnames: ['x.com', 'twitter.com', 'grok.com'],
        selectors: {
            input: 'div[contenteditable="true"][role="textbox"][aria-label*="Grok"], [data-testid="grok-input"], [data-testid="plum_messenger_composer"], textarea',
            container: '[data-testid="toolBar"], [data-testid="grok-composer"], [role="main"], [data-testid="SideNav_AccountSubText_ID"]',
            portalClass: 'grok-portal'
        }
    },
    {
        id: 'deepseek',
        name: 'DeepSeek',
        hostnames: ['chat.deepseek.com'],
        selectors: {
            input: 'textarea, div[contenteditable="true"]',
            container: 'main, [role="main"], #root > div',
            portalClass: 'deepseek-portal'
        }
    },
    {
        id: 'perplexity',
        name: 'Perplexity',
        hostnames: ['perplexity.ai'],
        selectors: {
            input: 'textarea, [contenteditable="true"], [aria-placeholder*="Ask anything"]',
            container: '.max-w-3xl, .sticky.bottom-0, [class*="input-area"]',
            portalClass: 'perplexity-portal'
        }
    }
];

export const getPlatformConfig = (): PlatformConfig | null => {
    const hostname = window.location.hostname.toLowerCase();
    const path = window.location.pathname.toLowerCase();

    const platform = PLATFORMS.find(p => p.hostnames.some(h => hostname.includes(h)));

    // Special case for Grok - only check path if on X/Twitter
    if (platform?.id === 'grok') {
        const isX = hostname.includes('x.com') || hostname.includes('twitter.com');
        if (isX) {
            if (path.includes('/i/grok') || path.includes('/grok')) {
                return platform;
            }
            return null;
        }
        // If on grok.com, it's always the grok platform
        return platform;
    }

    return platform || null;
};
