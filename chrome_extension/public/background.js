// Background script for AI Notes extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('AI Notes Extension installed');
});

// Listener for messages from content scripts or popup
// Listener for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'AUTH_SUCCESS' || message.type === 'AUTH_LOGOUT') {
        console.log('Auth status changed:', message.type);

        // Broadcast to all tabs to ensure content scripts update
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                if (tab.id) {
                    chrome.tabs.sendMessage(tab.id, message).catch(() => {
                        // Ignore errors for tabs where extension content script is not injected
                    });
                }
            });
        });

        sendResponse({ status: 'received' });
    }
    return true; // Keep channel open for async response
});
