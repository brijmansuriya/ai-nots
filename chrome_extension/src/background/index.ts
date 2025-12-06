// Background service worker for Chrome extension

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('AI Notes extension installed');
        // Open options page or show welcome message
    } else if (details.reason === 'update') {
        console.log('AI Notes extension updated');
    }
});

// Handle messages from popup/content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'SHOW_NOTIFICATION') {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'AI Notes',
            message: message.message || 'Action completed',
        });
    }

    if (message.type === 'SYNC_PROMPTS') {
        // Sync prompts in background
        syncPrompts()
            .then(() => sendResponse({ success: true }))
            .catch((error) => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response
    }

    return true;
});

// Periodic sync (every 15 minutes)
chrome.alarms.create('syncPrompts', { periodInMinutes: 15 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'syncPrompts') {
        syncPrompts();
    }
});

async function syncPrompts() {
    try {
        const result = await chrome.storage.local.get(['apiUrl', 'authToken']);
        if (!result.apiUrl || !result.authToken) {
            return;
        }

        // Fetch fresh prompts
        const response = await fetch(`${result.apiUrl}/dashboard/prompts`, {
            headers: {
                'Authorization': `Bearer ${result.authToken}`,
                'Accept': 'application/json',
            },
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            const prompts = data.data || [];

            // Cache prompts
            await chrome.storage.local.set({
                prompts_cache: prompts,
                prompts_cache_timestamp: Date.now(),
            });
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Listen for storage changes to invalidate cache
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.authToken) {
        // Clear cache when auth changes
        chrome.storage.local.remove(['prompts_cache', 'prompts_cache_timestamp']);
    }
});

