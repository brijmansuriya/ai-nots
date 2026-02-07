// Background script for AI Notes extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('AI Notes Extension installed');
});

// Listener for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'AUTH_SUCCESS' || message.type === 'AUTH_LOGOUT') {
        // We can broadcast this to all tabs if needed, 
        // but the tabs are already listening to storage changes.
        // However, having this listener prevents "Receiving end does not exist" errors.
        console.log('Auth status changed:', message.type);
        sendResponse({ status: 'received' });
    }
    return true; // Keep channel open for async response
});
